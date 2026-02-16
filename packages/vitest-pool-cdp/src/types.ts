import type CDP from 'chrome-remote-interface';
import type esbuild from 'esbuild';

/**
 * Description of a JavaScript execution context in the CDP target.
 */
export interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

export type ExecutionContextOrSession = { uniqueId: string } | { id: number } | { sessionId: string };

export interface PoolEsbuildOptions {
  define?: esbuild.BuildOptions['define'];
  external?: esbuild.BuildOptions['external'];
  alias?: esbuild.BuildOptions['alias'];
  plugins?: esbuild.Plugin[];
}

export interface BaseCdpPoolOptions {
  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Timeout in milliseconds for establishing the CDP connection.
   * @default 5000
   */
  connectionTimeout?: number;

  /**
   * Timeout in milliseconds for RPC calls to the CDP context.
   * @default 30000
   */
  rpcTimeout?: number;

  /**
   * Options for esbuild.
   */
  esbuildOptions?: PoolEsbuildOptions;

  /**
   * Whether to embed the sourcemap as the `EVAL_SOURCEMAP` global variable
   * in the bundled code. This makes it available to code running in the CDP
   * context for its own use.
   *
   * @default false
   */
  embedSourcemap?: boolean;

  /**
   * Enable error sourcemapping: remaps stack traces, task locations, and
   * error frames from bundled (esbuild output) positions back to original
   * source positions. Also injects `//# sourceURL=filepath` so V8
   * attributes eval'd code to the original file.
   *
   * @default true
   */
  enableErrorSourcemapping?: boolean;

  /**
   * When true and `enableErrorSourcemapping` is also true, the original
   * (bundled) stack trace is preserved as `error.bundledStack` alongside
   * the remapped `error.stack`. Worker runtime frames are kept in the
   * bundled stack (no frame filtering).
   *
   * Useful for debugging sourcemap remapping issues.
   *
   * @default false
   */
  showBundledStackTrace?: boolean;

  /**
   * Optional function to run after the CDP connection is established.
   * Useful for waiting for debugger or something.
   */
  runBeforeTests?: (connection: CdpConnection) => Promise<void>;

  /**
   * Whether to reuse the CDP connection between tests, which is useful in watch mode.
   * It relies on explicit Vitest run/watch flags/commands (`--run`, `run`, `--watch`, `watch`)
   * and falls back to `process.env.CI`.
   *
   * It uses `signal-exit` to detect when the process is exiting and disconnect the connection.
   *
   * @default detect from explicit run/watch args, else !!process.env.CI
   */
  reuseConnection?: boolean;

  /**
   * Enable interactive hotkeys in the terminal.
   *
   * Currently supports:
   * - `d`: open the current CDP devtools session in Google Chrome.
   *
   * @default { enabled: true, openDevtools: openDevtoolsSessionInChrome }
   */
  hotkeys?: {
    /**
     * Whether to enable the hotkeys.
     *
     * @default true
     */
    enabled?: boolean;

    /**
     * Function to open the devtools session (e.g. in Google Chrome).
     *
     * @default openDevtoolsSessionInChrome
     */
    openDevtools?: (connection: CdpConnection) => Promise<void>;
  };
}

/**
 * Options for the CDP pool.
 */
export interface CdpPoolOptions extends BaseCdpPoolOptions {
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
  cdp: string | (() => Promise<string>) | (() => Promise<{ url: string; teardown: () => Promise<void> }>);

  /**
   * Optional function to get the execution context or session id.
   * By default, runs Target.setAutoAttach and waits for target to be attached and uses the target's session id.
   */
  executionContextOrSession?: (cdp: CDP.Client) => Promise<ExecutionContextOrSession>;
}

export interface RawCdpPoolOptions extends BaseCdpPoolOptions {
  connection: () => Promise<CdpConnection>;
}

/**
 * Name of the CDP binding used for worker → pool communication.
 * Created via Runtime.addBinding, this provides a dedicated message channel
 * that doesn't conflict with Chrome DevTools (unlike consoleAPICalled).
 */
export const CDP_BINDING_NAME = '__vitest_cdp_send__';

/**
 * Global function name exposed in the CDP context for receiving messages (pool → worker).
 */
export const CDP_RECEIVE_FUNCTION = '__vitest_cdp_receive__';

/**
 * Internal CDP connection state.
 */
export interface CdpConnection {
  url: string;
  cdp: CDP.Client;
  executionContextOrSession: ExecutionContextOrSession;
  disconnect: () => Promise<void>;
}

/**
 * Event callback type for the PoolWorker interface.
 */
export type EventCallback = (arg: unknown) => void;
