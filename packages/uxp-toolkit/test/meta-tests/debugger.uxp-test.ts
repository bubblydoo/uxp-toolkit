import { expect, it } from 'vitest';

it('is a test to see how vitest handles debugger statements', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('DEBUGGERING');
  // eslint-disable-next-line no-debugger
  debugger;
  console.log('DEBUGGERED');
  expect(true).toBe(true);
});
