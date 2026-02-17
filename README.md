![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-toolkit)

# UXP Toolkit

This is a toolkit for building UXP extensions for Adobe Photoshop. It has been created because the experience building extensions for Adobe Photoshop is pretty terrible: nothing works as expected and the documentation is lacking.

With the code in this repo, we fix a few things:
- A large amount of functions, including automated tests, for common actions in Photoshop, like interacting with layers and files.
- A way to interact with batchPlay in a typesafe way, with Zod schemas for the output.
- A unified way to represent layers in your code, without using document.layers (which gets very slow, see below)
- A testing framework for UXP, which you can also use for your own tests.
- Vitest integration for running unit tests without Photoshop, with CI/CD support.
- Typescript types for the `uxp` and `photoshop` modules.
- A fixed CLI for UXP.

```bash
pnpm add @bubblydoo/uxp-toolkit
pnpm add -D @adobe-uxp-types/uxp @adobe-uxp-types/photoshop
```

## What is wrong with UXP?

We were very hopeful when in 2021 Adobe announced they would revamp their Photoshop API. However, after 2 years they seem to have given up, and the API is barely updated.

There are a lot of issues with the API:

- The Typescript types are more often wrong than not.
- It extends web APIs, but is incompatible with a lot of them.
- For most actions, you still have to use `batchPlay`, and in order to figure out what to do, you need to record the action with Alchemist and convert it into code. But even then, that code often does not work.
- When using the DOM API, e.g. `document.layers[0].name`, it looks synchronous, but under the hood it makes several IPC calls to the Photoshop process. If you have a lot of layers, this can get very slow.
- The amount of documentation is very lacking, often outdated or just plain wrong.

## What we did

| Package | Version |
| --- | --- |
| [@bubblydoo/uxp-toolkit](./packages/uxp-toolkit) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-toolkit) |

We made functions for building typesafe UXP projects. Instead of just running `batchPlay`, and trusting what the output is, we verify what the output is.

### Core Functions

#### `createCommand` and `batchPlayCommand`

```ts
// Before

//    ActionDescriptor (any)
//    ^
const result = await batchPlay([
  {
    _obj: "get",
    _target: [
      { _ref: "layer", _id: 123 }
    ]
  }
]);

// After

//    { name: string }
//    ^
const result = await batchPlayCommand(
  createCommand({
    modifying: false,
    descriptor: {
      _obj: "get",
      _target: [
        { _ref: "layer", _id: 123 }
      ]
    },
    schema: z.object({
      name: z.string(),
    }),
  })
);
```

This is only possible with non-modifiying commands. If you want to run a modifying command, this needs to happen in a modal context:

```ts
await executeAsModal(commandName, async (ctx) => {
  await ctx.batchPlayCommand(createCommand({
    modifying: true,
    descriptor: {
      _obj: "set",
      _target: [
        { _ref: "layer", _id: 123 }
      ],
      name: "New Layer Name",
    },
    schema: z.unknown(),
  }));
});
```

There is also `batchPlayCommands` for running multiple commands at once, with correct typing.

#### `executeAsModal`

For better ergonomics, we put the name first, and then the function.
The ctx has new attributes:
- `signal`
- `batchPlayCommand` and `batchPlayCommands` for running commands

```ts
await executeAsModal("Do something cancellable", async (ctx) => {
  ctx.signal.throwIfAborted();
});
```

#### `suspendHistory`

For better ergonomics, we put the document first, then the name, and then the function.

```ts
await suspendHistory(document, "Action that suspends history", async (ctx) => {
  await ctx.batchPlayCommand(createRenameLayerCommand({ id: 123, docId: document.id }, "New Name"));
});
```

#### `executeAsModalAndSuspendHistory`

A combination of the two above:

```ts
await executeAsModalAndSuspendHistory("Combined action", document, async (ctx, suspendHistoryContext) => {
  ctx.reportProgress({ value: 0.5 });
});
```

### `UTLayer`

As `document.layers` can get slow, we provide a parser for a layer tree, built on `batchPlay` commands.

