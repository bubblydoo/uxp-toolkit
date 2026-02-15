import { uxpPool } from '@bubblydoo/vitest-pool-uxp';
import { defineConfig } from 'vitest/config';
import { vitestPhotoshopAliasPlugin } from './vitest-photoshop-alias-plugin';

export default defineConfig({
  test: {
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['{src,test}/**/*.test.ts'],
          typecheck: {
            enabled: true,
            include: ['{src,test}/**/*.test-d.ts'],
          },
          sequence: {
            groupOrder: 0,
          },
        },
        plugins: [vitestPhotoshopAliasPlugin()],
      },
      {
        extends: true,
        test: {
          name: 'uxp',
          include: ['{src,test}/**/*.uxp-test.ts'],
          pool: uxpPool({
            // debug: true,
            enableErrorSourcemapping: true,
            embedSourcemap: true,
            showBundledStackTrace: true,
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
          sequence: {
            groupOrder: 1,
          },
        },
      },
    ],
  },
});
