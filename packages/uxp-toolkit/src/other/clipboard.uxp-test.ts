import { describe, expect, it } from 'vitest';
import { copyToClipboard, readFromClipboard } from './clipboard';

describe('clipboard', () => {
  it('should copy and read from clipboard', async () => {
    const originalClipboard = await readFromClipboard();
    try {
      await copyToClipboard('test');
      const clipboard = await readFromClipboard();
      expect(clipboard).toBe('test');
    }
    finally {
      await copyToClipboard(originalClipboard);
    }
  });
});
