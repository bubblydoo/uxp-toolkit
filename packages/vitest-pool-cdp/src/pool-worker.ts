/* eslint-disable no-console */
import type { File, TaskEventPack, TaskResultPack } from '@vitest/runner';
import type { BirpcReturn } from 'birpc';
import type { RuntimeRPC } from 'vitest';
import type { PoolOptions, PoolWorker, WorkerRequest } from 'vitest/node';
import type { PoolFunctions, WorkerFunctions } from './rpc-types';
import type { CdpConnection, EventCallback, RawCdpPoolOptions } from './types';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBirpc } from 'birpc';
import * as devalue from 'devalue';
import * as esbuild from 'esbuild';
import { injectWorkerRuntime } from './cdp-bridge';
import { evaluateInCdp } from './cdp-util';
import { StackRemapper } from './stack-remapper';
import { CDP_BINDING_NAME, CDP_RECEIVE_FUNCTION } from './types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vitestApiKeys = [
  'afterAll',
  'afterEach',
  'assert',
  'assertType',
  'beforeAll',
  'beforeEach',
  'bench',
  'BenchFactory',
  'BenchTask',
  'chai',
  'createExpect',
  'describe',
  'EvaluatedModules',
  'expect',
  'expectTypeOf',
  'Experimental',
  'inject',
  'it',
  'onTestFailed',
  'onTestFinished',
  'recordArtifact',
  'should',
  'suite',
  'test',
  'vi',
  'vitest',
];

/**
 * Custom Vitest pool worker that communicates over CDP using birpc.
 * Uses @vitest/runner in the CDP context for full Vitest compatibility.
 */
export class CdpPoolWorker implements PoolWorker {
  name = 'cdp-pool';

  private poolOptions: PoolOptions;
  private rawCdpOptions: RawCdpPoolOptions;
  private connection: CdpConnection | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private workerInjected = false;
  private log: (...args: unknown[]) => void;
  private projectRoot: string;
  /**
   * Stack remapper for sourcemap-based error stack and task location remapping.
   * Only initialized when `enableErrorSourcemapping` is true (the default).
   */
  private stackRemapper: StackRemapper | null = null;

  /**
   * birpc instance for communication with the CDP worker.
   */
  private rpc: BirpcReturn<WorkerFunctions, PoolFunctions> | null = null;

  /**
   * Message handler callback set by birpc's `on` option.
   * Receives serialized strings that birpc will deserialize.
   */
  private rpcMessageHandler: ((data: string) => void) | null = null;

  /**
   * birpc instance for communication with Vitest's pool runner.
   * This is used to call onCollected, onTaskUpdate, etc.
   */
  private vitestRpc: BirpcReturn<RuntimeRPC, object> | null = null;

  /**
   * Message handler callback for Vitest birpc's `on` option.
   * Receives messages from Vitest's pool runner.
   */
  private vitestRpcMessageHandler: ((data: unknown) => void) | null = null;

  constructor(poolOptions: PoolOptions, rawCdpOptions: RawCdpPoolOptions) {
    this.poolOptions = poolOptions;
    this.rawCdpOptions = rawCdpOptions;
    this.projectRoot = poolOptions.project.config?.root || process.cwd();
    this.log = rawCdpOptions.debug
      ? (...args: unknown[]) => console.log('[vitest-pool-cdp]', ...args)
      : () => {};

    // Error sourcemapping is on by default
    const enableErrorSourcemapping = rawCdpOptions.enableErrorSourcemapping ?? true;
    if (enableErrorSourcemapping) {
      this.stackRemapper = new StackRemapper(this.projectRoot, {
        debug: rawCdpOptions.debug,
        showOriginalStackTrace: rawCdpOptions.showBundledStackTrace,
      });
    }
  }

