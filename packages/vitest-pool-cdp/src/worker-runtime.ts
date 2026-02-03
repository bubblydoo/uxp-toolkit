/**
 * Worker runtime that gets injected into the CDP context.
 * This file is bundled as an IIFE and injected via Runtime.evaluate.
 *
 * It provides a birpc-based message bridge for communication with the pool.
 * Since vitest/worker has Node.js dependencies that don't work in UXP,
 * we implement a simpler protocol where the pool orchestrates test execution.
 */

import type { BirpcReturn } from 'birpc';
import type { PoolFunctions, WorkerFunctions } from './rpc-types';
import { createBirpc } from 'birpc';
import * as devalue from 'devalue';

declare global {
  var require: NodeJS.Require;
  var nativeRequire: NodeJS.Require | undefined;
  var __VITEST_CDP_WORKER_RUNNING__: boolean;
  var __vitest_cdp_rpc__: BirpcReturn<PoolFunctions, WorkerFunctions>;
}

const MESSAGE_PREFIX = '__VITEST_CDP_MSG__';

// Message handler callback registered by birpc
let messageHandler: ((data: string) => void) | null = null;

/**
 * Worker functions exposed to the pool via birpc.
 */
const workerFunctions: WorkerFunctions = {
  ping() {
    return 'pong';
  },

  eval(code: string) {
    // eslint-disable-next-line no-eval
    const result = globalThis.eval(code);

    // Handle promises synchronously - birpc will handle the promise resolution
    return result;
  },

  getGlobals() {
    return {
      hasPhotoshop: typeof globalThis.require === 'function',
      hasUxp: typeof globalThis.require === 'function',
    };
  },
};

/**
 * Create the birpc instance for communication with the pool.
 * Uses devalue for serialization to handle complex objects, dates, etc.
 */
const rpc = createBirpc<PoolFunctions, WorkerFunctions>(
  workerFunctions,
  {
    post: (data: string) => {
      // data is already serialized by birpc using devalue.stringify
      console.debug(MESSAGE_PREFIX, data);
    },
    on: (fn) => {
      messageHandler = fn;
    },
    // Use devalue for serialization to handle complex types
    serialize: v => devalue.stringify(v),
    deserialize: v => devalue.parse(v as string),
  },
);

/**
 * Global function exposed for the pool to send messages via Runtime.evaluate.
 * Receives serialized string from pool and passes to birpc for deserialization.
 */
(globalThis as Record<string, unknown>).__vitest_cdp_receive__ = (serialized: string): void => {
  try {
    if (messageHandler) {
      // Pass the serialized string directly to birpc - it will deserialize
      messageHandler(serialized);
    }
  }
  catch (error) {
    console.error('[vitest-cdp-worker] Error processing message:', error);
  }
};

/**
 * Mark that the CDP worker runtime is active.
 */
globalThis.__VITEST_CDP_WORKER_RUNNING__ = true;

/**
 * Expose the RPC instance globally for use in test code if needed.
 */
globalThis.__vitest_cdp_rpc__ = rpc;

// Log that the worker runtime has been initialized
console.log('[vitest-cdp-worker] Worker runtime initialized with birpc');
