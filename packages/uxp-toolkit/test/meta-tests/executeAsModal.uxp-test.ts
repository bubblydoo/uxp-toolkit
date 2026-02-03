import { core } from 'photoshop';
import { describe, expect, it } from 'vitest';

describe('meta: executeAsModal', () => {
  it('should throw correctly', async () => {
    let threw = false;
    try {
      await core.executeAsModal(
        async () => {
          throw new Error('Uncaught error');
        },
        {
          commandName: 'Test',
        },
      );
    }
    catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  it('should return correctly', async () => {
    const result = await core.executeAsModal(
      async () => {
        return 'test';
      },
      {
        commandName: 'Test',
      },
    );
    expect(result).toBe('test');
  });
});
