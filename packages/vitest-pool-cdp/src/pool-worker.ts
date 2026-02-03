import type { BirpcReturn } from 'birpc';
import type { PoolOptions, PoolWorker, WorkerRequest } from 'vitest/node';
import type { CollectedTests, PoolFunctions, TestResult, TestRunResult, WorkerFunctions } from './rpc-types';
import type { CdpConnection, CdpPoolOptions, EventCallback } from './types';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBirpc } from 'birpc';
import * as devalue from 'devalue';
import * as esbuild from 'esbuild';
import {
  injectWorkerRuntime,
  setupCdpConnection,
} from './cdp-bridge';
import { evaluateInCdp } from './cdp-util';
import { TEST_RUNTIME_CODE } from './test-runtime';
import { CDP_MESSAGE_PREFIX, CDP_RECEIVE_FUNCTION } from './types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Custom Vitest pool worker that communicates over CDP using birpc.
 * Uses a hybrid approach where test transformation happens in Node.js
 * and execution happens in the CDP context.
 */
export class CdpPoolWorker implements PoolWorker {
  name = 'cdp-pool';

  private poolOptions: PoolOptions;
  private cdpOptions: CdpPoolOptions;
  private connection: CdpConnection | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private workerInjected = false;
  private log: (...args: unknown[]) => void;

  /**
   * birpc instance for communication with the worker.
   */
  private rpc: BirpcReturn<WorkerFunctions, PoolFunctions> | null = null;

  /**
   * Message handler callback set by birpc's `on` option.
   * Receives serialized strings that birpc will deserialize.
   */
  private rpcMessageHandler: ((data: string) => void) | null = null;

  constructor(poolOptions: PoolOptions, cdpOptions: CdpPoolOptions) {
    this.poolOptions = poolOptions;
    this.cdpOptions = cdpOptions;
    this.log = cdpOptions.debug
      ? (...args: unknown[]) => console.log('[vitest-pool-cdp]', ...args)
      : () => {};
  }

  /**
   * Start the worker by establishing the CDP connection and injecting the runtime.
   */
  async start(): Promise<void> {
    this.log('Starting CDP pool worker...');

    // Get the CDP URL (may be a function)
    const cdpUrl = typeof this.cdpOptions.cdpUrl === 'function'
      ? await this.cdpOptions.cdpUrl()
      : this.cdpOptions.cdpUrl;

    // Establish CDP connection
    this.connection = await setupCdpConnection(cdpUrl, this.cdpOptions, this.log);

    // Set up console message listener for responses from the worker
    this.connection.cdp.Runtime.on('consoleAPICalled', (event) => {
      // Log all console messages in debug mode
      if (this.cdpOptions.debug && event.type !== 'debug') {
        const args = event.args?.map((arg: { value?: unknown; description?: string }) =>
          arg.value !== undefined ? arg.value : arg.description,
        );
        this.log(`[CDP console.${event.type}]`, ...(args || []));
      }

      // Only process debug messages for our protocol
      if (event.type !== 'debug') {
        return;
      }

      // Parse the console message for birpc messages
      const message = this.parseConsoleMessage(event.args);
      if (message !== null && this.rpcMessageHandler) {
        this.log('Received birpc message from CDP:', message);
        this.rpcMessageHandler(message);
      }
    });

    // Inject the worker runtime if not already done
    if (!this.workerInjected) {
      const workerCode = await this.loadWorkerRuntime();
      await injectWorkerRuntime(this.connection, workerCode, this.log);
      this.workerInjected = true;

      // Inject the test runtime (describe/it/expect/etc.)
      await this.injectTestRuntime();
    }

    // Create the birpc instance
    this.rpc = this.createRpc();

    // Verify the worker is ready
    const pingResult = await this.rpc.ping();
    if (pingResult !== 'pong') {
      throw new Error('Worker runtime did not respond correctly to ping');
    }

    this.log('CDP pool worker started and verified with birpc');
  }

