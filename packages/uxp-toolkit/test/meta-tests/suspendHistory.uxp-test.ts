import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';

describe('meta: suspendHistory', () => {
  it('should throw correctly', async (t) => {
    const document = await openFixture(t, 'one-layer.psd');

    let threw = false;
    try {
      await document.suspendHistory(
        async () => {
          throw new Error('Uncaught error');
        },
        'Test',
      );
    }
    catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
