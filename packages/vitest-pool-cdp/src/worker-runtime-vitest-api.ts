import type * as vitestApi from 'vitest';
import {
  JestAsymmetricMatchers,
  JestChaiExpect,
  JestExtend,
} from '@vitest/expect';
import * as vitestRunner from '@vitest/runner';
import * as chai from 'chai';

function createUnimplementedObject(name: string) {
  return new Proxy({}, {
    get() {
      throw new Error(`The ${name} object is not yet implemented in the CDP runtime`);
    },
    set() {
      throw new Error(`The ${name} object is not yet implemented in the CDP runtime`);
    },
  }) as any;
}

function createUnimplementedFunction(name: string) {
  return () => {
    throw new Error(`The ${name} function is not yet implemented in the CDP runtime`);
  };
}

/**
 * Set up chai with Vitest's expect plugins.
 */
chai.use(JestExtend);
chai.use(JestChaiExpect);
chai.use(JestAsymmetricMatchers);

export function createVitestApi() {
  const vi = createUnimplementedObject('vi');
  return {
    afterAll: vitestRunner.afterAll,
    afterEach: vitestRunner.afterEach,
    assert: chai.assert,
    assertType: null as unknown as typeof vitestApi.assertType, // part of typechecking
    beforeAll: vitestRunner.beforeAll,
    beforeEach: vitestRunner.beforeEach,
    bench: createUnimplementedObject('bench'),
    BenchFactory: createUnimplementedObject('BenchFactory'),
    BenchTask: createUnimplementedObject('BenchTask'),
    chai,
    createExpect: createUnimplementedFunction('createExpect'),
    describe: vitestRunner.describe,
    EvaluatedModules: createUnimplementedObject('EvaluatedModules'),
    expect: chai.expect as unknown as typeof vitestApi.expect,
    expectTypeOf: null as unknown as typeof vitestApi.expectTypeOf, // part of typechecking
    Experimental: createUnimplementedObject('Experimental'),
    inject: createUnimplementedFunction('inject'),
    it: vitestRunner.it,
    onTestFailed: vitestRunner.onTestFailed,
    onTestFinished: vitestRunner.onTestFinished,
    recordArtifact: vitestRunner.recordArtifact,
    should: chai.should,
    suite: vitestRunner.suite,
    test: vitestRunner.test,
    vi,
    vitest: vi,
  };
}
