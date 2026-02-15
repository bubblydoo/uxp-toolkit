/**
 * Shared RPC types for communication between the pool (Node.js) and worker (CDP context).
 * These types define the bidirectional function interfaces used by birpc.
 */

import type { File, VitestRunnerConfig } from '@vitest/runner';

type RunnerConfigKeys =
  | 'allowOnly'
  | 'testNamePattern'
  | 'passWithNoTests'
  | 'testTimeout'
  | 'hookTimeout'
  | 'retry'
  | 'maxConcurrency'
  | 'includeTaskLocation'
  | 'sequence'
  | 'chaiConfig'
  | 'diffOptions';

export type RunnerRuntimeConfig = Partial<Pick<VitestRunnerConfig, RunnerConfigKeys>>;

export type SnapshotRuntimeConfig = {
  snapshotOptions?: {
    updateSnapshot: 'all' | 'new' | 'none';
    expand?: boolean;
    snapshotFormat?: unknown;
  };
};

/**
 * Functions exposed by the worker (CDP context) that the pool can call.
 */
export interface WorkerFunctions {
  /**
   * Ping the worker to verify connectivity.
   */
  ping: () => 'pong';

  /**
   * Configure the runner with project settings.
   * Must be called before running tests.
   */
  setConfig: (config: {
    root: string;
    projectName?: string;
  } & RunnerRuntimeConfig & SnapshotRuntimeConfig) => void;

  /**
   * Store bundled test code for a file path.
   * The code will be executed when the runner imports the file.
   */
  setBundledCode: (filepath: string, code: string) => void;

  /**
   * Run tests for the given file specs.
   * Returns the File objects with test results.
   */
  runTests: (specs: string[]) => Promise<File[]>;

  /**
   * Collect tests without running them.
   * Returns the File objects with collected test info.
   */
  collectTests: (specs: string[]) => Promise<File[]>;

  /**
   * Evaluate arbitrary code in the CDP context (for debugging).
   */
  eval: (code: string) => unknown;
}

/**
 * Functions exposed by the pool (Node.js) that the worker can call.
 */
export interface PoolFunctions {
  /**
   * Log a message to the Node.js console.
   */
  log: (...args: unknown[]) => void;

  /**
   * Read a file from the filesystem.
   */
  readFile: (path: string) => Promise<string>;

  /**
   * Read a file if it exists, otherwise return null.
   */
  readFileIfExists: (path: string) => Promise<string | null>;

  /**
   * Write a file to the filesystem.
   */
  writeFile: (path: string, content: string) => Promise<void>;

  /**
   * Remove a file from the filesystem. No-op if missing.
   */
  removeFile: (path: string) => Promise<void>;

  /**
   * Called when tests are collected (after imports, before execution).
   * This allows Vitest to know about the test structure.
   */
  onCollected: (files: File[]) => Promise<void>;

  /**
   * Called when test tasks are updated (results, state changes).
   * This allows the worker to report progress back to the pool.
   */
  onTaskUpdate: (packs: unknown[]) => Promise<void>;
}
