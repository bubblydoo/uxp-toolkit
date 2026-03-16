import type { CdpConnection, CdpPoolOptions } from './types';
import EventEmitter from 'node:events';
import CDP from 'chrome-remote-interface';
import { evaluateInCdp } from './cdp-util';
import { CDP_BINDING_NAME } from './types';

interface CdpSessionEventMap {
  disconnect: [];
}

interface CdpSession {
  cdp: CDP.Client;
  isClosed: () => boolean;
  events: EventEmitter<CdpSessionEventMap>;
}

export async function setupCdpSession(cdtUrl: string): Promise<CdpSession> {
  const cdp = await CDP({
    useHostName: false,
    local: true,
    target: cdtUrl,
  });

  const events = new EventEmitter<CdpSessionEventMap>();

  let isClosed = false;
  cdp.on('disconnect', () => {
    console.error('[vitest-pool-cdp] CDP disconnected');
    isClosed = true;
    events.emit('disconnect');
  });

  return {
    cdp,
    isClosed: () => isClosed,
    events,
  };
}

async function defaultExecutionContextOrSessionFn(cdp: CDP.Client) {
  const attachedTarget = await waitForAttachedToTarget(cdp, async () => {
    await cdp.Target.setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
  });

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

  const cdpSession = await setupCdpSession(cdpUrl);
  const cdp = cdpSession.cdp;

  const executionContextOrSessionFn = options.executionContextOrSession ?? defaultExecutionContextOrSessionFn;
  // options.log('Awaiting executionContextOrSessionFn');
  const executionContextOrSession = await executionContextOrSessionFn(cdp);
  // console.log('Result:', executionContextOrSession);

  const sessionId = 'sessionId' in executionContextOrSession ? executionContextOrSession.sessionId : undefined;

  await cdp.Network.enable({}, sessionId);
  await cdp.Page.enable(sessionId);
  await cdp.Runtime.enable(sessionId);

  // Create a dedicated binding for worker→pool RPC messages.
  // Unlike consoleAPICalled, bindings are owned by the client that created
  // them, so a second debugger (e.g. Chrome DevTools) won't steal the events.
  await cdp.Runtime.addBinding({ name: CDP_BINDING_NAME }, sessionId);

  return {
    url: cdpUrl,
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
          await options.teardown();
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

export async function waitForAttachedToTarget(cdp: CDP.Client, runAfterListenerAttached?: () => Promise<void>): Promise<{ sessionId: string; targetId: string }> {
  const attachedToTargetPromise = new Promise<{ sessionId: string; targetId: string }>((resolve) => {
    cdp.Target.on('attachedToTarget', (event) => {
      resolve({ sessionId: event.sessionId, targetId: event.targetInfo.targetId });
    });
  });
  if (runAfterListenerAttached) {
    await runAfterListenerAttached();
  }
  return attachedToTargetPromise;
}
