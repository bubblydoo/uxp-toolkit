/* eslint-disable no-console */
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

export function waitForExecutionContextCreated(cdp: CDP.Client) {
  const executionContextCreatedPromise = new Promise<ExecutionContextDescription>((resolve) => {
    cdp.Runtime.on('executionContextCreated', (event) => {
      console.log('executionContextCreated', event);
      resolve(event.context);
    });
  });
  return executionContextCreatedPromise;
}

export async function setupCdpSessionWithDefaults(cdp: CDP.Client) {
  // these were all copied from wireshark
  await cdp.Network.enable();
  await cdp.Page.enable();
  await cdp.Page.getResourceTree();
  await cdp.Runtime.enable();
  await cdp.DOM.enable();
  await cdp.CSS.enable();
  await cdp.Debugger.enable({ maxScriptsCacheSize: 10000000 });
  await cdp.Debugger.setPauseOnExceptions({ state: 'none' });
  await cdp.Debugger.setAsyncCallStackDepth({ maxDepth: 32 });
  await cdp.Overlay.enable();
  await cdp.Overlay.setShowViewportSizeOnResize({ show: true });
  await cdp.Profiler.enable();
  await cdp.Log.enable();
  await cdp.Target.setAutoAttach({
    autoAttach: true,
    waitForDebuggerOnStart: true,
    flatten: true,
  });
  await cdp.Debugger.setBlackboxPatterns({ patterns: [] });
  await cdp.Runtime.runIfWaitingForDebugger();
}
