# @bubblydoo/uxp-puppeteer-transport

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-puppeteer-transport)

Puppeteer `ConnectionTransport` adapter for Adobe UXP CDP endpoints.

## Install

```bash
pnpm add @bubblydoo/uxp-puppeteer-transport puppeteer-core
```

## Usage

```ts
import puppeteer from 'puppeteer-core';
import { createUxpPuppeteerTransport } from '@bubblydoo/uxp-puppeteer-transport';

const transport = await createUxpPuppeteerTransport(cdpUrl, executionContextId);
const browser = await puppeteer.connect({ transport, defaultViewport: null });
const [page] = await browser.pages();
const value = await page.evaluate(() => 1 + 1);
```

## Why this exists

Puppeteer expects a browser-level CDP target (`Target.*`, `Browser.*`), but Photoshop exposes a page-level UXP endpoint. This transport bridges that mismatch by emulating browser-target behavior and forwarding compatible runtime commands.

## Unexpected but useful details

- Synthesizes `Target.targetCreated` / `Target.attachedToTarget` and related browser-level responses so `puppeteer.connect()` can succeed.
- Includes a promise-resolution workaround for UXP CDP by polling `Runtime.getProperties` when `awaitPromise` is unreliable.
- Re-wraps forwarded responses with a synthetic `sessionId` so Puppeteer can route messages through a stable session.
