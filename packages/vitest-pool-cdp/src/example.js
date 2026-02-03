const require = globalThis.nativeRequire;
if (typeof require !== 'function') {
  throw new TypeError('nativeRequire is not a function');
}
// Vitest globals provided by test runtime
const { describe, it, test, expect, beforeAll, afterAll, beforeEach, afterEach } = globalThis;

'use strict';
(() => {
  let __require = /* @__PURE__ */ (x => typeof require !== 'undefined'
    ? require
    : typeof Proxy !== 'undefined'
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== 'undefined' ? require : a)[b],
        })
      : x)(function (x) {
    if (typeof require !== 'undefined')
      return require.apply(this, arguments);
    throw new Error(`Dynamic require of "${x}" is not supported`);
  });

  // test/meta-tests/executeAsModal.uxp-test.ts
  let import_photoshop = __require('photoshop');

  // vitest-globals:vitest
  let describe = globalThis.describe;
  let it = globalThis.it;
  let test = globalThis.test;
  let expect = globalThis.expect;
  let beforeAll = globalThis.beforeAll;
  let afterAll = globalThis.afterAll;
  let beforeEach = globalThis.beforeEach;
  let afterEach = globalThis.afterEach;

  // test/meta-tests/executeAsModal.uxp-test.ts
  describe('meta: executeAsModal', () => {
    it('should throw correctly', async () => {
      let threw = false;
      try {
        await import_photoshop.core.executeAsModal(
          async () => {
            throw new Error('Uncaught error');
          },
          {
            commandName: 'Test',
          },
        );
      }
      catch {
        threw = true;
      }
      expect(threw).toBe(true);
    });
    it('should return correctly', async () => {
      const result = await import_photoshop.core.executeAsModal(
        async () => {
          return 'test';
        },
        {
          commandName: 'Test',
        },
      );
      expect(result).toBe('test');
    });
  });
})();
