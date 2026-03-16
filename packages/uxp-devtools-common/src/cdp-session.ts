import EventEmitter from 'node:events';
import CDP from 'chrome-remote-interface';

interface CdpSessionEventMap {
  disconnect: [];
}

export interface CdpSession {
  cdp: CDP.Client;
  isClosed: () => boolean;
  events: EventEmitter<CdpSessionEventMap>;
}

export async function setupCdpSession(cdtUrl: string): Promise<CdpSession> {
  const uuid = crypto.randomUUID();

  let isClosed = false;

  const cdp = await CDP({
    useHostName: false,
    local: true,
    target: {
      description: 'CDT',
      devtoolsFrontendUrl: null!,
      id: `cdt-${uuid}`,
      title: 'CDT',
      type: 'page',
      url: 'about:blank',
      webSocketDebuggerUrl: cdtUrl,
    },
  });

  const events = new EventEmitter<CdpSessionEventMap>();

  cdp.on('disconnect', () => {
    console.error('[uxp-devtools-common] CDP disconnected');
    isClosed = true;
    events.emit('disconnect');
  });

  return {
    cdp,
    isClosed: () => isClosed,
    events,
  };
}

interface ExecutionContextDescription {
  id: number;
  origin: string;
  name: string;
  uniqueId: string;
}

export async function waitForExecutionContextCreated(cdp: CDP.Client, runAfterListenerAttached?: () => Promise<void>) {
  const executionContextCreatedPromise = new Promise<ExecutionContextDescription>((resolve) => {
    cdp.Runtime.on('executionContextCreated', (event) => {
      resolve(event.context);
    });
  });
  if (runAfterListenerAttached) {
    await runAfterListenerAttached();
  }
  return executionContextCreatedPromise;
}
