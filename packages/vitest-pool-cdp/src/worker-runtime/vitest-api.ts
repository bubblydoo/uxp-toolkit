import type { TaskPopulated, Test } from '@vitest/runner';
import type * as vitestApi from 'vitest';
import {
  JestAsymmetricMatchers,
  JestChaiExpect,
  JestExtend,
} from '@vitest/expect';
import * as vitestRunner from '@vitest/runner';
import * as chai from 'chai';
import {
  configureSnapshotIO,
  configureSnapshotOptions,
  onAfterRunFiles,
  onAfterRunSuite,
  onBeforeRunSuite,
  onBeforeTryTask,
  snapshotPlugin,
} from './snapshot-plugin';

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
chai.use(snapshotPlugin);
chai.use(JestAsymmetricMatchers);

function createExpect(test?: TaskPopulated | Test) {
  const expect = ((value: unknown, message?: string) => {
    const assertion = chai.expect(value, message) as Chai.Assertion & { withTest?: (test: Test) => Chai.Assertion };
    const currentTest = test ?? vitestRunner.getCurrentTest();
    if (currentTest && assertion.withTest && 'type' in currentTest && currentTest.type === 'test') {
      return assertion.withTest(currentTest as Test);
    }
    return assertion;
  }) as unknown as typeof vitestApi.expect;

  Object.assign(expect, chai.expect);
  return expect;
}

export {
  configureSnapshotIO,
  configureSnapshotOptions,
  onAfterRunFiles,
  onAfterRunSuite,
  onBeforeRunSuite,
  onBeforeTryTask,
};

export function createVitestApi() {
  const vi = createUnimplementedObject('vi');
  const expect = createExpect();
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
    createExpect,
    describe: vitestRunner.describe,
    EvaluatedModules: createUnimplementedObject('EvaluatedModules'),
    expect,
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
