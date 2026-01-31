import type { ESLint, Linter } from 'eslint';
import noConstantsImport from './rules/no-constants-import';

const plugin: ESLint.Plugin = {
  meta: {
    name: '@bubblydoo/eslint-plugin-uxp',
    version: '0.0.1',
  },
  rules: {
    'no-constants-import': noConstantsImport,
  },
  configs: {},
};

// Add recommended config
plugin.configs!.recommended = {
  plugins: {
    uxp: plugin,
  },
  rules: {
    'uxp/no-constants-import': 'error',
  },
} as Linter.Config;

export default plugin;
