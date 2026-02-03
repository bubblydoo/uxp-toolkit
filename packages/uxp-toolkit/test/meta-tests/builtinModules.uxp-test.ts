import { describe, expect, it } from 'vitest';

function doesImportExist(module: string) {
  try {
    // eslint-disable-next-line ts/no-require-imports
    require(module);
    return true;
  }
  catch {
    return false;
  }
}

describe('meta: builtin modules', () => {
  it('should have expected builtin modules available', async () => {
    const testModules = [
      'photoshop',
      'uxp',
      'fs',
      'os',
      'path',
      'process',
      'shell',
      'http',
      'https',
      'url',
      'util',
      'crypto',
      'stream',
      'zlib',
    ];
    const successModules = testModules.filter(module => doesImportExist(module));
    expect(successModules).toEqual([
      'photoshop',
      'uxp',
      'fs',
      'os',
      'path',
      'process',
    ]);
  });
});
