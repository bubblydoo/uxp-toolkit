import type { ESLint, Linter } from 'eslint';
import noCssGap from './rules/no-css-gap';
import noTailwindGapUtility from './rules/no-tailwind-gap-utility';
import preferAdobeProtocol from './rules/prefer-adobe-protocol';

const plugin: ESLint.Plugin = {
  meta: {
    name: '@bubblydoo/eslint-plugin-uxp',
    version: '0.0.1',
  },
  rules: {
    'no-unsupported-css': noCssGap,
    'no-unsupported-css-tailwind': noTailwindGapUtility,
    'prefer-adobe-protocol': preferAdobeProtocol,
  },
  configs: {},
};

// Add recommended config
plugin.configs!.recommended = {
  plugins: {
    uxp: plugin,
  },
  rules: {
    'uxp/no-unsupported-css': 'error',
    'uxp/no-unsupported-css-tailwind': 'error',
    'uxp/prefer-adobe-protocol': 'error',
  },
} as Linter.Config;

export default plugin;
