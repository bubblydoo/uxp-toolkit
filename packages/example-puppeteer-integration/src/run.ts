/* eslint-disable no-console */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  setupCdpSession,
  setupCdpSessionWithUxpDefaults,
  setupDevtoolsConnection,
  waitForExecutionContextCreated,
} from '@bubblydoo/uxp-devtools-common';
import { createUxpPuppeteerTransport } from '@bubblydoo/uxp-puppeteer-transport';
import puppeteer from 'puppeteer-core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  }
  catch (err: any) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition)
    throw new Error(`Assertion failed: ${message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Load the fake plugin into Photoshop and get the CDP WebSocket URL
  const devtoolsCommonDir = path.dirname(
    fileURLToPath(import.meta.resolve('@bubblydoo/uxp-devtools-common/package.json')),
  );
  const pluginPath = path.join(devtoolsCommonDir, 'fake-plugin');

  console.log('Setting up UXP devtools connection…');
  console.log(`Plugin path: ${pluginPath}`);
  const connection = await setupDevtoolsConnection(pluginPath);
  console.log(`CDP URL: ${connection.url}\n`);

  // 2. First WS connection: initialise UXP CDP defaults and get execution context
  const initCdp = await setupCdpSession(connection.url);
  const execCtx = await waitForExecutionContextCreated(initCdp, async () => {
    await setupCdpSessionWithUxpDefaults(initCdp);
  });
  console.log(`Execution context ready: ${execCtx.uniqueId}`);

  // 3. Second WS connection: Puppeteer connects via a custom transport that
  //    adapts UXP's page-level CDP to look like a browser-level endpoint.
  const transport = await createUxpPuppeteerTransport(connection.url, execCtx.id);

  const browser = await puppeteer.connect({ transport, defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[0]!;
  console.log(`Connected via Puppeteer (${pages.length} page(s))\n`);

  // 4. Run tests
  console.log('Photoshop UXP Plugin via Puppeteer');

  await test('should execute JavaScript in the UXP context', async () => {
    const result = await page.evaluate(() => 1 + 1);
    assert(result === 2, `expected 2, got ${result}`);
  });

  await test('should read the plugin DOM', async () => {
    const text = await page.evaluate(() => document.body?.textContent?.trim() ?? '');
    assert(text.includes('Fake plugin'), `body text does not contain "Fake plugin": "${text}"`);
  });

  await test('should access the Photoshop API', async () => {
    const info = await page.evaluate(() => {
      // eslint-disable-next-line ts/no-require-imports
      const ps = require('photoshop');
      return {
        version: ps.app.version as string | null,
        documents: ps.app.documents.length as number,
      };
    });
    console.log(`    Photoshop info: ${JSON.stringify(info)}`);
    assert(info != null, 'info should not be null');
  });

  await test('should get the list of open documents', async () => {
    const docs = await page.evaluate(() => {
      // eslint-disable-next-line ts/no-require-imports
      const ps = require('photoshop');
      return ps.app.documents.map((d: any) => ({
        name: d.name,
        width: d.width,
        height: d.height,
      }));
    });
    console.log(`    Open documents: ${JSON.stringify(docs)}`);
    assert(Array.isArray(docs), 'docs should be an array');
  });

  await test('should get the active document info', async () => {
    const docInfo = await page.evaluate(() => {
      // eslint-disable-next-line ts/no-require-imports
      const ps = require('photoshop');
      const doc = ps.app.activeDocument;
      if (!doc)
        return null;
      return { name: doc.name, width: doc.width, height: doc.height };
    });
    console.log(`    Active document: ${JSON.stringify(docInfo)}`);
    // may be null if no document is open — that's fine
  });

  await test('should query DOM elements in the plugin panel', async () => {
    const html = await page.evaluate(() => document.documentElement?.outerHTML ?? '');
    console.log(`    Plugin HTML length: ${html.length}`);
    assert(html.includes('Fake plugin'), 'HTML should contain "Fake plugin"');
  });

  await test('async functions should work', async () => {
    const result = await page.evaluate(() => new Promise(resolve => setTimeout(() => resolve('hello'), 100)));
    assert(result === 'hello', `expected "hello", got ${result}`);
  });

  // 5. Summary
  console.log(`\n${passed} passing, ${failed} failing\n`);

  // 6. Cleanup
  browser.disconnect();
  try {
    await initCdp.close();
  }
  catch {}
  await connection.teardown();

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
