import type CDP from 'chrome-remote-interface';

export async function setupCdpSessionWithUxpDefaults(cdp: CDP.Client) {
  // these were all copied from wireshark
  console.log('Setting up CDP defaults');
  await cdp.Network.enable();
  await cdp.Page.enable();
  await cdp.Page.getResourceTree();
  await cdp.Runtime.enable();
  await cdp.DOM.enable();
  await cdp.CSS.enable();
  // await cdp.Debugger.enable({ maxScriptsCacheSize: 10000000 });
  // await cdp.Debugger.setPauseOnExceptions({ state: 'none' });
  // await cdp.Debugger.setAsyncCallStackDepth({ maxDepth: 32 });
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
