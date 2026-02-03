/**
 * Minimal test runtime that provides vitest-compatible APIs for the CDP context.
 * This gets injected along with the worker runtime and provides:
 * - describe/it/test for test structure
 * - expect for assertions
 * - beforeEach/afterEach/beforeAll/afterAll for hooks
 */

// Test result types
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

export interface SuiteResult {
  name: string;
  tests: TestResult[];
  suites: SuiteResult[];
  duration: number;
}

// Internal test structure
interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  skip?: boolean;
  only?: boolean;
}

interface Suite {
  name: string;
  tests: TestCase[];
  suites: Suite[];
  beforeAll: Array<() => void | Promise<void>>;
  afterAll: Array<() => void | Promise<void>>;
  beforeEach: Array<() => void | Promise<void>>;
  afterEach: Array<() => void | Promise<void>>;
  parent: Suite | null;
}

/**
 * The test runtime code as a string that gets injected into CDP.
 * This provides vitest-compatible globals.
 */
export const TEST_RUNTIME_CODE = `
(function() {
  // Test structure
  const rootSuite = {
    name: '',
    tests: [],
    suites: [],
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
    parent: null
  };

  let currentSuite = rootSuite;
  let onlyMode = false;

  // Track collected tests for filtering
  const collectedTests = [];

  /**
   * describe - creates a test suite
   */
  function describe(name, fn) {
    const suite = {
      name,
      tests: [],
      suites: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      parent: currentSuite
    };

    currentSuite.suites.push(suite);
    const previousSuite = currentSuite;
    currentSuite = suite;

    try {
      fn();
    } finally {
      currentSuite = previousSuite;
    }
  }

  describe.skip = function(name, fn) {
    const suite = {
      name,
      tests: [],
      suites: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      parent: currentSuite,
      skip: true
    };
    currentSuite.suites.push(suite);
    // Don't execute fn - suite is skipped
  };

  describe.only = function(name, fn) {
    onlyMode = true;
    const suite = {
      name,
      tests: [],
      suites: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      parent: currentSuite,
      only: true
    };

    currentSuite.suites.push(suite);
    const previousSuite = currentSuite;
    currentSuite = suite;

    try {
      fn();
    } finally {
      currentSuite = previousSuite;
    }
  };

  /**
   * it/test - creates a test case
   */
  function it(name, fn) {
    const test = { name, fn, skip: false, only: false };
    currentSuite.tests.push(test);
    collectedTests.push({ suite: currentSuite, test });
  }

  it.skip = function(name, fn) {
    const test = { name, fn, skip: true, only: false };
    currentSuite.tests.push(test);
    collectedTests.push({ suite: currentSuite, test });
  };

  it.only = function(name, fn) {
    onlyMode = true;
    const test = { name, fn, skip: false, only: true };
    currentSuite.tests.push(test);
    collectedTests.push({ suite: currentSuite, test });
  };

  const test = it;

  /**
   * Hooks
   */
  function beforeAll(fn) {
    currentSuite.beforeAll.push(fn);
  }

  function afterAll(fn) {
    currentSuite.afterAll.push(fn);
  }

  function beforeEach(fn) {
    currentSuite.beforeEach.push(fn);
  }

  function afterEach(fn) {
    currentSuite.afterEach.push(fn);
  }

  /**
   * Simple expect implementation
   */
  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          const error = new Error(\`Expected \${JSON.stringify(actual)} to be \${JSON.stringify(expected)}\`);
          error.expected = expected;
          error.actual = actual;
          throw error;
        }
      },

      toEqual(expected) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
          const error = new Error(\`Expected \${actualStr} to equal \${expectedStr}\`);
          error.expected = expected;
          error.actual = actual;
          throw error;
        }
      },

      toStrictEqual(expected) {
        // For simplicity, same as toEqual
        this.toEqual(expected);
      },

      toBeTruthy() {
        if (!actual) {
          throw new Error(\`Expected \${JSON.stringify(actual)} to be truthy\`);
        }
      },

      toBeFalsy() {
        if (actual) {
          throw new Error(\`Expected \${JSON.stringify(actual)} to be falsy\`);
        }
      },

      toBeNull() {
        if (actual !== null) {
          throw new Error(\`Expected \${JSON.stringify(actual)} to be null\`);
        }
      },

      toBeUndefined() {
        if (actual !== undefined) {
          throw new Error(\`Expected \${JSON.stringify(actual)} to be undefined\`);
        }
      },

      toBeDefined() {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },

      toBeInstanceOf(expected) {
        if (!(actual instanceof expected)) {
          throw new Error(\`Expected value to be instance of \${expected.name}\`);
        }
      },

      toContain(expected) {
        if (Array.isArray(actual)) {
          if (!actual.includes(expected)) {
            throw new Error(\`Expected array to contain \${JSON.stringify(expected)}\`);
          }
        } else if (typeof actual === 'string') {
          if (!actual.includes(expected)) {
            throw new Error(\`Expected string to contain \${JSON.stringify(expected)}\`);
          }
        } else {
          throw new Error('toContain can only be used with arrays or strings');
        }
      },

      toHaveLength(expected) {
        if (actual.length !== expected) {
          throw new Error(\`Expected length \${expected} but got \${actual.length}\`);
        }
      },

      toBeGreaterThan(expected) {
        if (actual <= expected) {
          throw new Error(\`Expected \${actual} to be greater than \${expected}\`);
        }
      },

      toBeGreaterThanOrEqual(expected) {
        if (actual < expected) {
          throw new Error(\`Expected \${actual} to be >= \${expected}\`);
        }
      },

      toBeLessThan(expected) {
        if (actual >= expected) {
          throw new Error(\`Expected \${actual} to be less than \${expected}\`);
        }
      },

      toBeLessThanOrEqual(expected) {
        if (actual > expected) {
          throw new Error(\`Expected \${actual} to be <= \${expected}\`);
        }
      },

      toThrow(expected) {
        if (typeof actual !== 'function') {
          throw new Error('toThrow requires a function');
        }
        let threw = false;
        let thrownError;
        try {
          actual();
        } catch (e) {
          threw = true;
          thrownError = e;
        }
        if (!threw) {
          throw new Error('Expected function to throw');
        }
        if (expected !== undefined) {
          if (expected instanceof RegExp) {
            if (!expected.test(thrownError.message)) {
              throw new Error(\`Expected error message to match \${expected}\`);
            }
          } else if (typeof expected === 'string') {
            if (thrownError.message !== expected) {
              throw new Error(\`Expected error message "\${expected}" but got "\${thrownError.message}"\`);
            }
          }
        }
      },

      toMatchObject(expected) {
        for (const key of Object.keys(expected)) {
          const actualVal = actual[key];
          const expectedVal = expected[key];
          if (typeof expectedVal === 'object' && expectedVal !== null) {
            expect(actualVal).toMatchObject(expectedVal);
          } else if (actualVal !== expectedVal) {
            throw new Error(\`Expected .\${key} to be \${JSON.stringify(expectedVal)} but got \${JSON.stringify(actualVal)}\`);
          }
        }
      },

      toHaveProperty(path, value) {
        const parts = typeof path === 'string' ? path.split('.') : path;
        let current = actual;
        for (const part of parts) {
          if (current === null || current === undefined || !(part in current)) {
            throw new Error(\`Expected object to have property \${path}\`);
          }
          current = current[part];
        }
        if (value !== undefined && current !== value) {
          throw new Error(\`Expected property \${path} to be \${JSON.stringify(value)} but got \${JSON.stringify(current)}\`);
        }
      },

      // Negation
      not: {
        toBe(expected) {
          if (actual === expected) {
            throw new Error(\`Expected \${JSON.stringify(actual)} not to be \${JSON.stringify(expected)}\`);
          }
        },
        toEqual(expected) {
          const actualStr = JSON.stringify(actual);
          const expectedStr = JSON.stringify(expected);
          if (actualStr === expectedStr) {
            throw new Error(\`Expected \${actualStr} not to equal \${expectedStr}\`);
          }
        },
        toBeTruthy() {
          if (actual) {
            throw new Error(\`Expected \${JSON.stringify(actual)} not to be truthy\`);
          }
        },
        toBeFalsy() {
          if (!actual) {
            throw new Error(\`Expected \${JSON.stringify(actual)} not to be falsy\`);
          }
        },
        toBeNull() {
          if (actual === null) {
            throw new Error('Expected value not to be null');
          }
        },
        toBeUndefined() {
          if (actual === undefined) {
            throw new Error('Expected value not to be undefined');
          }
        },
        toContain(expected) {
          if (Array.isArray(actual)) {
            if (actual.includes(expected)) {
              throw new Error(\`Expected array not to contain \${JSON.stringify(expected)}\`);
            }
          } else if (typeof actual === 'string') {
            if (actual.includes(expected)) {
              throw new Error(\`Expected string not to contain \${JSON.stringify(expected)}\`);
            }
          }
        },
        toThrow() {
          if (typeof actual !== 'function') {
            throw new Error('toThrow requires a function');
          }
          try {
            actual();
          } catch (e) {
            throw new Error('Expected function not to throw');
          }
        }
      }
    };
  }

  // Async assertions
  expect.rejects = {
    toThrow: async function(fn, expected) {
      let threw = false;
      let thrownError;
      try {
        await fn;
      } catch (e) {
        threw = true;
        thrownError = e;
      }
      if (!threw) {
        throw new Error('Expected promise to reject');
      }
      if (expected !== undefined) {
        if (expected instanceof RegExp) {
          if (!expected.test(thrownError.message)) {
            throw new Error(\`Expected error message to match \${expected}\`);
          }
        } else if (typeof expected === 'string') {
          if (thrownError.message !== expected) {
            throw new Error(\`Expected error message "\${expected}" but got "\${thrownError.message}"\`);
          }
        }
      }
    }
  };

  expect.resolves = {
    toBe: async function(promise, expected) {
      const result = await promise;
      if (result !== expected) {
        throw new Error(\`Expected \${JSON.stringify(result)} to be \${JSON.stringify(expected)}\`);
      }
    }
  };

  /**
   * Get full suite name by walking up the parent chain
   */
  function getFullSuiteName(suite) {
    const names = [];
    let current = suite;
    while (current && current.name) {
      names.unshift(current.name);
      current = current.parent;
    }
    return names.join(' > ');
  }

  /**
   * Collect beforeEach hooks from all parent suites
   */
  function collectBeforeEach(suite) {
    const hooks = [];
    let current = suite;
    while (current) {
      hooks.unshift(...current.beforeEach);
      current = current.parent;
    }
    return hooks;
  }

  /**
   * Collect afterEach hooks from all parent suites (in reverse order)
   */
  function collectAfterEach(suite) {
    const hooks = [];
    let current = suite;
    while (current) {
      hooks.push(...current.afterEach);
      current = current.parent;
    }
    return hooks;
  }

  /**
   * Run a single test and return the result
   */
  async function runTest(suite, test) {
    const fullName = getFullSuiteName(suite) + ' > ' + test.name;
    console.log('[vitest-cdp-test] Running:', fullName);
    const result = {
      name: test.name,
      fullName,
      status: 'pass',
      duration: 0
    };

    if (test.skip || (onlyMode && !test.only && !suite.only)) {
      result.status = 'skip';
      console.log('[vitest-cdp-test] Skipped:', fullName);
      return result;
    }

    const startTime = Date.now();

    try {
      // Run beforeEach hooks
      for (const hook of collectBeforeEach(suite)) {
        await hook();
      }

      // Run the test
      console.log('[vitest-cdp-test] Executing test function...');
      await test.fn();
      console.log('[vitest-cdp-test] Test function completed');

      // Run afterEach hooks
      for (const hook of collectAfterEach(suite)) {
        await hook();
      }

      result.status = 'pass';
      console.log('[vitest-cdp-test] Test passed:', fullName);
    } catch (error) {
      result.status = 'fail';
      result.error = {
        message: error.message || String(error),
        stack: error.stack,
        expected: error.expected,
        actual: error.actual
      };
      console.log('[vitest-cdp-test] Test failed:', fullName, error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Run a suite and all its nested suites/tests
   */
  async function runSuite(suite, results) {
    const suiteResult = {
      name: suite.name,
      tests: [],
      suites: [],
      duration: 0
    };

    const startTime = Date.now();

    // Run beforeAll hooks
    for (const hook of suite.beforeAll) {
      await hook();
    }

    // Run tests in this suite
    for (const test of suite.tests) {
      const testResult = await runTest(suite, test);
      suiteResult.tests.push(testResult);
      results.push(testResult);
    }

    // Run nested suites
    for (const nestedSuite of suite.suites) {
      const nestedResult = await runSuite(nestedSuite, results);
      suiteResult.suites.push(nestedResult);
    }

    // Run afterAll hooks
    for (const hook of suite.afterAll) {
      await hook();
    }

    suiteResult.duration = Date.now() - startTime;
    return suiteResult;
  }

  /**
   * Run all collected tests and return results
   */
  async function __vitest_run_tests__() {
    console.log('[vitest-cdp-test] Starting test run...');
    const results = [];
    try {
      await runSuite(rootSuite, results);
      console.log('[vitest-cdp-test] Test run complete:', results.length, 'tests');
    } catch (err) {
      console.error('[vitest-cdp-test] Error running tests:', err);
      throw err;
    }
    // Note: Don't include rootSuite in result - it contains functions that can't be serialized
    return {
      results,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      skipped: results.filter(r => r.status === 'skip').length,
      total: results.length
    };
  }

  /**
   * Get collected test info without running them
   */
  function __vitest_collect_tests__() {
    return {
      tests: collectedTests.map(({ suite, test }) => ({
        name: test.name,
        fullName: getFullSuiteName(suite) + ' > ' + test.name,
        skip: test.skip,
        only: test.only
      })),
      total: collectedTests.length
    };
  }

  /**
   * Reset the test state for the next file
   */
  function __vitest_reset__() {
    rootSuite.tests = [];
    rootSuite.suites = [];
    rootSuite.beforeAll = [];
    rootSuite.afterAll = [];
    rootSuite.beforeEach = [];
    rootSuite.afterEach = [];
    currentSuite = rootSuite;
    collectedTests.length = 0;
    onlyMode = false;
  }

  // Expose globals
  globalThis.describe = describe;
  globalThis.it = it;
  globalThis.test = test;
  globalThis.expect = expect;
  globalThis.beforeAll = beforeAll;
  globalThis.afterAll = afterAll;
  globalThis.beforeEach = beforeEach;
  globalThis.afterEach = afterEach;

  // Expose internal functions for the pool
  globalThis.__vitest_run_tests__ = __vitest_run_tests__;
  globalThis.__vitest_collect_tests__ = __vitest_collect_tests__;
  globalThis.__vitest_reset__ = __vitest_reset__;
})();
`;
