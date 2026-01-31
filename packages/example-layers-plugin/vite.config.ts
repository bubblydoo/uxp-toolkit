import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { uxp } from 'vite-uxp-plugin';
import { config } from './uxp.config';

const mode = process.env.MODE;

const shouldNotEmptyDir
  = mode === 'dev' && config.manifest.requiredPermissions?.enableAddon;

const nativeModules = [
  'photoshop',
  'uxp',
  'fs',
  'os',
  'path',
  'process',
  'shell',
];

export default defineConfig({
  plugins: [uxp(config, mode, { disablePolyfills: true }), react(), tsconfigPaths()],
  define: {
    BOLT_UXP_HOT_RELOAD_PORT: config.hotReloadPort,
    BOLT_UXP_MANIFEST_ID: JSON.stringify(config.manifest.id),
  },
  build: {
    sourcemap: !!(mode && ['dev', 'build'].includes(mode)),
    minify: false,
    emptyOutDir: !shouldNotEmptyDir,
    rollupOptions: {
      external: nativeModules.map(module => new RegExp(`^${module}\\b`)),
      output: {
        format: 'cjs',
      },
    },
  },
  publicDir: 'public',
  optimizeDeps: {
    exclude: nativeModules,
  },
});
