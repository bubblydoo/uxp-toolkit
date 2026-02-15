import { describe, expect, it } from 'vitest';
import { parseUxpErrorSourcemaps } from './sourcemaps';

function throwError() {
  throw new Error('Test error'); // this error should stay exactly here in the source code, see below
}

describe('sourcemaps', () => {
  it('should parse error sourcemaps', async () => {
    let error: Error;
    try {
      throwError();
    }
    catch (e) {
      error = e as Error;
    }
    // console.log('error.stack', error!.stack);
    const parsedError = await parseUxpErrorSourcemaps(error!, { normalizeEvalAndAnonymous: true });
    expect(parsedError[0]!.fileName).toContain('sourcemaps.uxp-test.ts');
    expect(parsedError[0]!.lineNumber).toBe(5);
    expect(parsedError[0]!.columnNumber).toBe(8);
  });

  it.skip('is a test to see if an expect error is sourcemapped', async () => {
    throw new Error('Test error');
  });
});
