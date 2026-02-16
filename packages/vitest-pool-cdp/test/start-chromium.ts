/* eslint-disable no-console */
import type { LaunchOptions } from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import z from 'zod';

const ARGS = ['--remote-allow-origins=*'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_VIEWER_PATH = path.resolve(__dirname, '../test-viewer/index.html');
const TEST_VIEWER_URL = new URL(`file://${TEST_VIEWER_PATH}`).toString();

export async function startChromium(options: LaunchOptions = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    debuggingPort: 9293,
    // [2423:2423:0205/142910.232787:FATAL:content/browser/zygote_host/zygote_host_impl_linux.cc:128] No usable sandbox!
    // If you are running on Ubuntu 23.10+ or another Linux distro that has disabled unprivileged user namespaces with AppArmor,
    // see https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md.
    // Otherwise see https://chromium.googlesource.com/chromium/src/+/main/docs/linux/suid_sandbox_development.md for more
    // information on developing with the (older) SUID sandbox.
    // If you want to live dangerously and need an immediate workaround, you can try using --no-sandbox.
    args: ARGS.concat(process.env.GITHUB_ACTIONS ? ['--no-sandbox'] : []),
    ...options,
  });

  const page = await browser.newPage();
  await page.goto(TEST_VIEWER_URL);
  console.log('Test viewer loaded:', TEST_VIEWER_URL);

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
