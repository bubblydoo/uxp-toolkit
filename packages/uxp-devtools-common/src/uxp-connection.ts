import type { CdpSession } from './cdp-session';
import type { DevtoolsConnection } from './setup-devtools-url';
import { z } from 'zod';
import { setupCdpSession, waitForExecutionContextCreated } from './cdp-session';
import { setupDevtoolsConnection,
} from './setup-devtools-url';
import { setupCdpSessionWithUxpDefaults } from './uxp-cdp-defaults';

interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

export interface UxpConnection {
  cdpSession: CdpSession;
  executionContext: ExecutionContextDescription;
  devtoolsConnection: DevtoolsConnection;
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
  const cdpSession = await setupCdpSession(devtoolsConnection.url);

  console.error('[photoshop-mcp] Waiting for execution context...');
  const executionContext = await waitForExecutionContextCreated(cdpSession.cdp, async () => {
    console.error('[photoshop-mcp] Setting up CDP session with UXP defaults...');
    await setupCdpSessionWithUxpDefaults(cdpSession.cdp);
  });
  console.error('[photoshop-mcp] Execution context ready');

  const connection: UxpConnection = {
    cdpSession,
    executionContext,
    devtoolsConnection,
    disconnect: async () => {
      try {
        await cdpSession.cdp.close();
        await devtoolsConnection.teardown();
      }
      catch {
        // Ignore close errors
      }
    },
  };

  return connection;
}

const promiseStateSchema = z.object({
  value: z.enum(['pending', 'fulfilled', 'rejected']),
});

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
    const result = await connection.cdpSession.cdp.Runtime.evaluate({
      expression,
      uniqueContextId: connection.executionContext.uniqueId,
      awaitPromise: true, // unfortunately this is not supported
      // returnByValue: true, // if you do this you get almost nothing at all
      // generatePreview: true,
    });

    // console.error('result inside CDP.Runtime.evaluate', result);

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
        const promiseProperties = await connection.cdpSession.cdp.Runtime.getProperties({
          objectId: result.result.objectId!,
        });
        const promiseState = promiseStateSchema.parse(
          promiseProperties.internalProperties!.find((property: any) => property.name === '[[PromiseState]]')!.value!,
        );
        if (promiseState.value !== 'pending') {
          const promiseResult = promiseProperties.internalProperties!.find((property: any) => property.name === '[[PromiseResult]]')!.value;
          awaitedResult = promiseResult!;
          if (promiseState.value === 'rejected') {
            return {
              success: false,
              error: JSON.stringify(promiseResult, null, 2),
              errorStep: 'inside CDP.Runtime.evaluate: promise rejected',
            };
          }
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

    const objectResult = await connection.cdpSession.cdp.Runtime.getProperties({
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