```ts
//    LayerDescriptor[]
//    ^
const descriptors = await getDocumentLayerDescriptors(document.id);

//    UTLayer[]
//    ^
const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
```

### `utLayersToText`

Convert a `UTLayer` tree to a human-readable text representation. This is useful for debugging, logging, and AI/LLM use cases where you need to represent the layer structure as text.

```ts
import { utLayersToText } from '@bubblydoo/uxp-toolkit';

const text = utLayersToText(layers);
console.log(text);
```

Output:
```
◯ Background
◯ ▾ Header Group
◯   Logo ƒ
◯   ⬐ Title
⊘   Subtitle ⁕
◯ ▾ Content
◯   Image
```

Icons:
- `◯` visible / `⊘` hidden
- `▾` group
- `⬐` clipping mask
- `ƒ` has layer effects
- `⁕` non-default blend mode

### Types packages

We publish our own types for the `uxp` and `photoshop` modules, which are based on other community efforts but adapted to be more accurate:

| Package | Version |
| --- | --- |
| [@adobe-uxp-types/uxp](./packages/types-uxp) | ![NPM Version](https://img.shields.io/npm/v/@adobe-uxp-types/uxp) |
| [@adobe-uxp-types/photoshop](./packages/types-photoshop) | ![NPM Version](https://img.shields.io/npm/v/@adobe-uxp-types/photoshop) |

```bash
pnpm add -D @adobe-uxp-types/uxp @adobe-uxp-types/photoshop
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["photoshop", "uxp"],
    "typeRoots": [
      "./node_modules/@adobe-uxp-types",
      "./node_modules/@types"
    ]
  }
}
```

### Commands library

We have a library of commands for common actions in Photoshop, which you can import from `@bubblydoo/uxp-toolkit/commands`.

Examples are `createRenameLayerCommand` and `createSelectLayerCommand`.

See the [commands library](./packages/uxp-toolkit/src/commands-library/index.ts) index file for a complete list.

### Error sourcemaps

We have a function to parse error sourcemaps, which is very useful for debugging errors in your code.

```ts
function throwError() {
  throw new Error("Test error");
}

try {
  throwError();
} catch (error) {
  //    [{ fileName: "test.ts", lineNumber: 2, columnNumber: 8 }]
  //    ^
  const parsedError = await parseUxpErrorSourcemaps(error);

  //    "/Users/you/project/src/test.ts:2:8"
  //    ^
  const absolutePath = await getBasicStackFrameAbsoluteFilePath(parsedError[0]);

  await copyToClipboard(absolutePath);
}
```

### Vite UXP plugin

| Package | Version |
| --- | --- |
| [@bubblydoo/vite-uxp-plugin](./packages/vite-uxp-plugin) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/vite-uxp-plugin) |

`@bubblydoo/vite-uxp-plugin` adapts Vite for UXP constraints:
- UXP-compatible output (manifest emission + CommonJS bundle behavior)
- `@bubblydoo/vite-uxp-plugin/runtime` for hot-reload wiring in development mode
- automatic dev websocket permission wiring in the generated `manifest.json`

Unlike regular web Vite workflows, you should use `vite build --watch --mode development` (not `vite dev`) for UXP projects.

### Testing a custom Vitest pool

<!-- [@bubblydoo/vitest-pool-uxp](./packages/vitest-pool-uxp) and [@bubblydoo/vitest-pool-cdp](./packages/vitest-pool-cdp) -->

| Package | Version |
| --- | --- |
| [@bubblydoo/vitest-pool-uxp](./packages/vitest-pool-uxp) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/vitest-pool-uxp) |
| [@bubblydoo/vitest-pool-cdp](./packages/vitest-pool-cdp) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/vitest-pool-cdp) |

We now support Vitest for unit testing TypeScript code without Photoshop:

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import { uxpPool } from '@bubblydoo/vitest-pool-uxp';

