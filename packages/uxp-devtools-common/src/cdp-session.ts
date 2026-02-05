import CDP from 'chrome-remote-interface';

export async function setupCdpSession(cdtUrl: string) {
  const uuid = crypto.randomUUID();

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

  return cdp;
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
