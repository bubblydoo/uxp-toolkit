import type { CdpConnection, CdpPoolOptions } from './types';
import { setupCdpSession, setupCdpSessionWithDefaults, waitForExecutionContextCreated } from '@bubblydoo/uxp-cli-common';
import { evaluateInCdp } from './cdp-util';

/**
 * Set up a CDP session and wait for an execution context.
 */
export async function setupCdpConnection(
  cdpUrl: string,
  options: CdpPoolOptions,
  log: (...args: unknown[]) => void,
): Promise<CdpConnection> {
  log('Connecting to CDP at', cdpUrl);

  const cdp = await setupCdpSession(cdpUrl);

  const executionContextCreatedPromise = waitForExecutionContextCreated(cdp);

  await setupCdpSessionWithDefaults(cdp);

  return {
    cdp,
    executionContextUniqueId: (await executionContextCreatedPromise).uniqueId!,
    disconnect: async () => {
      try {
        await cdp.close();
      }
      catch {
        // Ignore close errors
      }
    },
  };
}

/**
 * Inject the worker runtime code into the CDP context.
 */
export async function injectWorkerRuntime(
  connection: CdpConnection,
  workerCode: string,
  log: (...args: unknown[]) => void,
): Promise<void> {
  log('Injecting worker runtime into CDP context...');

  await evaluateInCdp(connection, workerCode, { awaitPromise: false, returnByValue: false });

  log('Worker runtime injected successfully');
}