  /**
   * Start the worker by establishing the CDP connection and injecting the runtime.
   */
  async start(): Promise<void> {
    this.log('Starting CDP pool worker...');

    this.connection = await this.rawCdpOptions.connection();

    // Forward console output from the CDP context to the terminal
    this.connection.cdp.Runtime.on('consoleAPICalled', (event) => {
      const args = event.args?.map((arg: { value?: unknown; description?: string }) =>
        arg.value !== undefined ? arg.value : arg.description,
      );
      if (args?.length) {
        console.log(`[CDP console.${event.type}]`, ...args);
      }
    });

    if (this.rawCdpOptions.runBeforeTests) {
      this.log('Running "runBeforeTests" function...');
      await this.rawCdpOptions.runBeforeTests(this.connection.cdp);
    }

    // Listen for RPC messages via the dedicated binding channel.
    // Unlike consoleAPICalled, bindingCalled events are tied to the client
    // that created the binding, so they won't be stolen by Chrome DevTools.
    this.connection.cdp.Runtime.on('bindingCalled', (event) => {
      if (event.name !== CDP_BINDING_NAME) {
        return;
      }

      if (this.rpcMessageHandler) {
        this.log('Received birpc message from CDP binding');
        this.rpcMessageHandler(event.payload);
      }
    });

    // Inject the worker runtime if not already done
    if (!this.workerInjected) {
      const workerCode = await this.loadWorkerRuntime();
      await injectWorkerRuntime(this.connection, workerCode, this.log);
      this.workerInjected = true;
    }

    // Create the birpc instance for CDP worker communication
    this.rpc = this.createRpc();

    // Create the birpc instance for Vitest RPC communication
    this.vitestRpc = this.createVitestRpc();

    // Verify the worker is ready
    const pingResult = await this.rpc.ping();
    if (pingResult !== 'pong') {
      throw new Error('Worker runtime did not respond correctly to ping');
    }

    this.log('CDP pool worker started and verified with birpc');
  }

  /**
   * Create the birpc instance for communication with the CDP worker.
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

      onCollected: async (files: File[]) => {
        this.log('Tests collected, forwarding to Vitest:', files.length, 'files');
        // Forward collected files to Vitest via the Vitest RPC channel
        await this.forwardCollectedFiles(files);
      },

      onTaskUpdate: async (packs: unknown[]) => {
        this.log('Task update received:', packs);
        // Forward task updates to Vitest via the Vitest RPC channel
        await this.forwardTaskUpdates(packs as TaskResultPack[]);
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
        timeout: this.rawCdpOptions.rpcTimeout ?? 30000,
      },
    );
  }

  /**
   * Create the birpc instance for communication with Vitest's pool runner.
   * This is used to call onCollected, onTaskUpdate, etc.
   *
   * Note: We use flatted for serialization because File objects have circular
   * references that Vitest expects to be preserved.
   */
  private createVitestRpc(): BirpcReturn<RuntimeRPC, object> {
    return createBirpc<RuntimeRPC, object>(
      {}, // We don't expose any functions to Vitest
      {
        post: (data: unknown) => {
          // Send to Vitest via the message event
          // Messages WITHOUT __vitest_worker_response__ are routed to the "rpc" event
          this.log('Sending to Vitest RPC (pre-flatted):', JSON.stringify(data, this.circularReplacer()).slice(0, 200));
          // Emit the data as-is - birpc on pool runner side will handle it
          this.emit('message', data);
        },
        on: (fn) => {
          this.vitestRpcMessageHandler = fn;
        },
        timeout: -1, // No timeout for Vitest RPC
      },
    );
  }

