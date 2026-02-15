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

  /**
   * Whether to force the teardown of the UXP connection, which will break watch mode.
   * Defaults to `false`.
   */
  forceConnectionTeardown?: boolean;
}

// Cached connection - with isolate: false and fileParallelism: false,
// there's only one worker so we just need simple caching.
// The cache is cleared when teardown runs to ensure subsequent pool
// initializations don't reuse a stale connection.
let cachedConnection: DevtoolsConnection | null = null;

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
    forceConnectionTeardown = false,
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

  // This is a bit tricky and ugly: we cannot start a connection twice in the same process,
  // so we need to reuse the connection in watch mode.
  // However, in single run mode, we need to tear down the connection, otherwise Vitest will
  // complain about a "hanging process".
  // I don't know if there is a better way to know if Vitest is running in "run" or "watch" mode,
  // but there is nothing in poolOptions afaik.
  const isSingleRunMode = process.argv.includes('--run') || process.argv.includes('run');

  return cdpPool({
    cdp: async () => {
      // Reuse existing connection if available
      if (cachedConnection) {
        log('Reusing existing UXP connection');
        return cachedConnection;
      }

      log('Creating new UXP connection...');
      const connection = await setupDevtoolsConnection(resolvedPluginPath);
      log(`UXP connection established: ${connection.url}`);

      // Wrap teardown to clear the cache when the connection is closed
      const originalTeardown = connection.teardown;
      cachedConnection = {
        ...connection,
        teardown: async () => {
          if (!isSingleRunMode && !forceConnectionTeardown) {
            log('Ignoring teardown');
            return;
          }
          log('Tearing down UXP connection...');
          cachedConnection = null;
          // This will tear down the Vulcan connection, and will make it so the process
          // cannot be reused to make a new connection.
          await originalTeardown();
          log('UXP connection teardown complete');
        },
      };

      return cachedConnection;
    },
    executionContextOrSession: async (cdp) => {
      const desc = await waitForExecutionContextCreated(cdp, async () => {
        await setupCdpSessionWithUxpDefaults(cdp);
      });
      return { uniqueId: desc.uniqueId };
    },
    runBeforeTests: enableInspect
      ? async () => {
        const websocketUrl = cachedConnection!.url;
        console.log('To continue, attach a debugger to the websocket or open the devtools URL in Chrome:');
        console.log('Websocket URL:', websocketUrl);
        const openDevtoolsUrl = new URL('devtools://devtools/bundled/inspector.html');
        openDevtoolsUrl.searchParams.set('ws', websocketUrl.replace('ws://', ''));
        console.log('Chrome devtools URL:', openDevtoolsUrl.toString());

        await new Promise<void>((resolve) => {
          cachedConnection!.events.on('connection', () => {
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
