import type CDP from 'chrome-remote-interface';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupCdpSession, waitForExecutionContextCreated } from './cdp-session';
import { setupDevtoolsConnection,
} from './setup-devtools-url';
import { setupCdpSessionWithUxpDefaults } from './uxp-cdp-defaults';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

export interface UxpConnection {
  cdp: CDP.Client;
  executionContext: ExecutionContextDescription;
  disconnect: () => Promise<void>;
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
export async function createUxpConnection(pluginPath: string): Promise<UxpConnection> {
  console.error('[photoshop-mcp] Setting up devtools URL...');
  const devtoolsConnection = await setupDevtoolsConnection(pluginPath);
  console.error(`[photoshop-mcp] DevTools URL: ${devtoolsConnection.url}`);

  console.error('[photoshop-mcp] Setting up CDP session...');
  const cdp = await setupCdpSession(devtoolsConnection.url);

  console.error('[photoshop-mcp] Waiting for execution context...');
  const executionContext = await waitForExecutionContextCreated(cdp, async () => {
    console.error('[photoshop-mcp] Setting up CDP session with UXP defaults...');
    await setupCdpSessionWithUxpDefaults(cdp);
  });
  console.error('[photoshop-mcp] Execution context ready');

  const connection: UxpConnection = {
    cdp,
    executionContext,
    disconnect: async () => {
      try {
        await cdp.close();
        await devtoolsConnection.teardown();
      }
      catch {
        // Ignore close errors
      }
    },
  };

  return connection;
}

/**
 * Evaluate JavaScript code in the UXP context.
 */
export async function evaluateInUxp(
  connection: UxpConnection,
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
      // TODO: store promise in global var so it's not GC'ed
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
    console.error('Error evaluating in UXP', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorStep: 'calling CDP.Runtime.evaluate',
    };
  }
}
