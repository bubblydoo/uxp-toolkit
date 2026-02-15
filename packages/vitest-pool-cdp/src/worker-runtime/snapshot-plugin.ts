import type { Test } from '@vitest/runner';
import type { SnapshotStateOptions, SnapshotUpdateState } from '@vitest/snapshot';
import { equals, iterableEquality, subsetEquality } from '@vitest/expect';
import * as vitestRunner from '@vitest/runner';
import { addSerializer, SnapshotClient, stripSnapshotIndentation } from '@vitest/snapshot';

interface SnapshotIO {
  readFileIfExists: (path: string) => Promise<string | null>;
  writeFile: (path: string, content: string) => Promise<void>;
  removeFile: (path: string) => Promise<void>;
}

let snapshotIO: SnapshotIO | null = null;
let snapshotConfig: {
  updateSnapshot: SnapshotUpdateState;
  expand?: boolean;
  snapshotFormat?: SnapshotStateOptions['snapshotFormat'];
} = {
  updateSnapshot: 'new',
};

const snapshotClient = new SnapshotClient({
  isEqual: (received, expected) => equals(received, expected, [iterableEquality, subsetEquality]),
});

export function configureSnapshotIO(io: SnapshotIO): void {
  snapshotIO = io;
}

export function configureSnapshotOptions(options: {
  updateSnapshot: SnapshotUpdateState;
  expand?: boolean;
  snapshotFormat?: SnapshotStateOptions['snapshotFormat'];
}): void {
  snapshotConfig = options;
}

function dirname(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/');
  const idx = normalized.lastIndexOf('/');
  return idx === -1 ? '' : normalized.slice(0, idx);
}

function basename(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/');
  const idx = normalized.lastIndexOf('/');
  return idx === -1 ? normalized : normalized.slice(idx + 1);
}

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replaceAll('//', '/');
}

function isAbsolutePath(filePath: string): boolean {
  return filePath.startsWith('/') || /^[a-z]:[\\/]/i.test(filePath);
}

function getSnapshotEnvironment(): SnapshotStateOptions['snapshotEnvironment'] {
  if (!snapshotIO) {
    throw new Error('[vitest-pool-cdp] Snapshot IO is not configured');
  }
  const io = snapshotIO;

  return {
    getVersion: () => '1',
    getHeader: () => '// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html',
    resolvePath: async (filepath: string) => {
      const dir = dirname(filepath);
      const file = basename(filepath);
      return joinPath(dir, '__snapshots__', `${file}.snap`);
    },
    resolveRawPath: async (testPath: string, rawPath: string) => {
      if (isAbsolutePath(rawPath)) {
        return rawPath;
      }
      return joinPath(dirname(testPath), rawPath);
    },
    saveSnapshotFile: async (filepath: string, snapshot: string) => {
      await io.writeFile(filepath, snapshot);
    },
    readSnapshotFile: async (filepath: string) => {
      return io.readFileIfExists(filepath);
    },
    removeSnapshotFile: async (filepath: string) => {
      await io.removeFile(filepath);
    },
  };
}

function getCurrentTestOrThrow(name: string): Test {
  const test = vitestRunner.getCurrentTest();
  if (!test) {
    throw new Error(`${name} cannot be used without test context`);
  }
  return test;
}

function getSnapshotTestName(test: Test): string {
  const names: string[] = [];
  let current: vitestRunner.Suite | undefined = test.suite;
  while (current) {
    names.push(current.name);
    current = current.suite;
  }
  names.reverse();
  names.push(test.name);
  return names.join(' > ');
}

function createInlineSnapshotError(test: Test, original?: Error): Error {
  if (original?.stack) {
    return original;
  }

  const line = (test.location?.line ?? 1) + 1;
  const column = (test.location?.column ?? 1) + 1;
  const file = test.file.filepath;
  const error = new Error('snapshot');
  error.stack = [
    'Error: snapshot',
    `    at __INLINE_SNAPSHOT__ (${file}:${line}:${column})`,
    `    at __INLINE_SNAPSHOT__ (${file}:${line}:${column})`,
    `    at __INLINE_SNAPSHOT__ (${file}:${line}:${column})`,
  ].join('\n');
  return error;
}

function getError(expected: unknown, promise: unknown): unknown {
  if (typeof expected !== 'function') {
    if (!promise) {
      throw new Error(`expected must be a function, received ${typeof expected}`);
    }
    // In promise mode, the thrown value is already passed through assertion flags.
    return expected;
  }

  try {
    (expected as () => unknown)();
  }
  catch (error) {
    return error;
  }

  throw new Error('snapshot function didn\'t throw');
}

