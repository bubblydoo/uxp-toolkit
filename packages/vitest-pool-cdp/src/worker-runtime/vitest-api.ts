import type { TaskPopulated, Test } from '@vitest/runner';
import type * as vitestApi from 'vitest';
import {
  getState,
  JestAsymmetricMatchers,
  JestChaiExpect,
  JestExtend,
  setState,
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
    const { assertionCalls } = getState(expect);
    setState({ assertionCalls: (assertionCalls ?? 0) + 1 }, expect);

    const assertion = chai.expect(value, message) as Chai.Assertion & { withTest?: (test: Test) => Chai.Assertion };
    const currentTest = test ?? vitestRunner.getCurrentTest();
    if (currentTest && assertion.withTest && 'type' in currentTest && currentTest.type === 'test') {
      return assertion.withTest(currentTest as Test);
    }
    return assertion;
  }) as unknown as typeof vitestApi.expect;

  Object.assign(expect, chai.expect);

  expect.getState = () => getState(expect);
  expect.setState = state => setState(state, expect);

  function assertions(expected: number) {
    const errorGen = () =>
      new Error(
        `expected number of assertions to be ${expected}, but got ${expect.getState().assertionCalls}`,
      );
    expect.setState({
      expectedAssertionsNumber: expected,
      expectedAssertionsNumberErrorGen: errorGen,
    });
  }

  function hasAssertions() {
    const error = new Error('expected any number of assertion, but got none');
    expect.setState({
      isExpectingAssertions: true,
      isExpectingAssertionsError: error,
    });
  }

  chai.util.addMethod(expect, 'assertions', assertions);
  chai.util.addMethod(expect, 'hasAssertions', hasAssertions);

  setState(
    {
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberErrorGen: null,
    },
    expect,
  );

  return expect;
}

/**
 * Reset assertion state before each test try.
 */
function onBeforeTryTaskAssertions(expect: vitestApi.ExpectStatic) {
  setState(
    {
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberErrorGen: null,
    },
    expect,
  );
}

/**
 * Check assertion expectations after each test try.
 */
function onAfterTryTaskAssertions(expect: vitestApi.ExpectStatic) {
  const state = getState(expect);
  if (!state)
    return;

  const {
    assertionCalls,
    expectedAssertionsNumber,
    expectedAssertionsNumberErrorGen,
    isExpectingAssertions,
    isExpectingAssertionsError,
  } = state;

  if (expectedAssertionsNumber !== null && assertionCalls !== expectedAssertionsNumber) {
    throw expectedAssertionsNumberErrorGen!();
  }
  if (isExpectingAssertions === true && assertionCalls === 0) {
    throw isExpectingAssertionsError;
  }
}

export {
  configureSnapshotIO,
  configureSnapshotOptions,
  onAfterRunFiles,
  onAfterRunSuite,
  onAfterTryTaskAssertions,
  onBeforeRunSuite,
  onBeforeTryTask,
  onBeforeTryTaskAssertions,
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
