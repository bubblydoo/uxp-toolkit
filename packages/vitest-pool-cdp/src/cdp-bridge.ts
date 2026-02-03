import type { CdpConnection, CdpPoolOptions } from './types';
import CDP from 'chrome-remote-interface';
import { evaluateInCdp } from './cdp-util';

export async function setupCdpSession(cdtUrl: string) {
  const cdp = await CDP({
    useHostName: false,
    local: true,
    target: cdtUrl,
  });

  return cdp;
}

async function defaultExecutionContextOrSessionFn(cdp: CDP.Client) {
  const attachedTargetPromise = waitForAttachedToTarget(cdp);

  await cdp.Target.setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });

  const attachedTarget = await attachedTargetPromise;

  return { sessionId: attachedTarget.sessionId };
}

/**
 * Set up a CDP session and wait for an execution context.
 */
export async function setupCdpConnection(
  cdpUrl: string,
  options: {
    executionContextOrSession?: CdpPoolOptions['executionContextOrSession'];
    log: (...args: unknown[]) => void;
    teardown?: () => Promise<void>;
  },
): Promise<CdpConnection> {
  options.log('Connecting to CDP at', cdpUrl);

  const cdp = await setupCdpSession(cdpUrl);

  const executionContextOrSessionFn = options.executionContextOrSession ?? defaultExecutionContextOrSessionFn;
  options.log('Awaiting executionContextOrSessionFn');
  const executionContextOrSession = await executionContextOrSessionFn(cdp);
  console.log('Result:', executionContextOrSession);

  const sessionId = 'sessionId' in executionContextOrSession ? executionContextOrSession.sessionId : undefined;

  await cdp.Network.enable({}, sessionId);
  await cdp.Page.enable(sessionId);
  await cdp.Runtime.enable(sessionId);

  return {
    cdp,
    executionContextOrSession,
    disconnect: async () => {
      try {
        await cdp.close();
      }
      catch {
        // Ignore CDP close errors
      }
      if (options.teardown) {
        try {
          console.log('Tearing down devtools URL');
          await options.teardown();
          console.log('Teardown complete');
        }
        catch (error) {
          console.error('Teardown error:', error);
        }
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
