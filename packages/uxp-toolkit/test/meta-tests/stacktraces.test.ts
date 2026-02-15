import { it } from 'vitest';

function throwError() {
  throw new Error('Test error', { cause: new Error('Cause error') });
}

it.skip('is a test to see how vitest handles stack traces', () => {
  throwError();
});
