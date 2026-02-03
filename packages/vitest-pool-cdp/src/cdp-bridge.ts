import type CDP from 'chrome-remote-interface';
import type { CdpConnection, CdpPoolOptions } from './types';
import { setupCdpSession, setupCdpSessionWithUxpDefaults, waitForExecutionContextCreated } from '@bubblydoo/uxp-cli-common';
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

  const targetAttachedPromise = waitForAttachedToTarget(cdp);

  const executionContextPromise = waitForExecutionContextCreated(cdp).then(context => ({ uniqueId: context.uniqueId }));

  executionContextPromise.then((context) => {
    console.log('executionContextPromise', context);
  });

  await cdp.Target.setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
  await cdp.Target.setDiscoverTargets({ discover: true });
  await cdp.Target.setRemoteLocations({ locations: [{ host: 'localhost', port: 9293 }] });
  await cdp.Runtime.runIfWaitingForDebugger();

  const { sessionId } = await targetAttachedPromise;

  await cdp.Network.enable({}, sessionId);
  await cdp.Page.enable(sessionId);
  await cdp.Runtime.enable(sessionId);

  return {
    cdp,
    executionContext: { sessionId },
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

export async function waitForAttachedToTarget(cdp: CDP.Client): Promise<{ sessionId: string; targetId: string }> {
  return new Promise((resolve) => {
    cdp.Target.on('attachedToTarget', (event) => {
      resolve({ sessionId: event.sessionId, targetId: event.targetInfo.targetId });
    });
  });
}
