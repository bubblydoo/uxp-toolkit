/* eslint-disable no-console */
import type { LaunchOptions } from 'puppeteer';
import puppeteer from 'puppeteer';
import z from 'zod';

export async function startChromium(options: LaunchOptions = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    debuggingPort: 9293,
    args: ['--remote-allow-origins=*'],
    ...options,
  });

  const jsonVersionRes = await fetch('http://localhost:9293/json/version');
  const jsonVersionData = await jsonVersionRes.json();
  const { webSocketDebuggerUrl } = z.object({ webSocketDebuggerUrl: z.string() }).parse(jsonVersionData);

  console.log('Debugger URL:', webSocketDebuggerUrl);

  const urlWithoutWs = webSocketDebuggerUrl.replace('ws://', '');

  console.log('Open devtools:', `devtools://devtools/bundled/inspector.html?ws=${urlWithoutWs}`);

  return {
    url: webSocketDebuggerUrl,
    teardown: async () => {
      await browser.close();
    },
  };
}
