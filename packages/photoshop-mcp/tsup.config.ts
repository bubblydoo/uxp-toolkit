import { stripAdobeProtocolPlugin } from '@bubblydoo/esbuild-adobe-protocol-plugin';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    shims: true,
  },
  {
    entry: ['runtime-src/runtime-code.ts'],
    outDir: 'dist-runtime',
    format: ['cjs'],
    target: 'es2020',
    treeshake: true,
    noExternal: ['zod'],
    external: ['uxp', 'photoshop'],
    esbuildPlugins: [stripAdobeProtocolPlugin()],
    tsconfig: 'tsconfig.runtime.json',
    dts: {
      resolve: true,
    },
  },
]);
