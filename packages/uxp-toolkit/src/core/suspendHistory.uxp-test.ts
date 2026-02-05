import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { suspendHistory } from './suspendHistory';

describe('core/suspendHistory', () => {
  it('should return correctly', async (t) => {
    const doc = await openFixture(t, 'one-layer.psd'); // some document needs to be open
    const result = await suspendHistory(doc, 'Test', async () => {
      return 'test';
    });
    expect(result).toBe('test');
  });
});
