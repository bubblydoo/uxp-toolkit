/* eslint-disable no-console */
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
  Suite,
  Test,
  VitestRunner,
  VitestRunnerConfig,
} from '@vitest/runner';
import type { SnapshotStateOptions } from '@vitest/snapshot';
import type { BirpcReturn } from 'birpc';
import type * as vitestApi from 'vitest';
import type { PoolFunctions, SnapshotRuntimeConfig, WorkerFunctions } from '../rpc-types';
import type { VitestUiState } from './ui';
import * as vitestRunner from '@vitest/runner';
import { createBirpc } from 'birpc';
import * as devalue from 'devalue';
import { createUiBridge } from './ui';
import {
  configureSnapshotIO,
  configureSnapshotOptions,
  createVitestApi,
  onAfterRunFiles as onSnapshotAfterRunFiles,
  onAfterRunSuite as onSnapshotAfterRunSuite,
  onBeforeRunSuite as onSnapshotBeforeRunSuite,
  onBeforeTryTask as onSnapshotBeforeTryTask,
} from './vitest-api';

declare global {
  var require: NodeJS.Require;
  var __VITEST_CDP_WORKER_RUNNING__: boolean;
  var __vitest_cdp_rpc__: BirpcReturn<PoolFunctions, WorkerFunctions>;
  var __vitest_cdp_receive__: (serialized: string) => void;
  /** Binding created by Runtime.addBinding on the pool side for worker→pool RPC. */
  var __vitest_cdp_send__: (payload: string) => void;
  var __vitest_api__: typeof vitestApi;
  var __vitestUiUpdate: ((event: VitestUiState) => void) | undefined;
  var __vitestUiState: VitestUiState | undefined;
}

// Message handler callback registered by birpc
let messageHandler: ((data: string) => void) | null = null;

// Store for pre-bundled test code that will be "imported" by the runner
const bundledTestCode: Map<string, string> = new Map();

const ui = createUiBridge();

// expose vitest api as global object, which will be used when doing
// `import { expect } from 'vitest'` in test files
globalThis.__vitest_api__ = createVitestApi();

/**
 * Current config from the pool.
 */
let currentProjectConfig: {
  root: string;
  projectName?: string;
  allowOnly?: VitestRunnerConfig['allowOnly'];
  testNamePattern?: VitestRunnerConfig['testNamePattern'];
  passWithNoTests?: VitestRunnerConfig['passWithNoTests'];
  testTimeout?: VitestRunnerConfig['testTimeout'];
  hookTimeout?: VitestRunnerConfig['hookTimeout'];
  retry?: VitestRunnerConfig['retry'];
  maxConcurrency?: VitestRunnerConfig['maxConcurrency'];
  includeTaskLocation?: VitestRunnerConfig['includeTaskLocation'];
  sequence?: VitestRunnerConfig['sequence'];
  chaiConfig?: VitestRunnerConfig['chaiConfig'];
  diffOptions?: VitestRunnerConfig['diffOptions'];
  snapshotOptions?: {
    updateSnapshot: 'all' | 'new' | 'none';
    expand?: boolean;
    snapshotFormat?: unknown;
  };
} = {
  root: '/',
  projectName: undefined,
  allowOnly: undefined,
  testNamePattern: undefined,
  passWithNoTests: undefined,
  testTimeout: undefined,
  hookTimeout: undefined,
  retry: undefined,
  maxConcurrency: undefined,
  includeTaskLocation: undefined,
  sequence: undefined,
  chaiConfig: undefined,
  diffOptions: undefined,
  snapshotOptions: undefined,
};

/**
 * Get the runner configuration.
 */
