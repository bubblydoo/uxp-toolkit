import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/setup-devtools-url.ts', 'src/uxp-logger.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
