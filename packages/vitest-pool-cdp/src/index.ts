import type { PoolRunnerInitializer } from 'vitest/node';
import type { CdpPoolOptions, ExecutionContextDescription } from './types';
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
 * import { setupDevtoolsUrl } from "@bubblydoo/uxp-cli-common";
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
 *       contextFilter: (context) => context.origin.includes("my-app"),
 *     }),
 *   },
 * });
 */
export function cdpPool(options: CdpPoolOptions): PoolRunnerInitializer {
  return {
    name: 'cdp-pool',
    createPoolWorker: poolOptions => new CdpPoolWorker(poolOptions, options),
  };
}

// Re-export the pool worker class for advanced use cases
export { CdpPoolWorker } from './pool-worker';
