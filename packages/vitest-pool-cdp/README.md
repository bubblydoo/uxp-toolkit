# @bubblydoo/vitest-pool-cdp

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/vitest-pool-cdp)

Custom Vitest pool that runs tests inside CDP-connected runtimes (Chrome, Photoshop UXP, Electron, and similar environments).

## Overview

`@bubblydoo/vitest-pool-cdp` runs Vitest tests in a remote JavaScript runtime by:

- opening a CDP connection from Node.js
- injecting a lightweight worker runtime into the target
- forwarding Vitest RPC traffic between Node and the target
- bundling test files with esbuild before evaluating them in the target

Supported by design:

- Vitest projects and `allowOnly` / `testNamePattern` propagation
- snapshot testing, including inline snapshots
- sourcemap-based error stack remapping (enabled by default)

## Installation

```bash
pnpm add -D @bubblydoo/vitest-pool-cdp vitest
```

## Quick Start

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';

export default defineConfig({
  test: {
    pool: cdpPool({
      cdp: 'ws://localhost:9222/devtools/page/ABC123',
    }),
  },
});
```

## Configuration

### `cdp` (required)

`cdp` is the connection source. It supports:

- a static websocket URL (`string`)
- an async function returning a URL
- an async function returning `{ url, teardown }`

```ts
cdp: async () => ({ url: await getUrl(), teardown: async () => stopTarget() })
```

### Select execution context or session

By default the pool enables auto-attach and runs in the attached target session.
Use `executionContextOrSession` if you need to explicitly choose:

- `{ sessionId: string }`
- `{ uniqueId: string }` (execution context unique id)
- `{ id: number }` (execution context id)

```ts
executionContextOrSession: async (cdp) => {
  const desc = await waitForExecutionContextCreated(cdp);
  return { uniqueId: desc.uniqueId };
}
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `cdp` | `string \| (() => Promise<string>) \| (() => Promise<{ url: string; teardown: () => Promise<void> }>)` | required | CDP target source |
| `executionContextOrSession` | `(cdp) => Promise<{ sessionId } \| { uniqueId } \| { id }>` | auto-attach session | Select execution context/session |
| `debug` | `boolean` | `false` | Verbose pool logging |
| `connectionTimeout` | `number` | `5000` | CDP connection timeout (ms) |
| `rpcTimeout` | `number` | `30000` | RPC call timeout (ms) |
| `esbuildOptions` | `{ define?, external?, alias?, plugins? }` | `undefined` | Extra esbuild config for test bundling |
| `embedSourcemap` | `boolean` | `false` | Expose bundled sourcemap as a `EVAL_SOURCEMAP` variable in target |
| `enableErrorSourcemapping` | `boolean` | `true` | Remap stacks/task locations/error frames to original sources |
| `showBundledStackTrace` | `boolean` | `false` | Preserve raw bundled stack as `error.bundledStack` (with remapped stack still shown) |
| `runBeforeTests` | `(cdp) => Promise<void>` | `undefined` | Hook run after CDP connection and before test execution |
| `hotkeys` | `{ enabled?: boolean; openDevtools?: (connection) => Promise<void> }` | `{ enabled: true, openDevtools: openDevtoolsSessionInChrome }` | Configure terminal hotkeys (`d` opens the current CDP devtools session in Chrome) |

## Example (dynamic CDP + teardown)

```ts
import { defineConfig } from 'vitest/config';
import { cdpPool } from '@bubblydoo/vitest-pool-cdp';
import { setupDevtoolsUrl } from '@bubblydoo/uxp-devtools-common';

export default defineConfig({
  test: {
    pool: cdpPool({
      cdp: () => setupDevtoolsUrl('./plugin', 'com.example.plugin'),
      debug: true,
    }),
  },
});
```

## Runtime Model

```
┌──────────────────────────────┐                  ┌──────────────────────────────┐
│ Vitest process (Node.js)     │                  │ CDP target runtime           │
│                              │                  │ (Browser / UXP / Electron)   │
├──────────────────────────────┤                  ├──────────────────────────────┤
│ CdpPoolWorker                │                  │ Injected worker runtime      │
│                              │                  │                              │
│  ┌───────────────┐           │                  │  ┌───────────────┐           │
│  │ send()        │───────────┼─────────────────►│  │ receive()     │           │
│  └───────────────┘           │ Runtime.evaluate │  └───────────────┘           │
│                              │                  │                              │
│  ┌───────────────┐           │                  │  ┌───────────────┐           │
│  │ on('msg')     │◄──────────┼───────────────── │  │ post()        │           │
│  └───────────────┘           │ bindingCalled    │  └───────────────┘           │
└──────────────────────────────┘                  └──────────────────────────────┘
```

`send() -> receive()` uses `Runtime.evaluate`.
`post() -> on('msg')` uses `Runtime.addBinding` / `Runtime.bindingCalled`.

- Pool -> target messages are evaluated in the chosen CDP context/session.
- Target -> pool messages use `Runtime.addBinding` (not console transport), which avoids conflicts with extra debugger clients.
- Serialization uses `devalue`.

## Snapshot Support

The worker runtime includes a Chai snapshot plugin built on `@vitest/snapshot`:

- `toMatchSnapshot`
- `toMatchInlineSnapshot`
- `toThrowErrorMatchingSnapshot`
- `toThrowErrorMatchingInlineSnapshot`
- `expect.addSnapshotSerializer(...)`

## Local Chrome Test Viewer (package tests)

For `packages/vitest-pool-cdp/test` development, the Puppeteer launcher opens a local viewer page:

- `test-viewer/index.html`

When running:

```bash
pnpm --filter @bubblydoo/vitest-pool-cdp test:chrome
```

the browser navigates to that page and shows live test results from `__vitestUiUpdate` / `__vitestUiState` (summary + per-test status, duration, and file path).

## Current Limitations

- `test.setupFiles` is currently **not implemented** for this pool and throws an explicit error.
- Tests run in one remote runtime context/session at a time (no in-target worker isolation).
- Node-specific test behavior may not work in non-Node CDP targets.
- Target runtime should support modern JS (ES2022+).

## License

MIT
