import { uxp } from '@bubblydoo/vite-uxp-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { manifest } from './uxp.config';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    uxp(manifest) as any,
  ],
  build: {
    sourcemap: true,
    minify: false,
  },
  publicDir: 'public',
});
