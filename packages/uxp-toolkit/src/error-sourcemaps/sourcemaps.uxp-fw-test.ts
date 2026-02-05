import type { Test } from '@bubblydoo/uxp-test-framework';
import { expect } from 'chai';
import { parseUxpErrorSourcemaps } from './sourcemaps';

function throwError() {
  throw new Error('Test error'); // this error should stay exactly here in the source code, see below
}

export const sourcemapsTest: Test = {
  name: 'sourcemaps',
  description: 'should parse error sourcemaps',
  run: async () => {
    let error: Error;
    try {
      throwError();
    }
    catch (e) {
      error = e as Error;
    }
    const parsedError = await parseUxpErrorSourcemaps(error!, { normalizeEvalAndAnonymous: true });
    expect(parsedError[0]!.fileName).to.contain('sourcemaps.uxp-fw-test.ts');
    expect(parsedError[0]!.lineNumber).to.equal(6);
    expect(parsedError[0]!.columnNumber).to.equal(8);
  },
};
