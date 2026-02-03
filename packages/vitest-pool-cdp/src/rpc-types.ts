/**
 * Shared RPC types for communication between the pool (Node.js) and worker (CDP context).
 * These types define the bidirectional function interfaces used by birpc.
 */

/**
 * Functions exposed by the worker (CDP context) that the pool can call.
 */
export interface WorkerFunctions {
  /**
   * Ping the worker to verify connectivity.
   */
  ping: () => 'pong';

  /**
   * Evaluate arbitrary code in the CDP context.
   */
  eval: (code: string) => unknown;

  /**
   * Get information about available globals in the CDP context.
   */
  getGlobals: () => {
    hasPhotoshop: boolean;
    hasUxp: boolean;
  };
}

/**
 * Functions exposed by the pool (Node.js) that the worker can call.
 * Currently empty but can be extended for features like:
 * - Reading files from the filesystem
 * - Logging to Node.js console
 * - Fetching resources
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
}

/**
 * Test result returned from CDP after running a test.
 */
export interface TestResult {
  name: string;
  fullName: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: {
    message: string;
    stack?: string;
    expected?: unknown;
    actual?: unknown;
  };
}

/**
 * Result of running all tests in a file.
 */
export interface TestRunResult {
  results: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

/**
 * Collected test information (without running).
 */
export interface CollectedTests {
  tests: Array<{
    name: string;
    fullName: string;
    skip: boolean;
    only: boolean;
  }>;
  total: number;
}
