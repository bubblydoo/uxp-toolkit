import type { PoolRunnerInitializer } from 'vitest/node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  setupCdpSessionWithUxpDefaults,
  setupDevtoolsUrl,
  waitForExecutionContextCreated,
} from '@bubblydoo/uxp-devtools-common';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the path to the built-in fake plugin for vitest-pool-uxp.
 * This plugin displays "Vitest UXP Test Runner" in the panel.
 */
export function getDefaultPluginPath(): string {
  // In development: src/index.ts -> ../fake-plugin
  // In dist: dist/index.js -> ../fake-plugin
  return path.resolve(__dirname, '../fake-plugin');
}

/**
 * Options for the UXP pool.
 */
export interface UxpPoolOptions {
  /**
   * Path to the UXP plugin directory.
   * Defaults to the built-in "Vitest UXP Test Runner" plugin.
   */
  pluginPath?: string;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Timeout in milliseconds for establishing the CDP connection.
   * @default 60000
   */
  connectionTimeout?: number;

  /**
   * Timeout in milliseconds for RPC calls.
   * @default 10000
   */
  rpcTimeout?: number;
}

/**
 * Create a Vitest pool that runs tests in Adobe UXP environments (Photoshop, etc.).
 *
 * This pool wraps `@bubblydoo/vitest-pool-cdp` and `@bubblydoo/uxp-devtools-common`
 * to provide a simple way to run Vitest tests inside UXP.
 *
 * @param options - Configuration options for the UXP pool
 * @returns A PoolRunnerInitializer for Vitest
 *
 * @example
 * // vitest.config.ts
 * import { defineConfig } from "vitest/config";
 * import { uxpPool } from "@bubblydoo/vitest-pool-uxp";
 *
 * export default defineConfig({
 *   test: {
 *     include: ['src/**\/*.uxp-test.ts'],
 *     pool: uxpPool(),
 *     testTimeout: 30000,
 *     watch: false,
 *   },
 * });
 *
 * @example
 * // With custom plugin
 * import { uxpPool } from "@bubblydoo/vitest-pool-uxp";
 *
 * export default defineConfig({
 *   test: {
 *     pool: uxpPool({
 *       pluginPath: "./my-uxp-plugin",
 *       debug: true,
 *     }),
 *   },
 * });
 */
export function uxpPool(options: UxpPoolOptions = {}): PoolRunnerInitializer {
  const {
    pluginPath = getDefaultPluginPath(),
    debug = false,
    connectionTimeout = 60000,
    rpcTimeout = 10000,
  } = options;

  const resolvedPluginPath = path.isAbsolute(pluginPath)
    ? pluginPath
    : path.resolve(process.cwd(), pluginPath);

  return cdpPool({
    debug,
    cdp: async () => {
      return await setupDevtoolsUrl(resolvedPluginPath);
    },
    executionContextOrSession: async (cdp) => {
      const executionContextPromise = waitForExecutionContextCreated(cdp);
      await setupCdpSessionWithUxpDefaults(cdp);
      const desc = await executionContextPromise;
      return { uniqueId: desc.uniqueId };
    },
    connectionTimeout,
    rpcTimeout,
  });
}

// Re-export types and utilities that users might need
export type { PoolRunnerInitializer };
export { getDefaultPluginPath as getFakePluginPath };
