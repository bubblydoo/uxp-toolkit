import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupCdpSessionWithUxpDefaults, setupDevtoolsUrl, waitForExecutionContextCreated } from '@bubblydoo/uxp-cli-common';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin configuration - uses the fake plugin from uxp-cli-common
const pluginPath = path.resolve(__dirname, '../uxp-cli-common/fake-plugin');

export default defineConfig({
  test: {
    // Include only uxp test files
    include: ['src/**/*.uxp-test.ts', 'test/**/*.uxp-test.ts'],
    // Use the CDP pool to run tests in Photoshop
    pool: cdpPool({
      debug: true,
      cdp: async () => {
        // console.log('Setting up devtools URL');
        return await setupDevtoolsUrl(pluginPath);
      },
      executionContextOrSession: async (cdp) => {
        const executionContextPromise = waitForExecutionContextCreated(cdp);
        await setupCdpSessionWithUxpDefaults(cdp);
        const desc = await executionContextPromise;
        return { uniqueId: desc.uniqueId };
      },
      // debug: true,
      connectionTimeout: 60000,
      rpcTimeout: 10000, // Shorter timeout for debugging
    }),
    // Longer timeout for UXP tests
    testTimeout: 30000,
    // Don't run in watch mode by default
    watch: false,
  },
});