  /**
   * Create the birpc instance for communication with the worker.
   * Uses devalue for serialization to handle complex objects, dates, etc.
   */
  private createRpc(): BirpcReturn<WorkerFunctions, PoolFunctions> {
    const poolFunctions: PoolFunctions = {
      log: (...args: unknown[]) => {
        this.log('[Worker]', ...args);
      },

      readFile: async (filePath: string) => {
        return fsp.readFile(filePath, 'utf-8');
      },
    };

    return createBirpc<WorkerFunctions, PoolFunctions>(
      poolFunctions,
      {
        post: (data: string) => {
          // data is already serialized by birpc using devalue.stringify
          this.sendToCdp(data);
        },
        on: (fn) => {
          this.rpcMessageHandler = fn;
        },
        // Use devalue for serialization to handle complex types
        serialize: v => devalue.stringify(v),
        deserialize: v => devalue.parse(v as string),
        timeout: this.cdpOptions.rpcTimeout ?? 30000,
      },
    );
  }

  /**
   * Send a serialized message to the CDP context via Runtime.evaluate.
   */
  private async sendToCdp(serialized: string): Promise<void> {
    if (!this.connection) {
      throw new Error('CDP connection not established');
    }

    // Escape for JavaScript string literal
    const escaped = serialized
      .replace(/\\/g, '\\\\')
      .replace(/'/g, '\\\'')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');

    const expression = `${CDP_RECEIVE_FUNCTION}('${escaped}')`;

    this.log('Sending birpc message to CDP');

    await evaluateInCdp(this.connection, expression, { awaitPromise: false, returnByValue: false });
  }

  /**
   * Parse a console message to extract birpc messages.
   * Returns the serialized string (not parsed) - birpc will deserialize it.
   */
  private parseConsoleMessage(args: Array<{ type: string; value?: unknown }>): string | null {
    // Our messages are sent as: console.debug("__VITEST_CDP_MSG__", serializedData)
    if (args.length !== 2) {
      return null;
    }

    const [prefix, data] = args;

    // Check if first argument is our message prefix
    if (prefix.type !== 'string' || prefix.value !== CDP_MESSAGE_PREFIX) {
      return null;
    }

    // Second argument should be the serialized message string
    if (data.type !== 'string' || typeof data.value !== 'string') {
      return null;
    }

    // Return the serialized string - birpc will deserialize it
    return data.value;
  }

  /**
   * Inject the test runtime (vitest-compatible describe/it/expect) into CDP.
   */
  private async injectTestRuntime(): Promise<void> {
    if (!this.connection) {
      throw new Error('CDP connection not established');
    }

    this.log('Injecting test runtime...');

    this.log(TEST_RUNTIME_CODE);

    await evaluateInCdp(this.connection, TEST_RUNTIME_CODE, { awaitPromise: true, returnByValue: true });

    this.log('Test runtime injected successfully');
  }

  /**
   * Stop the worker by closing the CDP connection.
   */
  async stop(): Promise<void> {
    this.log('Stopping CDP pool worker...');

    this.rpc = null;
    this.rpcMessageHandler = null;

    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
    }

    this.eventListeners.clear();
    this.workerInjected = false;

