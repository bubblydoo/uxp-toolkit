/* eslint-disable no-console */
import type { DevtoolsConnection } from '@bubblydoo/uxp-devtools-common';
import type { PoolRunnerInitializer } from 'vitest/node';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  setGlobalUxpLoggerLevel,
  setupCdpSessionWithUxpDefaults,
  setupDevtoolsConnection,
  waitForExecutionContextCreated,
} from '@bubblydoo/uxp-devtools-common';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';

type CdpPoolOptions = Parameters<typeof cdpPool>[0];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the path to the built-in plugin for vitest-pool-uxp.
 * This plugin displays live test execution status in the panel.
 */
export function getDefaultPluginPath(): string {
  // In development: src/index.ts -> ../plugin
  // In dist: dist/index.js -> ../plugin
  return path.resolve(__dirname, '../plugin');
}

/**
 * Options for the UXP pool.
 */
export interface UxpPoolOptions extends Omit<CdpPoolOptions, 'cdp'> {
  /**
   * Whether to enable the inspect mode.
   * Defaults to `process.env.UXP_INSPECT` or `false`.
   */
  inspect?: boolean;

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
    inspect = false,
    debug = false,
    mainDirectory = process.cwd(),
    embedSourcemap = true,
    enableErrorSourcemapping = true,
  } = options;

  if (debug) {
    setGlobalUxpLoggerLevel('debug');
  }

  const resolvedPluginPath = path.isAbsolute(pluginPath)
    ? pluginPath
    : path.resolve(process.cwd(), pluginPath);

  const log = debug
    ? (...args: unknown[]) => console.log('[vitest-pool-uxp]', ...args)
    : () => {};

  const enableInspect = inspect || ['1', 'true'].includes(process.env.UXP_INSPECT ?? '');

  let cachedDevtoolsConnection: DevtoolsConnection | null = null;

  return cdpPool({
    cdp: async () => {
      log('Creating new UXP connection...');
      const devtoolsConnection = await setupDevtoolsConnection(resolvedPluginPath);
      log(`UXP connection established: ${devtoolsConnection.url}`);

      cachedDevtoolsConnection = devtoolsConnection;

      return devtoolsConnection;
    },
    executionContextOrSession: async (cdp) => {
      const desc = await waitForExecutionContextCreated(cdp, async () => {
        await setupCdpSessionWithUxpDefaults(cdp);
      });
      return { uniqueId: desc.uniqueId };
    },
    runBeforeTests: enableInspect
      ? async (connection) => {
        const websocketUrl = connection.url;
        console.log('To continue, attach a debugger to the websocket or open the devtools URL in Chrome:');
        console.log('Websocket URL:', websocketUrl);
        const openDevtoolsUrl = new URL('devtools://devtools/bundled/inspector.html');
        openDevtoolsUrl.searchParams.set('ws', websocketUrl.replace('ws://', ''));
        console.log('Chrome devtools URL:', openDevtoolsUrl.toString());

        await new Promise<void>((resolve) => {
          cachedDevtoolsConnection!.events.on('connection', () => {
            resolve();
          });
        });

        console.log('New connection established, continuing...');
      }
      : undefined,
    embedSourcemap,
    enableErrorSourcemapping,
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
