import { uxpPool } from '@bubblydoo/vitest-pool-uxp';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include only uxp test files
    include: ['src/**/*.uxp-test.ts', 'test/**/*.uxp-test.ts'],
    // Use the UXP pool to run tests in Photoshop
    pool: uxpPool({
      debug: true,
    }),
    // Longer timeout for UXP tests
    testTimeout: 30000,
    // Don't run in watch mode by default
    watch: false,
  },
});
