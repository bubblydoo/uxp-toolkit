import type { Test } from '@bubblydoo/uxp-test-framework';
import { expect } from 'chai';

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

export const builtinModulesTest: Test = {
  name: 'builtinModules',
  description: 'should have expected builtin modules available',
  run: async () => {
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
    expect(successModules).to.deep.equal([
      'photoshop',
      'uxp',
      'fs',
      'os',
      'path',
      'process',
    ]);
  },
};
