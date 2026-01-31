import antfu from '@antfu/eslint-config';
import uxpPlugin from '@bubblydoo/eslint-plugin-uxp';

export default antfu(
  {
    type: 'lib',
    react: true,
    typescript: true,
    stylistic: {
      semi: true,
    },
    markdown: false,
    formatters: {
      css: true,
      html: true,
    },
    rules: {
      'no-console': 'warn',
      'ts/explicit-function-return-type': 'off',
      'node/prefer-global/process': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: [
      '**/*.{ts,tsx}',
    ],
    plugins: {
      uxp: uxpPlugin,
    },
  },
);
