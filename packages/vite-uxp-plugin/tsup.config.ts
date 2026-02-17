import { stripAdobeProtocolPlugin } from '@bubblydoo/esbuild-adobe-protocol-plugin';
import { defineConfig } from 'tsup';

export default defineConfig([{
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  external: ['uxp', 'photoshop'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  esbuildPlugins: [
    stripAdobeProtocolPlugin(),
  ],
}, {
  entry: ['src/runtime.ts', 'src/empty-runtime.ts'],
  format: ['cjs'],
  outDir: 'dist-runtime',
  external: ['uxp', 'photoshop'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  esbuildPlugins: [
    stripAdobeProtocolPlugin(),
  ],
}]);
