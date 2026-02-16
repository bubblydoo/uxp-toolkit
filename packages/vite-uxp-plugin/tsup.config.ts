import { defineConfig } from 'tsup';

export default defineConfig([{
  entry: ['src/index.ts'],
  format: ['esm'],
  external: ['uxp', 'photoshop'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
}, {
  entry: ['src/runtime.ts', 'src/empty-runtime.ts'],
  format: ['cjs'],
  external: ['uxp', 'photoshop'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
}]);
