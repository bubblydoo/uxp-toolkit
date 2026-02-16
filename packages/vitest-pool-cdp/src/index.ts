/* eslint-disable no-console */
import type { PoolRunnerInitializer } from 'vitest/node';
import type { CdpPoolOptions, ExecutionContextDescription } from './types';
import { setupCdpConnection } from './cdp-bridge';
import { CdpPoolWorker } from './pool-worker';

export type { CdpPoolOptions, ExecutionContextDescription };

/**
 * Create a Vitest pool that runs tests in a CDP-connected environment.
 *
 * This pool communicates with the target runtime (browser, Photoshop UXP, Electron, etc.)
 * using the Chrome DevTools Protocol. Messages are sent via Runtime.evaluate and
 * responses are received via consoleAPICalled events.
 *
 * @param options - Configuration options for the CDP pool
 * @returns A PoolRunnerInitializer for Vitest
 *
 * @example
 * // vitest.config.ts
 * import { defineConfig } from "vitest/config";
 * import { cdpPool } from "@bubblydoo/vitest-pool-cdp";
 *
 * export default defineConfig({
 *   test: {
 *     pool: cdpPool({
 *       // Static WebSocket URL
 *       cdpUrl: "ws://localhost:9222/devtools/page/ABC123",
 *     }),
 *   },
 * });
 *
 * @example
 * // With dynamic URL (e.g., for Photoshop UXP)
 * import { setupDevtoolsUrl } from "@bubblydoo/uxp-devtools-common";
 *
 * export default defineConfig({
 *   test: {
 *     pool: cdpPool({
 *       cdpUrl: () => setupDevtoolsUrl(pluginPath, pluginId),
 *       debug: true,
 *     }),
 *   },
 * });
 *
 * @example
 * // With execution context filter
 * export default defineConfig({
 *   test: {
 *     pool: cdpPool({
 *       cdpUrl: "ws://localhost:9222/devtools/page/ABC123",
 *       executionContextOrSession: async (cdp) => {
 *         const desc = await waitForExecutionContextCreated(cdp);
 *         return { uniqueId: desc.uniqueId };
 *       },
 *     }),
 *   },
 * });
 */
export function cdpPool(options: CdpPoolOptions): PoolRunnerInitializer {
  return {
    name: 'cdp-pool',
    createPoolWorker: poolOptions => new CdpPoolWorker(poolOptions, {
      connection: async () => {
        // Get the CDP URL (may be a function)
        const cdpReturn = typeof options.cdp === 'function'
          ? await options.cdp()
          : options.cdp;

        const cdpUrl = typeof cdpReturn === 'object' && 'url' in cdpReturn ? cdpReturn.url : cdpReturn;

        const teardownFn = typeof cdpReturn === 'object' && 'teardown' in cdpReturn ? cdpReturn.teardown : undefined;
        // Establish CDP connection
        const connection = await setupCdpConnection(cdpUrl, {
          executionContextOrSession: options.executionContextOrSession,
          log: console.log,
          teardown: teardownFn,
        });

        return connection;
      },
      debug: options.debug,
      connectionTimeout: options.connectionTimeout,
      rpcTimeout: options.rpcTimeout,
      esbuildOptions: options.esbuildOptions,
      embedSourcemap: options.embedSourcemap,
      enableErrorSourcemapping: options.enableErrorSourcemapping,
      showBundledStackTrace: options.showBundledStackTrace,
      runBeforeTests: options.runBeforeTests,
      reuseConnection: options.reuseConnection,
      hotkeys: options.hotkeys,
    }),
  };
}

export { openDevtoolsSessionInChrome } from './open-devtools-session';

// Re-export the pool worker class for advanced use cases
export { CdpPoolWorker } from './pool-worker';
