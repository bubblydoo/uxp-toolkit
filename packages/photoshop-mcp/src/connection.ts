import type CDP from 'chrome-remote-interface';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  setupCdpSession,
  setupCdpSessionWithUxpDefaults,
  setupDevtoolsUrl,
  waitForExecutionContextCreated,
} from '@bubblydoo/uxp-devtools-common';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

export interface PhotoshopConnection {
  cdp: CDP.Client;
  executionContext: ExecutionContextDescription;
  disconnect: () => Promise<void>;
}

let currentConnection: PhotoshopConnection | null = null;

/**
 * Get the fake plugin path from uxp-devtools-common
 */
function getFakePluginPath(): string {
  // Navigate from dist/connection.js to uxp-devtools-common/fake-plugin
  return path.resolve(__dirname, '../../uxp-devtools-common/fake-plugin');
}

/**
 * Get plugin configuration from environment variables or use defaults.
 */
function getPluginConfig(): { pluginPath: string; pluginId: string } {
  const pluginPath = process.env.PHOTOSHOP_MCP_PLUGIN_PATH || getFakePluginPath();
  const pluginId = process.env.PHOTOSHOP_MCP_PLUGIN_ID || 'com.example.fakeplugin';
  return { pluginPath, pluginId };
}

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
export async function getOrReusePhotoshopConnection(): Promise<PhotoshopConnection> {
  // Return existing connection if available
  if (currentConnection) {
    return currentConnection;
  }

  const { pluginPath } = getPluginConfig();

  console.error('[photoshop-mcp] Setting up devtools URL...');
  const cdtUrl = await setupDevtoolsUrl(pluginPath);
  console.error(`[photoshop-mcp] DevTools URL: ${cdtUrl}`);

  console.error('[photoshop-mcp] Setting up CDP session...');
  const cdp = await setupCdpSession(cdtUrl);

  const executionContextCreatedPromise = waitForExecutionContextCreated(cdp);

  await setupCdpSessionWithUxpDefaults(cdp);

  console.error('[photoshop-mcp] Waiting for execution context...');
  const executionContext = await executionContextCreatedPromise;
  console.error('[photoshop-mcp] Execution context ready');

  const connection: PhotoshopConnection = {
    cdp,
    executionContext,
    disconnect: async () => {
      try {
        await cdp.close();
      }
      catch {
        // Ignore close errors
      }
      currentConnection = null;
    },
  };

  currentConnection = connection;
  return connection;
}

/**
 * Evaluate JavaScript code in the Photoshop UXP context.
 */
export async function evaluateInPhotoshop(
  connection: PhotoshopConnection,
  expression: string,
  awaitPromise: boolean,
): Promise<{
  success: true;
  result: {
    value: unknown;
    objectId: string;
  };
} | {
  success: false;
  error: string;
  errorStep: string;
}> {
  try {
    const result = await connection.cdp.Runtime.evaluate({
      expression,
      uniqueContextId: connection.executionContext.uniqueId,
      awaitPromise: true, // unfortunately this is not supported
      // returnByValue: true, // if you do this you get almost nothing at all
      // generatePreview: true,
    });

    console.error('result inside CDP.Runtime.evaluate', result);

    if (result.exceptionDetails) {
      const error = result.exceptionDetails.exception?.description
        || result.exceptionDetails.text
        || 'Unknown error';
      console.error('error inside CDP.Runtime.evaluate', result.exceptionDetails);
      return {
        success: false,
        error,
        errorStep: 'inside CDP.Runtime.evaluate',
      };
    }

    if (result.result.type !== 'object') {
      return {
        success: true,
        result: {
          value: result.result.value!,
          objectId: result.result.objectId!,
        },
      };
    }

    let awaitedResult = result.result;

    if (result.result.subtype === 'promise' && awaitPromise) {
      // let attempts = 0;
      while (true) {
        // attempts++;
        const promiseProperties = await connection.cdp.Runtime.getProperties({
          objectId: result.result.objectId!,
        });
        const promiseState = promiseProperties.internalProperties!.find((property: any) => property.name === '[[PromiseState]]')!.value!;
        if (promiseState.value !== 'pending') {
          const promiseResult = promiseProperties.internalProperties!.find((property: any) => property.name === '[[PromiseResult]]')!.value;
          awaitedResult = promiseResult!;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (awaitedResult.type !== 'object') {
      return {
        success: true,
        result: {
          value: awaitedResult.value!,
          objectId: awaitedResult.objectId!,
        },
      };
    }

    const objectResult = await connection.cdp.Runtime.getProperties({
      objectId: awaitedResult.objectId!,
      ownProperties: true,
    });

    const objectResultValue: any = {};
    for (const property of objectResult.result) {
      objectResultValue[property.name] = property.value;
    }

    return {
      success: true,
      result: {
        objectId: awaitedResult.objectId!,
        value: objectResultValue,
      },
    };
  }
  catch (error) {
    console.error('Error evaluating in Photoshop', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorStep: 'calling CDP.Runtime.evaluate',
    };
  }
}

/**
 * Disconnect from Photoshop if connected.
 */
export async function disconnectFromPhotoshop(): Promise<void> {
  if (currentConnection) {
    await currentConnection.disconnect();
  }
}
