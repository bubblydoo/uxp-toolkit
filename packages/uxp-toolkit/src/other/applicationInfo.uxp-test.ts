import { describe, expect, it } from 'vitest';
import { photoshopGetApplicationInfo } from './applicationInfo';

describe('applicationInfo', () => {
  it('should get application info', async () => {
    const info = await photoshopGetApplicationInfo();
    expect(info.hostName).toContain('Adobe Photoshop');
  });
});