function getRunnerConfig(): VitestRunnerConfig {
  const config = {
    root: currentProjectConfig.root,
    name: currentProjectConfig.projectName,
    setupFiles: [],
    passWithNoTests: currentProjectConfig.passWithNoTests ?? false,
    allowOnly: currentProjectConfig.allowOnly ?? false,
    testNamePattern: currentProjectConfig.testNamePattern,
    sequence: currentProjectConfig.sequence ?? {
      shuffle: false,
      concurrent: false,
      seed: Date.now(),
      hooks: 'stack',
      setupFiles: 'list',
    },
    maxConcurrency: currentProjectConfig.maxConcurrency ?? 1,
    testTimeout: currentProjectConfig.testTimeout ?? 30000,
    hookTimeout: currentProjectConfig.hookTimeout ?? 30000,
    retry: currentProjectConfig.retry ?? 0,
    includeTaskLocation: currentProjectConfig.includeTaskLocation ?? true,
    chaiConfig: currentProjectConfig.chaiConfig,
    diffOptions: currentProjectConfig.diffOptions,
  };
  return config as VitestRunnerConfig;
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
    ui.onCollected(files);

    // Forward collected files to the pool via RPC
    if (rpc) {
      await rpc.onCollected(files);
    }
  }

  /**
   * Called when tasks are updated (test results).
   */
  async onTaskUpdate(packs: unknown[], events: unknown[]): Promise<void> {
    ui.onTaskUpdate(packs);

    // Forward task updates to the pool via RPC
    if (rpc) {
      await rpc.onTaskUpdate(packs, events);
    }
  }

  async onBeforeRunSuite(suite: Suite): Promise<void> {
    await onSnapshotBeforeRunSuite(suite);
  }

  async onAfterRunSuite(suite: Suite): Promise<void> {
    await onSnapshotAfterRunSuite(suite);
  }

  onBeforeTryTask(test: Test): void {
    onSnapshotBeforeTryTask(test);
  }

  onAfterRunFiles(): void {
    onSnapshotAfterRunFiles();
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
  setConfig(config: {
    root: string;
    projectName?: string;
    allowOnly?: VitestRunnerConfig['allowOnly'];
    testNamePattern?: VitestRunnerConfig['testNamePattern'];
    passWithNoTests?: VitestRunnerConfig['passWithNoTests'];
    testTimeout?: VitestRunnerConfig['testTimeout'];
    hookTimeout?: VitestRunnerConfig['hookTimeout'];
    retry?: VitestRunnerConfig['retry'];
    maxConcurrency?: VitestRunnerConfig['maxConcurrency'];
    includeTaskLocation?: VitestRunnerConfig['includeTaskLocation'];
    sequence?: VitestRunnerConfig['sequence'];
    chaiConfig?: VitestRunnerConfig['chaiConfig'];
    diffOptions?: VitestRunnerConfig['diffOptions'];
  } & SnapshotRuntimeConfig) {
    currentProjectConfig = config;
    ui.setProjectRoot(config.root);
    if (config.snapshotOptions) {
      configureSnapshotOptions({
        ...config.snapshotOptions,
        snapshotFormat: config.snapshotOptions.snapshotFormat as SnapshotStateOptions['snapshotFormat'],
      });
    }
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
    return vitestRunner.startTests(fileSpecs, runner);
  },

  /**
   * Collect tests without running them.
   */
  async collectTests(specs: string[]): Promise<File[]> {
    if (!runner) {
      runner = new CdpVitestRunner();
    }

    const fileSpecs = specs.map(filepath => ({ filepath, testLocations: undefined }));
    return vitestRunner.collectTests(fileSpecs, runner);
  },

  /**
   * Evaluate arbitrary code (for debugging).
   */
  eval(code: string) {
    // eslint-disable-next-line no-eval
    return globalThis.eval(code);
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
      // Send via the dedicated CDP binding (created by Runtime.addBinding on the pool side).
      // Unlike console.debug, this channel is not affected by Chrome DevTools connecting.
      try {
        globalThis.__vitest_cdp_send__(data);
      }
      catch (error) {
        console.error('[vitest-cdp-worker] Runtime transport failed while sending payload', error);
        throw error;
      }
    },
    on: (fn) => {
      messageHandler = fn;
    },
    // Use devalue for serialization to handle complex types
    serialize: v => devalue.stringify(v),
    deserialize: v => devalue.parse(v as string),
  },
);

configureSnapshotIO({
  readFileIfExists: path => rpc.readFileIfExists(path),
  writeFile: (path, content) => rpc.writeFile(path, content),
  removeFile: path => rpc.removeFile(path),
});

/**
 * Global function exposed for the pool to send messages via Runtime.evaluate.
 * Receives serialized string from pool and passes to birpc for deserialization.
 */
globalThis.__vitest_cdp_receive__ = (serialized) => {
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
