/* eslint-disable no-console */
import type { PoolRunnerInitializer } from 'vitest/node';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  setupCdpSessionWithUxpDefaults,
  setupDevtoolsConnection,
  waitForExecutionContextCreated,
} from '@bubblydoo/uxp-devtools-common';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';

type CdpPoolOptions = Parameters<typeof cdpPool>[0];

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
export interface UxpPoolOptions extends Omit<CdpPoolOptions, 'cdp'> {
  /**
   * Path to the UXP plugin directory.
   * Defaults to the built-in "Vitest UXP Test Runner" plugin.
   */
  pluginPath?: string;

  /**
   * This string gets passed as "UXP_MAIN_DIRECTORY" to the test file.
   *
   * @default process.cwd()
   */
  mainDirectory?: string;
}

// Cached connection - with isolate: false and fileParallelism: false,
// there's only one worker so we just need simple caching
let cachedConnection: { url: string; teardown: () => Promise<void> } | null = null;

/**
 * Create a Vitest pool that runs tests in Adobe UXP environments (Photoshop, etc.).
 *
 * This pool wraps `@bubblydoo/vitest-pool-cdp` and `@bubblydoo/uxp-devtools-common`
 * to provide a simple way to run Vitest tests inside UXP.
 *
 * IMPORTANT: Adobe's Vulcan system only supports a single connection per process.
 * You MUST use `isolate: false` and `fileParallelism: false` in your vitest config
 * to prevent multiple workers from trying to initialize Vulcan simultaneously.
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
 *     // Required: UXP/Vulcan only supports a single connection
 *     isolate: false,
 *     fileParallelism: false,
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
 *     isolate: false,
 *     fileParallelism: false,
 *   },
 * });
 */
export function uxpPool(options: UxpPoolOptions = {}): PoolRunnerInitializer {
  const {
    pluginPath = getDefaultPluginPath(),
    debug = false,
    mainDirectory = process.cwd(),
    embedSourcemap = true,
  } = options;

  const resolvedPluginPath = path.isAbsolute(pluginPath)
    ? pluginPath
    : path.resolve(process.cwd(), pluginPath);

  const log = debug
    ? (...args: unknown[]) => console.log('[vitest-pool-uxp]', ...args)
    : () => {};

  return cdpPool({
    cdp: async () => {
      // Reuse existing connection if available
      if (cachedConnection) {
        log('Reusing existing UXP connection');
        return cachedConnection;
      }

      log('Creating new UXP connection...');
      cachedConnection = await setupDevtoolsConnection(resolvedPluginPath);
      log(`UXP connection established: ${cachedConnection.url}`);

      return cachedConnection;
    },
    executionContextOrSession: async (cdp) => {
      const desc = await waitForExecutionContextCreated(cdp, async () => {
        await setupCdpSessionWithUxpDefaults(cdp);
      });
      return { uniqueId: desc.uniqueId };
    },
    embedSourcemap,
    ...options,
    esbuildOptions: {
      ...options.esbuildOptions,
      define: {
        ...options.esbuildOptions?.define,
        UXP_MAIN_DIRECTORY: JSON.stringify(mainDirectory),
      },
    },
  });
}

// Re-export types and utilities that users might need
export type { PoolRunnerInitializer };
export { getDefaultPluginPath as getFakePluginPath };