  /**
   * Helper to create a JSON replacer that handles circular references for logging.
   */
  private circularReplacer() {
    const seen = new WeakSet();
    return (_key: string, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }

  /**
   * Restore circular references in File objects.
   * Vitest expects file.tasks[].file to point back to file,
   * and tasks to have suite references to their parent suite.
   *
   * These references are lost during devalue serialization over birpc
   * (CDP worker → pool worker), so we rebuild them here.
   */
  private restoreFileReferences(files: File[]): File[] {
    const restoreTask = (task: File['tasks'][0], file: File, parentSuite?: File['tasks'][0]): void => {
      // Point task.file back to the root file
      (task as unknown as { file: File }).file = file;

      // Point task.suite back to its parent suite
      if (parentSuite && 'suite' in task) {
        (task as unknown as { suite: File['tasks'][0] }).suite = parentSuite;
      }

      // Recurse into nested tasks (suites contain sub-tasks)
      if ('tasks' in task && task.tasks) {
        for (const subtask of task.tasks) {
          restoreTask(subtask, file, task);
        }
      }
    };

    for (const file of files) {
      // File.file should point to itself
      file.file = file;

      for (const task of file.tasks) {
        restoreTask(task, file);
      }
    }

    return files;
  }

  /**
   * Forward collected files from the CDP worker to Vitest via the RPC channel.
   * This is called during test collection (after imports, before execution).
   */
  private async forwardCollectedFiles(files: File[]): Promise<void> {
    if (!this.vitestRpc) {
      this.log('Warning: vitestRpc not initialized, cannot forward collected files');
      return;
    }

    // Restore circular references in the files
    const restoredFiles = this.restoreFileReferences(files);

    // Remap error stacks and task locations from bundled code to original source
    if (this.stackRemapper) {
      for (const file of restoredFiles) {
        if (file.result) {
          this.stackRemapper.remapErrorStacks(file.result);
        }
        this.stackRemapper.remapTaskLocations(file.tasks);
      }
    }

    this.log('Forwarding collected files to Vitest:', restoredFiles.length, 'files');
    await this.vitestRpc.onCollected(restoredFiles);
  }

  /**
   * Forward task updates from the CDP worker to Vitest via the RPC channel.
   */
  private async forwardTaskUpdates(packs: TaskResultPack[]): Promise<void> {
    if (!this.vitestRpc) {
      this.log('Warning: vitestRpc not initialized, cannot forward task updates');
      return;
    }

    for (const [taskId, result, meta] of packs) {
      this.log(`Task ${taskId} updated:`, result, meta);
      // Remap error stacks in task results
      if (result && this.stackRemapper) {
        this.stackRemapper.remapErrorStacks(result);
      }
    }

    // Convert packs to events - each pack gets a corresponding event
    const events: TaskEventPack[] = [];

    // Call Vitest's onTaskUpdate RPC method
    await this.vitestRpc.onTaskUpdate(packs, events);
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
   * Stop the worker by closing the CDP connection.
   */
  async stop(): Promise<void> {
    this.log('Stopping CDP pool worker...');

    this.rpc = null;
    this.rpcMessageHandler = null;
    this.vitestRpc = null;
    this.vitestRpcMessageHandler = null;

    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
    }

    // Emit stopped response BEFORE clearing listeners so Vitest receives it
    this.emit('message', {
      type: 'stopped',
      __vitest_worker_response__: true,
    });
    this.log('Emitted stopped response');

    this.eventListeners.clear();
    this.workerInjected = false;

    this.log('CDP pool worker stopped');
  }

  /**
   * Send a message to the worker in the CDP context.
   * This is called by Vitest with WorkerRequest messages or birpc RPC messages.
   * We intercept these and handle them with our hybrid approach.
   */
  send(message: WorkerRequest): void {
    this.log('Received message from Vitest:', JSON.stringify(message).slice(0, 200));

    // Handle Vitest worker requests (control messages)
    if (this.isVitestWorkerRequest(message)) {
      this.handleVitestRequest(message).catch((error) => {
        console.error('[vitest-pool-cdp] Error handling Vitest request:', error);
        this.emit('error', error);
      });
      return;
    }

    // Handle birpc RPC messages from Vitest (e.g., onCancel, or responses to our calls)
    // These don't have __vitest_worker_request__ and are meant for the RPC channel
    if (this.vitestRpcMessageHandler) {
      this.log('Routing to Vitest RPC handler, message:', JSON.stringify(message).slice(0, 200));
      try {
        this.vitestRpcMessageHandler(message);
        this.log('Vitest RPC handler completed');
      }
      catch (error) {
        this.log('Vitest RPC handler threw error:', error);
        throw error;
      }
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

      try {
        await this.processTestFiles(files, method);
      }
      catch (error) {
        this.log('Error processing test files:', error);
        this.emit('error', error);
      }

      // Signal that we're done with all files
      // Vitest expects type: "testfileFinished" (see cli-api.B7PN_QUv.js:8033)
      this.log('Emitting testfileFinished message');
      this.emit('message', {
        type: 'testfileFinished',
        __vitest_worker_response__: true,
      });
      this.log('testfileFinished message emitted');
      return;
    }

    if (msg.type === 'stop') {
      // Vitest wants to stop the worker
      this.log('Received stop request, stopping worker');
      await this.stop();
      // Note: stopped response is emitted inside stop()
      return;
    }

    this.log('Unhandled Vitest request type:', msg.type);
  }

  /**
   * Process test files: bundle, send to CDP, and run/collect via @vitest/runner.
   */
  private async processTestFiles(filePaths: string[], method: 'run' | 'collect'): Promise<void> {
    if (!this.rpc) {
      throw new Error('RPC not initialized');
    }
    if (!this.vitestRpc) {
      throw new Error('Vitest RPC not initialized');
    }

    // Configure the worker with project settings
    const projectRoot = this.poolOptions.project.config?.root || process.cwd();
    const projectName = this.poolOptions.project.config?.name;
    this.log(`Setting config: root=${projectRoot}, projectName=${projectName}`);
    this.rpc.setConfig({ root: projectRoot, projectName });

    // Bundle and send each test file to the worker
    for (const filePath of filePaths) {
      this.log(`Processing test file: ${filePath}`);

      // Bundle the test file
      const bundledCode = await this.bundleTestFile(filePath);

      // Send the bundled code to the worker
      await this.rpc.setBundledCode(filePath, bundledCode);
    }

    // Now run or collect all files
    let results: File[];
    if (method === 'run') {
      this.log('Running tests in CDP via @vitest/runner...');
      results = await this.rpc.runTests(filePaths);
    }
    else {
      this.log('Collecting tests in CDP via @vitest/runner...');
      results = await this.rpc.collectTests(filePaths);
    }

    this.log('Test results:', results);
    this.log('processTestFiles completed');
  }

  /**
   * Bundle a test file using esbuild for execution in CDP.
   */
  private async bundleTestFile(filePath: string): Promise<string> {
    this.log('Bundling test file:', filePath);

    // Get the project root for resolving imports
    const projectRoot = this.poolOptions.project.config?.root
      || process.cwd();

    // Generate sourcemaps if either embedSourcemap or enableErrorSourcemapping needs them
    const needsSourcemap = this.rawCdpOptions.embedSourcemap || !!this.stackRemapper;

    const result = await esbuild.build({
      entryPoints: [filePath],
      bundle: true,
      outdir: '.', // this is important for sourcemap code frame generation
      write: false,
      format: 'iife',
      // Use 'neutral' platform - this makes esbuild generate simpler require calls
      platform: 'neutral',
      // Main fields for neutral platform - look for module then main
      mainFields: ['module', 'main'],
      target: 'es2022',
      sourcemap: needsSourcemap ? 'external' : false,
      define: this.rawCdpOptions.esbuildOptions?.define || {},
      alias: this.rawCdpOptions.esbuildOptions?.alias || {},
      absWorkingDir: projectRoot,
      // Mark vitest, runner packages, and UXP/Node built-in modules as external
      // These are provided by the worker runtime
      external: [
        'vitest',
        '@vitest/runner',
        '@vitest/expect',
        '@vitest/utils',
        'photoshop',
        'uxp',
        'fs',
        'os',
        'path',
        'process',
        ...(this.rawCdpOptions.esbuildOptions?.external || []),
      ],
      plugins: [
        {
          name: 'vitest-api',
          setup(build) {
            // Replace vitest imports with globalThis.__vitest_api__ references
            build.onResolve({ filter: /^vitest$/ }, () => ({
              path: 'vitest',
              namespace: 'vitest-api',
            }));
            build.onLoad({ filter: /.*/, namespace: 'vitest-api' }, () => {
              const code = vitestApiKeys.map(key => `export const ${key} = globalThis.__vitest_api__.${key};`).join('\n');
              return {
                contents: code,
                loader: 'js',
              };
            });
          },
        },
        ...(this.rawCdpOptions.esbuildOptions?.plugins || []),
      ],
    });

    if (result.errors.length > 0) {
      throw new Error(`Failed to bundle ${filePath}: ${result.errors.map(e => e.text).join(', ')}`);
    }

    const outputFiles = result.outputFiles;
    if (!outputFiles) {
      throw new Error(`No output files from bundling ${filePath}`);
    }

    const jsOutputFile = outputFiles.find(file => file.path.endsWith('.js'));
    if (!jsOutputFile) {
      throw new Error(`No JS output file from bundling ${filePath}`);
    }
    const code = jsOutputFile.text;
    this.log(`Bundled ${filePath}: ${code.length} bytes`);

    let output = code;

    if (needsSourcemap) {
      const sourcemapFile = outputFiles.find(file => file.path.endsWith('.js.map'));
      if (!sourcemapFile) {
        throw new Error(`No sourcemap output from bundling ${filePath}`);
      }

      const sourcemapText = sourcemapFile.text;

      // Store sourcemap for error remapping (if enabled)
      if (this.stackRemapper) {
        this.stackRemapper.storeSourceMap('eval-anonymous', sourcemapText);
      }

      // Embed sourcemap as EVAL_SOURCEMAP variable for in-context use (if enabled)
      if (this.rawCdpOptions.embedSourcemap) {
        this.log(`Embedding sourcemap for ${filePath}: ${sourcemapText.length} bytes`);
        output = `${output}\nvar EVAL_SOURCEMAP = ${JSON.stringify(sourcemapText)};`;
      }
    }

    return output;
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

  public canReuse(): boolean {
    return true;
  }
}