export const snapshotPlugin: Chai.ChaiPlugin = (_chai, _utils) => {
  _chai.Assertion.addMethod('toMatchSnapshot', function toMatchSnapshot(this: Chai.AssertionStatic, properties?: object, message?: string) {
    if (_chai.util.flag(this, 'negate')) {
      throw new Error('toMatchSnapshot cannot be used with "not"');
    }
    const test = getCurrentTestOrThrow('toMatchSnapshot');
    const received = _chai.util.flag(this, 'object');
    const errorMessage = _chai.util.flag(this, 'message');
    snapshotClient.assert({
      received,
      message,
      isInline: false,
      properties,
      errorMessage,
      filepath: test.file.filepath,
      name: getSnapshotTestName(test),
      testId: test.id,
    });
  });

  _chai.Assertion.addMethod('toMatchInlineSnapshot', function __INLINE_SNAPSHOT__(this: Chai.AssertionStatic, properties?: object | string, inlineSnapshot?: string, message?: string) {
    if (_chai.util.flag(this, 'negate')) {
      throw new Error('toMatchInlineSnapshot cannot be used with "not"');
    }
    const test = getCurrentTestOrThrow('toMatchInlineSnapshot');
    if (test.each || test.suite?.each) {
      throw new Error('InlineSnapshot cannot be used inside of test.each or describe.each');
    }
    const received = _chai.util.flag(this, 'object');
    const error = createInlineSnapshotError(test, _chai.util.flag(this, 'error') as Error | undefined);
    const errorMessage = _chai.util.flag(this, 'message');
    if (typeof properties === 'string') {
      message = inlineSnapshot;
      inlineSnapshot = properties;
      properties = undefined;
    }
    if (inlineSnapshot) {
      inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
    }
    snapshotClient.assert({
      received,
      message,
      isInline: true,
      properties: properties as object | undefined,
      inlineSnapshot,
      error,
      errorMessage,
      filepath: test.file.filepath,
      name: getSnapshotTestName(test),
      testId: test.id,
    });
  });

  _chai.Assertion.addMethod('toThrowErrorMatchingSnapshot', function toThrowErrorMatchingSnapshot(this: Chai.AssertionStatic, message?: string) {
    if (_chai.util.flag(this, 'negate')) {
      throw new Error('toThrowErrorMatchingSnapshot cannot be used with "not"');
    }
    const test = getCurrentTestOrThrow('toThrowErrorMatchingSnapshot');
    const expected = _chai.util.flag(this, 'object') as unknown;
    const promise = _chai.util.flag(this, 'promise');
    const errorMessage = _chai.util.flag(this, 'message');
    const received = getError(expected, promise);
    snapshotClient.assert({
      received,
      message,
      errorMessage,
      filepath: test.file.filepath,
      name: getSnapshotTestName(test),
      testId: test.id,
    });
  });

  _chai.Assertion.addMethod('toThrowErrorMatchingInlineSnapshot', function __INLINE_SNAPSHOT__(this: Chai.AssertionStatic, inlineSnapshot?: string, message?: string) {
    if (_chai.util.flag(this, 'negate')) {
      throw new Error('toThrowErrorMatchingInlineSnapshot cannot be used with "not"');
    }
    const test = getCurrentTestOrThrow('toThrowErrorMatchingInlineSnapshot');
    if (test.each || test.suite?.each) {
      throw new Error('InlineSnapshot cannot be used inside of test.each or describe.each');
    }
    const expected = _chai.util.flag(this, 'object') as unknown;
    const error = createInlineSnapshotError(test, _chai.util.flag(this, 'error') as Error | undefined);
    const promise = _chai.util.flag(this, 'promise');
    const errorMessage = _chai.util.flag(this, 'message');
    if (inlineSnapshot) {
      inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
    }
    const received = getError(expected, promise);
    snapshotClient.assert({
      received,
      message,
      isInline: true,
      inlineSnapshot,
      error,
      errorMessage,
      filepath: test.file.filepath,
      name: getSnapshotTestName(test),
      testId: test.id,
    });
  });

  _chai.util.addMethod(_chai.expect, 'addSnapshotSerializer', addSerializer);
};

async function setupSnapshotForFile(filepath: string): Promise<void> {
  const snapshotEnvironment = getSnapshotEnvironment();
  await snapshotClient.setup(filepath, {
    ...snapshotConfig,
    snapshotEnvironment,
  });
}

async function finishSnapshotForFile(filepath: string): Promise<void> {
  await snapshotClient.finish(filepath);
}

function clearSnapshotForTest(filepath: string, testId: string): void {
  snapshotClient.clearTest(filepath, testId);
}

export async function onBeforeRunSuite(suite: vitestRunner.Suite): Promise<void> {
  if ('filepath' in suite && suite.mode !== 'skip') {
    await setupSnapshotForFile(suite.file.filepath);
  }
}

export async function onAfterRunSuite(suite: vitestRunner.Suite): Promise<void> {
  if ('filepath' in suite && suite.mode !== 'skip') {
    await finishSnapshotForFile(suite.file.filepath);
  }
}

export function onBeforeTryTask(test: Test): void {
  clearSnapshotForTest(test.file.filepath, test.id);
}

export function onAfterRunFiles(): void {
  snapshotClient.clear();
}
