/* eslint-disable ts/no-use-before-define */
/* eslint-disable vars-on-top */
/**
 * Worker runtime that gets injected into the CDP context.
 * This file is bundled as an IIFE and injected via Runtime.evaluate.
 *
 * It uses @vitest/runner for test execution and chai with @vitest/expect
 * plugins for assertions, providing full Vitest compatibility.
 */

import type {
  File,
  SuiteAPI,
  TestAPI,
  VitestRunner,
  VitestRunnerConfig,
} from '@vitest/runner';
import type { BirpcReturn } from 'birpc';
import type { PoolFunctions, WorkerFunctions } from './rpc-types';
import {
  JestAsymmetricMatchers,
  JestChaiExpect,
  JestExtend,
} from '@vitest/expect';
import {
  afterAll as runnerAfterAll,
  afterEach as runnerAfterEach,
  beforeAll as runnerBeforeAll,
  beforeEach as runnerBeforeEach,
  describe as runnerDescribe,
  it as runnerIt,
  suite as runnerSuite,
  test as runnerTest,
  startTests,
  collectTests as vitestCollectTests,
} from '@vitest/runner';
import { createBirpc } from 'birpc';
import * as chai from 'chai';
import * as devalue from 'devalue';

// Re-export with original names for use in this file
const describe = runnerDescribe;
const it = runnerIt;
const test = runnerTest;
const suite = runnerSuite;
const beforeAll = runnerBeforeAll;
const afterAll = runnerAfterAll;
const beforeEach = runnerBeforeEach;
const afterEach = runnerAfterEach;

declare global {
  var require: NodeJS.Require;
  var __VITEST_CDP_WORKER_RUNNING__: boolean;
  var __vitest_cdp_rpc__: BirpcReturn<PoolFunctions, WorkerFunctions>;
  // Test globals - use the proper types from @vitest/runner
  var describe: SuiteAPI;
  var it: TestAPI;
  var test: TestAPI;
  var suite: SuiteAPI;
  var expect: Chai.ExpectStatic;
  var beforeAll: typeof runnerBeforeAll;
  var afterAll: typeof runnerAfterAll;
  var beforeEach: typeof runnerBeforeEach;
  var afterEach: typeof runnerAfterEach;
}

const MESSAGE_PREFIX = '__VITEST_CDP_MSG__';

// Message handler callback registered by birpc
let messageHandler: ((data: string) => void) | null = null;

// Store for pre-bundled test code that will be "imported" by the runner
const bundledTestCode: Map<string, string> = new Map();

/**
 * Set up chai with Vitest's expect plugins.
 */
chai.use(JestExtend);
chai.use(JestChaiExpect);
chai.use(JestAsymmetricMatchers);

/**
 * The expect function with Vitest's matchers.
 */
const expect = chai.expect;

/**
 * Expose test globals.
 */
globalThis.describe = describe;
globalThis.it = it;
globalThis.test = test;
globalThis.suite = suite;
globalThis.expect = expect;
globalThis.beforeAll = beforeAll;
globalThis.afterAll = afterAll;
globalThis.beforeEach = beforeEach;
globalThis.afterEach = afterEach;

/**
 * Current config from the pool.
 */
let currentProjectConfig: { root: string; projectName?: string } = {
  root: '/',
  projectName: undefined,
};

/**
 * Get the runner configuration.
 */
function getRunnerConfig(): VitestRunnerConfig {
  return {
    root: currentProjectConfig.root,
    setupFiles: [],
    passWithNoTests: false,
    sequence: {
      shuffle: false,
      concurrent: false,
      seed: Date.now(),
      hooks: 'stack',
      setupFiles: 'list',
    },
    maxConcurrency: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
    retry: 0,
    includeTaskLocation: true,
  };
}

/**
 * Custom VitestRunner that executes pre-bundled test code.
 */
class CdpVitestRunner implements VitestRunner {
  config: VitestRunnerConfig;
  pool = 'cdp';

  constructor(config: Partial<VitestRunnerConfig> = {}) {
    this.config = { ...getRunnerConfig(), ...config };
  }