    this.log('CDP pool worker stopped');
  }

  /**
   * Send a message to the worker in the CDP context.
   * This is called by Vitest with WorkerRequest messages.
   * We intercept these and handle them with our hybrid approach.
   */
  send(message: WorkerRequest): void {
    this.log('Received message from Vitest:', JSON.stringify(message).slice(0, 200));

    // Handle Vitest worker requests
    if (this.isVitestWorkerRequest(message)) {
      this.handleVitestRequest(message).catch((error) => {
        console.error('[vitest-pool-cdp] Error handling Vitest request:', error);
        this.emit('error', error);
      });
      return;
    }

    this.log('Unhandled message type:', message);
  }

  /**
   * Check if a message is a Vitest worker request.
   */
  private isVitestWorkerRequest(message: unknown): message is WorkerRequest & { __vitest_worker_request__: true } {
    return (
      typeof message === 'object'
      && message !== null
      && '__vitest_worker_request__' in message
      && (message as Record<string, unknown>).__vitest_worker_request__ === true
    );
  }

  /**
   * Handle Vitest worker requests using the hybrid approach.
   */
  private async handleVitestRequest(message: WorkerRequest): Promise<void> {
    const msg = message as Record<string, unknown>;

    if (msg.type === 'start') {
      // Worker started - send "started" acknowledgment
      this.emit('message', {
        type: 'started',
        __vitest_worker_response__: true,
      });
      return;
    }

    if (msg.type === 'run' || msg.type === 'collect') {
      // Run or collect tests
      const context = msg.context as { files: Array<{ filepath: string }> };
      const files = context.files.map(f => f.filepath);
      const method = msg.type as 'run' | 'collect';

      this.log(`${method === 'run' ? 'Running' : 'Collecting'} tests for files:`, files);

      for (const file of files) {
        try {
          await this.processTestFile(file, method);
        }
        catch (error) {
          this.log(`Error processing ${file}:`, error);
          // Report the error as a failed test
          this.emitTestResult(file, {
            name: path.basename(file),
            fullName: file,
            status: 'fail',
            duration: 0,
            error: {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          });
        }
      }

      // Signal that we're done with all files
      this.emit('message', {
        type: 'done',
        __vitest_worker_request__: true,
      });
      return;
    }

    this.log('Unhandled Vitest request type:', msg.type);
  }

  /**
   * Process a single test file: bundle, send to CDP, execute, report results.
   */
  private async processTestFile(filePath: string, method: 'run' | 'collect'): Promise<void> {
    if (!this.rpc) {
      throw new Error('RPC not initialized');
    }

    this.log(`Processing test file: ${filePath}`);

    // Bundle the test file
    const bundledCode = await this.bundleTestFile(filePath);

    // Reset test state in CDP
    await this.rpc.eval('__vitest_reset__()');

    // Execute the bundled test code (this registers describe/it)
    this.log('Executing test code in CDP...');
    await this.rpc.eval(bundledCode);

    if (method === 'collect') {
      // Just collect test info without running
      const collected = await this.rpc.eval('__vitest_collect_tests__()') as CollectedTests;

      this.log('Collected tests:', collected);

      // Report collected tests
      for (const test of collected.tests) {
        this.emitTestResult(filePath, {
          name: test.name,
          fullName: test.fullName,
          status: test.skip ? 'skip' : 'pass',
          duration: 0,
        });
      }
    }
    else {
      // Run the tests
      this.log('Running tests in CDP...');
      const runResult = await this.rpc.eval('__vitest_run_tests__()') as TestRunResult;

      this.log('Test results:', runResult);

      // Report each test result
      for (const result of runResult.results) {
        this.emitTestResult(filePath, result);
      }
    }
  }

  /**
   * Bundle a test file using esbuild for execution in CDP.
   */
  private async bundleTestFile(filePath: string): Promise<string> {
    this.log('Bundling test file:', filePath);

    // Get the project root for resolving imports
    const projectRoot = this.poolOptions.project.config?.root
      || process.cwd();

    const result = await esbuild.build({
      entryPoints: [filePath],
      bundle: true,
      write: false,
      format: 'iife',
      // Use 'neutral' platform - this makes esbuild generate simpler require calls
      platform: 'neutral',
      // Main fields for neutral platform - look for module then main
      mainFields: ['module', 'main'],
      target: 'es2022',
      sourcemap: 'inline',
      // Mark vitest and UXP/Node built-in modules as external
      // This preserves native require() calls for these modules
      external: [
        'vitest',
        'photoshop',
        'uxp',
        'fs',
        'os',
        'path',
        'process',
        'shell',
        'http',
        'https',
        'url',
        'util',
        'crypto',
        'stream',
        'zlib',
      ],
      // Define globals for vitest imports
      banner: {
        js: `
// Vitest globals provided by test runtime
const { describe, it, test, expect, beforeAll, afterAll, beforeEach, afterEach } = globalThis;
`,
      },
      // Handle vitest imports by replacing them with global references
      plugins: [
        {
          name: 'vitest-globals',
          setup(build) {
            // Replace vitest imports with empty module (globals are already defined)
            build.onResolve({ filter: /^vitest$/ }, () => ({
              path: 'vitest',
              namespace: 'vitest-globals',
            }));
            build.onLoad({ filter: /.*/, namespace: 'vitest-globals' }, () => ({
              contents: `
export const describe = globalThis.describe;
export const it = globalThis.it;
export const test = globalThis.test;
export const expect = globalThis.expect;
export const beforeAll = globalThis.beforeAll;
export const afterAll = globalThis.afterAll;
export const beforeEach = globalThis.beforeEach;
export const afterEach = globalThis.afterEach;
export const vi = {
  fn: () => {
    const mockFn = (...args) => mockFn.mock.results.push({ value: undefined });
    mockFn.mock = { calls: [], results: [] };
    mockFn.mockReturnValue = (v) => { mockFn._returnValue = v; return mockFn; };
    mockFn.mockImplementation = (fn) => { mockFn._impl = fn; return mockFn; };
    return mockFn;
  },
  spyOn: () => {},
  mock: () => {},
  unmock: () => {},
  resetAllMocks: () => {},
  clearAllMocks: () => {},
};
              `,
              loader: 'js',
            }));
          },
        },
      ],
      // Resolve from the project root
      absWorkingDir: projectRoot,
    });

    if (result.errors.length > 0) {
      throw new Error(`Failed to bundle ${filePath}: ${result.errors.map(e => e.text).join(', ')}`);
    }

    const code = result.outputFiles?.[0]?.text;
    if (!code) {
      throw new Error(`No output from bundling ${filePath}`);
    }

    this.log(`Bundled ${filePath}: ${code.length} bytes`);
    return code;
  }

  /**
   * Emit a test result to Vitest.
   */
  private emitTestResult(filePath: string, result: TestResult): void {
    // Convert our result format to Vitest's expected format
    const vitestResult = {
      type: 'test-result',
      __vitest_worker_request__: true,
      file: filePath,
      name: result.fullName,
      state: result.status === 'pass' ? 'pass' : result.status === 'fail' ? 'fail' : 'skip',
      duration: result.duration,
      errors: result.error
        ? [{
            message: result.error.message,
            stack: result.error.stack,
            expected: result.error.expected,
            actual: result.error.actual,
          }]
        : [],
    };

    this.emit('message', vitestResult);
  }

  /**
   * Register an event listener.
   */
  on(event: string, callback: EventCallback): void {
    let listeners = this.eventListeners.get(event);
    if (!listeners) {
      listeners = new Set();
      this.eventListeners.set(event, listeners);
    }
    listeners.add(callback);
  }

  /**
   * Remove an event listener.
   */
  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Deserialize data received from the worker.
   */
  deserialize(data: unknown): unknown {
    return data;
  }

  /**
   * Emit an event to all registered listeners.
   */
  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        }
        catch (error) {
          console.error(`[vitest-pool-cdp] Error in ${event} listener:`, error);
        }
      }
    }
  }

  /**
   * Load the worker runtime code from the bundled IIFE file.
   */
  private async loadWorkerRuntime(): Promise<string> {
    const possiblePaths = [
      path.join(__dirname, 'worker-runtime.global.js'),
      path.join(__dirname, '../dist/worker-runtime.global.js'),
    ];

    for (const filePath of possiblePaths) {
      try {
        const code = fs.readFileSync(filePath, 'utf-8');
        this.log('Loaded worker runtime from:', filePath);
        return code;
      }
      catch {
        // Try next path
      }
    }

    throw new Error(
      `Could not find worker runtime. Tried: ${possiblePaths.join(', ')}. `
      + 'Make sure to run `pnpm build` in the vitest-pool-cdp package.',
    );
  }
}
