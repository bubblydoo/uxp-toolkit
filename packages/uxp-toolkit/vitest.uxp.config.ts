import { uxpPool } from '@bubblydoo/vitest-pool-uxp';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include only uxp test files
    include: ['src/**/*.uxp-test.ts', 'test/**/*.uxp-test.ts'],
    // Use the UXP pool to run tests in Photoshop
    pool: uxpPool({
      esbuildOptions: {
        alias: {
          url: 'url-shim',
        },
      },
    }),
    // IMPORTANT: UXP/Vulcan only supports a single connection
    // Disable VM isolation to share state across test files
    isolate: false,
    // Force sequential file execution
    fileParallelism: false,
    maxWorkers: 1,
    // Longer timeout for UXP tests
    testTimeout: 30000,
    // Don't run in watch mode by default
    watch: false,
  },
});
