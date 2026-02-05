import ErrorStackParser from 'error-stack-parser';
import { expect, it } from 'vitest';
import { replaceEvalAndAnonymousStack } from './sourcemaps';

// const errorString = 'Error: Uncaught error\n'
//   + '    at throwError (eval at importFile (:12499:18), <anonymous>:2351:11)\n'
//   + '    at eval (eval at importFile (:12499:18), <anonymous>:2357:9)\n'
//   + '    at <anonymous>:4350:16\n'
//   + '    at <anonymous>:4876:30\n'
//   + '    at <anonymous>:5190:26\n'
//   + '    at new Promise (<anonymous>)\n'
//   + '    at runWithTimeout (<anonymous>:5161:14)\n'
//   + '    at <anonymous>:5585:44\n'
//   + '    at defaultTrace (<anonymous>:5832:14)\n'
//   + '    at runTest (<anonymous>:5585:19)';

const stack = '    at throwError (eval at importFile (:12499:18), <anonymous>:2351:11)\n'
  + '    at eval (eval at importFile (:12499:18), <anonymous>:2357:9)\n'
  + '    at <anonymous>:4350:16\n'
  + '    at <anonymous>:4876:30\n'
  + '    at <anonymous>:5190:26\n'
  + '    at new Promise (<anonymous>)\n'
  + '    at runWithTimeout (<anonymous>:5161:14)\n'
  + '    at <anonymous>:5585:44\n'
  + '    at defaultTrace (<anonymous>:5832:14)\n'
  + '    at runTest (<anonymous>:5585:19)';

it('should change the anonymous stacks and replace them with eval-anonymous', () => {
  const fixedStack = replaceEvalAndAnonymousStack(stack);
  const parsedError = ErrorStackParser.parse({
    message: 'Uncaught error',
    name: 'Error',
    stack: fixedStack,
  });
  expect(parsedError).toMatchInlineSnapshot(`
    [
      {
        "columnNumber": 11,
        "fileName": "eval-anonymous",
        "functionName": "throwError",
        "lineNumber": 2351,
        "source": "    at throwError (eval-anonymous:2351:11)",
      },
      {
        "columnNumber": 9,
        "fileName": "eval-anonymous",
        "functionName": "eval",
        "lineNumber": 2357,
        "source": "    at eval (eval-anonymous:2357:9)",
      },
      {
        "columnNumber": 16,
        "fileName": "eval-anonymous",
        "lineNumber": 4350,
        "source": "    at eval-anonymous:4350:16",
      },
      {
        "columnNumber": 30,
        "fileName": "eval-anonymous",
        "lineNumber": 4876,
        "source": "    at eval-anonymous:4876:30",
      },
      {
        "columnNumber": 26,
        "fileName": "eval-anonymous",
        "lineNumber": 5190,
        "source": "    at eval-anonymous:5190:26",
      },
      {
        "columnNumber": 14,
        "fileName": "eval-anonymous",
        "functionName": "runWithTimeout",
        "lineNumber": 5161,
        "source": "    at runWithTimeout (eval-anonymous:5161:14)",
      },
      {
        "columnNumber": 44,
        "fileName": "eval-anonymous",
        "lineNumber": 5585,
        "source": "    at eval-anonymous:5585:44",
      },
      {
        "columnNumber": 14,
        "fileName": "eval-anonymous",
        "functionName": "defaultTrace",
        "lineNumber": 5832,
        "source": "    at defaultTrace (eval-anonymous:5832:14)",
      },
      {
        "columnNumber": 19,
        "fileName": "eval-anonymous",
        "functionName": "runTest",
        "lineNumber": 5585,
        "source": "    at runTest (eval-anonymous:5585:19)",
      },
    ]
  `);
});
