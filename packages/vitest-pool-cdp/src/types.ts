import type CDP from 'chrome-remote-interface';

/**
 * Description of a JavaScript execution context in the CDP target.
 */
export interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

/**
 * Options for the CDP pool.
 */
export interface CdpPoolOptions {
  /**
   * WebSocket URL for the CDP connection, or an async function that returns one.
   *
   * @example
   * // Static URL
   * cdpUrl: "ws://localhost:9222/devtools/page/ABC123"
   *
   * @example
   * // Dynamic URL (e.g., for Photoshop UXP)
   * cdpUrl: async () => await setupDevtoolsUrl(pluginPath, pluginId)
   */
  cdpUrl: string | (() => Promise<string>);

  /**
   * Optional filter function to select a specific execution context.
   * By default, waits for the first execution context created event.
   */
  contextFilter?: (context: ExecutionContextDescription) => boolean;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Timeout in milliseconds for establishing the CDP connection.
   * @default 30000
   */
  connectionTimeout?: number;

  /**
   * Timeout in milliseconds for RPC calls to the CDP context.
   * @default 30000
   */
  rpcTimeout?: number;
}

/**
 * Message prefix used for communication between pool and worker.
 */
export const CDP_MESSAGE_PREFIX = '__VITEST_CDP_MSG__';

/**
 * Global function name exposed in the CDP context for receiving messages.
 */
export const CDP_RECEIVE_FUNCTION = '__vitest_cdp_receive__';

/**
 * Internal CDP connection state.
 */
export interface CdpConnection {
  cdp: CDP.Client;
  executionContext: {
    uniqueId: string;
  } | {
    id: number;
  } | {
    sessionId: string;
  };
  disconnect: () => Promise<void>;
}

/**
 * Event callback type for the PoolWorker interface.
 */
export type EventCallback = (arg: unknown) => void;
