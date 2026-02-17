import { stripAdobeProtocolPlugin } from '@bubblydoo/esbuild-adobe-protocol-plugin';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands-library/index.ts'],
  format: 'esm',
  dts: true,
  external: ['photoshop', 'uxp'],
  outDir: 'dist',
  esbuildPlugins: [
    stripAdobeProtocolPlugin(),
  ],
});
