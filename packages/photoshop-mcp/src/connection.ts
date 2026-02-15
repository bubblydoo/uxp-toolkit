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

let currentConnection: UxpConnection | null = null;

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
export async function getOrReuseUxpConnection(): Promise<UxpConnection> {
  // Return existing connection if available
  if (currentConnection) {
    return currentConnection;
  }

  const { pluginPath } = getPluginConfig();

  const connectionOrig = await createUxpConnection(pluginPath);

  const connection: UxpConnection = {
    cdp: connectionOrig.cdp,
    executionContext: connectionOrig.executionContext,
    disconnect: async () => {
      await connectionOrig.disconnect();
      currentConnection = null;
    },
  };

  currentConnection = connection;
  return connection;
}

/**
 * Disconnect from Photoshop if connected.
 */
export async function disconnectFromPhotoshop(): Promise<void> {
  if (currentConnection) {
    await currentConnection.disconnect();
  }
}
