import { app } from 'photoshop';
import { describe, expect, it } from 'vitest';
import { suspendHistory } from './suspendHistory';

describe('core/suspendHistory', () => {
  it('should return correctly', async () => {
    const document = app.activeDocument;
    if (!document) {
      throw new Error('No active document');
    }
    const result = await suspendHistory(document, 'Test', async () => {
      return 'test';
    });
    expect(result).toBe('test');
  });
});
