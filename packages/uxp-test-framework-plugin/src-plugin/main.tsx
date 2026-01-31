import type { Test } from '@bubblydoo/uxp-test-framework-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { tests } from 'TESTS';
import { ErrorView } from './components/ErrorView';

interface TestResult {
  status: 'idle' | 'success' | 'error' | 'pending';
  isIdle: boolean;
  isSuccess: boolean;
  isPending: boolean;
  error: any;
}

const TestResultsContext = createContext<{
  set: (test: Test, result: TestResult) => void;
  get: (test: Test) => TestResult | undefined;
  delete: (test: Test) => void;
}>(null!);

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [testResultsCache, setTestResults] = useState(
    () => new Map<Test, any>(),
  );
  const testResults = useMemo(
    () => ({
      set: (test: Test, result: TestResult) =>
        setTestResults(prev => new Map(prev).set(test, result)),
      get: (test: Test) => testResultsCache.get(test),
      delete: (test: Test) => {
        setTestResults((prev) => {
          const copy = new Map(prev);
          copy.delete(test);
          return copy;
        });
      },
    }),
    [testResultsCache],
  );

  return (
    <>
      <main className="text-white overflow-y-auto">
        <QueryClientProvider client={queryClient}>
          <TestResultsContext value={testResults}>
            <TestView tests={tests} />
          </TestResultsContext>
        </QueryClientProvider>
      </main>
    </>
  );
}

async function runTest(test: Test): Promise<void> {
  try {
    await test.run.call(undefined, { name: test.name });
  }
  catch (e) {
    if (!(e instanceof Error)) {
      console.error(`Test ${test.name} threw a non-Error (${typeof e}): ${e}`);
    }
    throw e;
  }
}

function usePromiseStatus<T>(promise: Promise<T> | null): TestResult {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (!promise) {
      return;
    }
    setIsPending(true);
    promise
      .then((result) => {
        setSuccess(true);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [promise]);

  const result: TestResult = useMemo(
    () => ({
      status: success
        ? 'success'
        : error
          ? 'error'
          : isPending
            ? 'pending'
            : 'idle',
      isIdle: !promise,
      isSuccess: success,
      error,
      isPending,
    }),
    [success, error, isPending, promise],
  );

  return result;
}

const stableIdleResult: TestResult = {
  status: 'idle',
  isIdle: true,
  isSuccess: false,
  isPending: false,
  error: null,
};

function useTestResult(test: Test): { mutate: () => void; result: TestResult } {
  const [promise, setPromise] = useState<Promise<void> | null>(null);
  const testResults = use(TestResultsContext);
  const mutate = useCallback(() => {
    testResults.delete(test);
    setPromise(runTest(test));
  }, [test, testResults]);
  const promiseResult = usePromiseStatus(promise);
  useEffect(() => {
    if (promiseResult.status !== 'idle') {
      testResults.set(test, promiseResult);
    }
  }, [promiseResult]);
  const globalResult
    = promiseResult.status !== 'idle'
      ? promiseResult
      : testResults.get(test) ?? stableIdleResult;
  return {
    mutate,
    result: globalResult,
  };
}

function TestView({ tests }: { tests: Test[] }) {
  const resultContext = use(TestResultsContext);
  const runAllTests = useCallback(async () => {
    for (const test of tests) {
      console.log(`Running test ${test.name}`);
      // await runTest(test);
      resultContext.set(test, {
        status: 'pending',
        isIdle: false,
        isSuccess: false,
        isPending: true,
        error: null,
      });
      try {
        await runTest(test);
        resultContext.set(test, {
          status: 'success',
          isIdle: false,
          isSuccess: true,
          isPending: false,
          error: null,
        });
      }
      catch (e) {
        resultContext.set(test, {
          status: 'error',
          isIdle: false,
          isSuccess: false,
          isPending: false,
          error: e,
        });
      }
    }
  }, []);

  return (
    <div className="px-2">
      <h1 className="text-white text-xl bold mb-1">Tests</h1>
      <button
        onClick={runAllTests}
        className="bg-white text-black rounded-md p-1"
      >
        Run All Tests
      </button>
      {tests.map((test, i) => {
        if (!test)
          return null;
        return <OneTest test={test} key={i} />;
      })}
    </div>
  );
}

function OneTest(props: { test: Test }) {
  const { test } = props;

  const { mutate, result } = useTestResult(test);

  return (
    <div
      key={test.name}
      className="p-2 border border-white rounded-md mt-2 w-full"
    >
      <div className="flex flex-row">
        <div className="text-base mr-2 flex-1">{test.name}</div>
        <button
          disabled={result.isPending}
          key={test.name}
          onClick={() => mutate()}
          className="bg-white text-black rounded-md p-1"
        >
          Run Test
        </button>
      </div>
      <div>
        Result:
        {' '}
        {result.status}
        {' '}
        <TestResultEmoji result={result} />
        {result.error && (
          <div className="pt-2">
            <ErrorView error={result.error} />
          </div>
        )}
      </div>
    </div>
  );
}

function TestResultEmoji({ result }: { result: TestResult }) {
  return result.error
    ? '❌'
    : result.isSuccess
      ? '✅'
      : result.isPending
        ? '⏳'
        : '❔';
}
