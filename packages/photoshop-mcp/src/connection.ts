import type { UxpConnection } from '@bubblydoo/uxp-devtools-common';
import { createRequire } from 'node:module';
import path from 'node:path';
import { createUxpConnection } from '@bubblydoo/uxp-devtools-common';

const requireResolve = createRequire(import.meta.url).resolve;

/**
 * Get the fake plugin path from uxp-devtools-common
 */
function getFakePluginPath(): string {
  const uxpDevtoolsCommonDir = path.dirname(requireResolve('@bubblydoo/uxp-devtools-common/package.json'));
  // Navigate from dist/connection.js to uxp-devtools-common/fake-plugin
  return path.resolve(uxpDevtoolsCommonDir, 'fake-plugin');
}

/**
 * Get plugin configuration from environment variables or use defaults.
 */
function getPluginConfig(): { pluginPath: string; pluginId: string } {
  const pluginPath = process.env.PHOTOSHOP_MCP_PLUGIN_PATH || getFakePluginPath();
  const pluginId = process.env.PHOTOSHOP_MCP_PLUGIN_ID || 'com.example.fakeplugin';
  return { pluginPath, pluginId };
}

declare global {
  // eslint-disable-next-line vars-on-top
  var currentConnectionPromise: Promise<UxpConnection> | null;
}

globalThis.currentConnectionPromise = null;

/**
 * Establishes a connection to Photoshop via CDP.
 * Uses the fake-plugin from uxp-devtools-common by default.
 *
 * Configuration via environment variables:
 * - PHOTOSHOP_MCP_PLUGIN_PATH: Path to the UXP plugin directory
 * - PHOTOSHOP_MCP_PLUGIN_ID: Plugin ID from manifest.json
 *
 * The connection is cached and reused for subsequent calls.
 */
export async function globalGetOrReuseUxpConnection(): Promise<UxpConnection> {
  // Return existing connection if available
  if (globalThis.currentConnectionPromise) {
    console.error('[photoshop-mcp] Returning existing connection');
    return globalThis.currentConnectionPromise;
  }

  console.error('[photoshop-mcp] Creating new connection');

  const { pluginPath } = getPluginConfig();

  const connectionPromise = createUxpConnection(pluginPath).then((connectionOrig) => {
    const connection: UxpConnection = {
      cdpSession: connectionOrig.cdpSession,
      executionContext: connectionOrig.executionContext,
      devtoolsConnection: connectionOrig.devtoolsConnection,
      disconnect: async () => {
        await connectionOrig.disconnect();
        globalThis.currentConnectionPromise = null;
      },
    };

    connection.cdpSession.events.on('disconnect', () => {
      globalThis.currentConnectionPromise = null;
    });

    return connection;
  }).catch((error) => {
    console.error('[photoshop-mcp] Error creating connection:', error);
    globalThis.currentConnectionPromise = null;
    throw error;
  });

  globalThis.currentConnectionPromise = connectionPromise;

  return connectionPromise;
}

/**
 * Disconnect from Photoshop if connected.
 */
export async function globalDisconnectFromPhotoshop(): Promise<void> {
  if (globalThis.currentConnectionPromise) {
    await globalThis.currentConnectionPromise.then(connection => connection.disconnect());
  }
}
