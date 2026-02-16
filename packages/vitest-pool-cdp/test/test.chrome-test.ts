import { describe, expect, it } from 'vitest';

describe('Chrome', () => {
  it('should work', () => {
    expect(true).toEqual(true);
  });

  // it.skip('should sourcemap errors', () => {
  //   throw new Error('test');
  // });

  // it.only('should allow only', () => {
  //   expect(true).toEqual(true);
  // });

  it('should handle inline snapshots', () => {
    expect({ a: 1 }).toMatchInlineSnapshot(`
  {
    "a": 1,
  }
`);
  });

  it('can take a while', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(true).toEqual(true);
  });
});
