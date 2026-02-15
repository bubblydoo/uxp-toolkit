import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  external: [
    'react',
    'react/jsx-runtime',
    '@tanstack/react-query',
    '@bubblydoo/uxp-toolkit',
    'zod',
    'photoshop',
    'uxp',
  ],
  clean: true,
  outDir: 'dist',
});
