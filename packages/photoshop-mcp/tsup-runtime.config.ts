import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['runtime-src/runtime-code.ts'],
  outDir: 'dist-runtime',
  format: ['cjs'],
  target: 'es2020',
  treeshake: true,
  noExternal: ['zod'],
  external: ['uxp', 'photoshop'],
  tsconfig: 'tsconfig.runtime.json',
  dts: {
    resolve: true,
  },
});
