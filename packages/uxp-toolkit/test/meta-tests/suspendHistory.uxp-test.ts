import { app } from 'photoshop';
import { describe, expect, it } from 'vitest';

describe('meta: suspendHistory', () => {
  it('should throw correctly', async () => {
    const document = app.activeDocument;
    if (!document) {
      throw new Error('No active document');
    }

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
