import { defineConfig } from 'tsup';

export default defineConfig([
  // Main pool entry point (runs in Node.js)
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    external: ['vitest', 'vitest/node', 'vitest/worker', 'esbuild'],
  },
  // Worker runtime (bundled as IIFE for injection into CDP context)
  // This is a minimal runtime that provides RPC and eval capabilities.
  // vitest/worker is NOT bundled because it has Node.js dependencies
  // that don't work in UXP/browser environments.
  {
    entry: ['src/worker-runtime.ts'],
    format: ['iife'],
    outDir: 'dist',
    globalName: '__vitestCdpWorker',
    sourcemap: false,
    clean: false,
    splitting: false,
    treeshake: true,
    platform: 'browser',
    target: 'es2022',
    // Bundle only devalue for serialization
    noExternal: [/.*/],
  },
]);