export default defineConfig({
  test: {
    pool: uxpPool(),
    isolate: false,
    fileParallelism: false,
    maxWorkers: 1,
  },
});
```

### React integration

| Package | Version |
| --- | --- |
| [@bubblydoo/uxp-toolkit-react](./packages/uxp-toolkit-react) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-toolkit-react) |

```bash
pnpm add @bubblydoo/uxp-toolkit-react
```

We have a React integration for the toolkit. It allows you to use the toolkit in a React application. Many functions use React Query under the hood.

```ts
import { useActiveDocument } from "@bubblydoo/uxp-toolkit-react";

function App() {
  const activeDocument = useActiveDocument();
  return <div>Active document: {activeDocument.name}</div>;
}
```

This package provides the following hooks:

- `useActiveDocument` – Sync external store for the current active document
- `useOnDocumentEdited` – Run a callback when the given document is edited (select, delete, make, set, move, close, show, hide, etc.)
- `useOnDocumentLayersEdited` – Run a callback when layers change (delete, make, set, move, close)
- `useOnDocumentLayersSelection` – Run a callback when layer selection changes (select, deselect)
- `useOnEvent` – Run a callback for arbitrary Photoshop action events on a given document
- `useOpenDocuments` – Sync external store for the list of open documents
- `useIsPluginPanelVisible` and `useIsAnyPluginPanelVisible` – Whether a plugin panel is visible
- `useApplicationInfoQuery` – React Query for Photoshop application info (e.g. panel list)
- `useEventListenerSkippable` - Generic hook to subscribe to events with optional skip/filter so triggers can be queued or ignored

### CLI

| Package | Version |
| --- | --- |
| [@bubblydoo/uxp-cli](./packages/uxp-cli) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-cli) |

We fixed the [official devtools package](https://github.com/adobe-uxp/devtools-cli), which had a lot of issues. You can find the fixed repo [here](https://github.com/bubblydoo/adobe-fixed-uxp-devtools).

Based on this, we created our own CLI. You can run this without installing anything, just `pnpm`.

This can replace UXP Developer Tools.

Open devtools with a "fake" plugin (doesn't have any functionality)

```bash
pnpm --allow-build=@adobe-fixed-uxp/uxp-devtools-helper dlx @bubblydoo/uxp-cli open-devtools
```

Open devtools with a custom plugin

```bash
pnpm --allow-build=@adobe-fixed-uxp/uxp-devtools-helper dlx @bubblydoo/uxp-cli open-devtools --plugin-path ./my-plugin
```

You can also just install it:

```bash
pnpm add -D @bubblydoo/uxp-cli
```

If you're using approved builds in pnpm, make sure to add `@adobe-fixed-uxp/uxp-devtools-helper` to the `onlyBuiltDependencies` in your `pnpm-workspace.yaml`. The postinstall script just unzips some binary proprietary Adobe files.

### Photoshop MCP

| Package | Version |
| --- | --- |
| [@bubblydoo/photoshop-mcp](./packages/photoshop-mcp) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/photoshop-mcp) |

We have a MCP server for Photoshop automation via Chrome DevTools Protocol. It allows AI assistants to execute JavaScript code directly in Adobe Photoshop's UXP environment, but it also has access to UXP Toolkit and its commands, to the TypeScript schemas and these readmes.

```bash
pnpm --allow-build=@adobe-fixed-uxp/uxp-devtools-helper dlx @bubblydoo/photoshop-mcp
```

### UXP Puppeteer Transport

| Package | Version |
| --- | --- |
| [@bubblydoo/uxp-puppeteer-transport](./packages/uxp-puppeteer-transport) | ![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-puppeteer-transport) |

This package bridges Puppeteer's browser-level CDP expectations to Photoshop's page-level UXP CDP endpoint.
It is useful when you want to reuse Puppeteer-style automation against a UXP runtime.

```ts
import puppeteer from 'puppeteer-core';
import { createUxpPuppeteerTransport } from '@bubblydoo/uxp-puppeteer-transport';

const transport = await createUxpPuppeteerTransport(cdpUrl, executionContextId);
const browser = await puppeteer.connect({ transport, defaultViewport: null });
```