  /**
   * Import a test file by evaluating its pre-bundled code.
   */
  async importFile(filepath: string, _source: 'collect' | 'setup'): Promise<void> {
    const code = bundledTestCode.get(filepath);
    if (!code) {
      throw new Error(`No bundled code found for: ${filepath}`);
    }

    // Execute the bundled code - this will call describe/it/test which register tests
    // eslint-disable-next-line no-eval
    globalThis.eval(code);
  }

  /**
   * Called when tests are collected (after imports, before execution).
   * This notifies Vitest about the test structure.
   */
  async onCollected(files: File[]): Promise<void> {
    // Forward collected files to the pool via RPC
    if (rpc) {
      await rpc.onCollected(files);
    }
  }

  /**
   * Called when tasks are updated (test results).
   */
  async onTaskUpdate(packs: unknown[]): Promise<void> {
    // Forward task updates to the pool via RPC
    if (rpc) {
      await rpc.onTaskUpdate(packs);
    }
  }
}

/**
 * The runner instance.
 */
let runner: CdpVitestRunner | null = null;

/**
 * Worker functions exposed to the pool via birpc.
 */
const workerFunctions: WorkerFunctions = {
  ping() {
    return 'pong';
  },

  /**
   * Configure the runner with project settings.
   */
  setConfig(config: { root: string; projectName?: string }) {
    currentProjectConfig = config;
    // Reset runner so it picks up the new config
    runner = null;
  },

  /**
   * Store bundled test code for later execution.
   */
  setBundledCode(filepath: string, code: string) {
    bundledTestCode.set(filepath, code);
  },

  /**
   * Run tests for the given file specs.
   */
  async runTests(specs: string[]): Promise<File[]> {
    if (!runner) {
      runner = new CdpVitestRunner();
    }

    const fileSpecs = specs.map(filepath => ({ filepath, testLocations: undefined }));
    return startTests(fileSpecs, runner);
  },

  /**
   * Collect tests without running them.
   */
  async collectTests(specs: string[]): Promise<File[]> {
    if (!runner) {
      runner = new CdpVitestRunner();
    }

    const fileSpecs = specs.map(filepath => ({ filepath, testLocations: undefined }));
    return vitestCollectTests(fileSpecs, runner);
  },

  /**
   * Evaluate arbitrary code (for debugging).
   */
  eval(code: string) {
    // eslint-disable-next-line no-eval
    return globalThis.eval(code);
  },

  getGlobals() {
    return {
      hasPhotoshop: typeof globalThis.require === 'function',
      hasUxp: typeof globalThis.require === 'function',
    };
  },
};

/**
 * Create the birpc instance for communication with the pool.
 * Uses devalue for serialization to handle complex objects, dates, etc.
 */
const rpc = createBirpc<PoolFunctions, WorkerFunctions>(
  workerFunctions,
  {
    post: (data: string) => {
      // data is already serialized by birpc using devalue.stringify
      console.debug(MESSAGE_PREFIX, data);
    },
    on: (fn) => {
      messageHandler = fn;
    },
    // Use devalue for serialization to handle complex types
    serialize: v => devalue.stringify(v),
    deserialize: v => devalue.parse(v as string),
  },
);

/**
 * Global function exposed for the pool to send messages via Runtime.evaluate.
 * Receives serialized string from pool and passes to birpc for deserialization.
 */
(globalThis as Record<string, unknown>).__vitest_cdp_receive__ = (serialized: string): void => {
  try {
    if (messageHandler) {
      // Pass the serialized string directly to birpc - it will deserialize
      messageHandler(serialized);
    }
  }
  catch (error) {
    console.error('[vitest-cdp-worker] Error processing message:', error);
  }
};

/**
 * Mark that the CDP worker runtime is active.
 */
globalThis.__VITEST_CDP_WORKER_RUNNING__ = true;

/**
 * Expose the RPC instance globally for use in test code if needed.
 */
globalThis.__vitest_cdp_rpc__ = rpc;

// Log that the worker runtime has been initialized
console.log('[vitest-cdp-worker] Worker runtime initialized with @vitest/runner');
