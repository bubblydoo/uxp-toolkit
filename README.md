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


### Types packages

We publish our own types for the `uxp` and `photoshop` modules, which are based on other community efforts but adapted to be more accurate:

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

### Testing

#### Vitest Integration

We now support Vitest for unit testing TypeScript code without Photoshop:

```bash
pnpm test
```

The test suite includes:
- Unit tests (`.test.ts`) for pure TypeScript functions
- Type tests (`.test-d.ts`) for compile-time type checking
- Photoshop builtin module aliases for testing code that imports `photoshop` or `uxp` modules

Tests run in CI via GitHub Actions with JUnit reporting.

#### UXP Testing Framework and Plugin

```bash
pnpm add @bubblydoo/uxp-test-framework
```

For integration tests that require Photoshop, we have developed a plugin specifically for testing UXP plugins. It allows you to run tests inside of Photoshop, and see the results in a panel.

<img src="res/screenshot-test-plugin.png" alt="Screenshot of the test plugin" width="400" />

You can run tests using the `create-uxp-test-plugin` command.

`uxp-tests.json`:
```json
{
  "$schema": "./node_modules/@bubblydoo/uxp-test-framework/uxp-tests-json-schema.json",
  "testsFile": "test/index.ts",
  "testFixturesDir": "test/fixtures",
  "plugin": {
    "id": "co.bubblydoo.uxp-toolkit-test-plugin",
    "name": "UXP Toolkit Tests"
  }
}
```

`test/index.ts`:
```ts
import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";
import { app } from "photoshop";

const renameLayerTest: Test = {
  name: "Should rename layer",
  async run() {
    const doc = await openFileByPath("plugin:/fixtures/one-layer.psd");
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const firstLayer = descriptors[0];

    expect(firstLayer.name).to.equal("Layer 1");

    await executeAsModal("Rename Layer", async (ctx) => {
      await ctx.batchPlayCommand(
        createRenameLayerCommand({ id: firstLayer.layerID, docId: firstLayer.docId }, "New Name")
      );
    });

    const updatedDescriptors = await getDocumentLayerDescriptors(doc.id);
    expect(updatedDescriptors[0].name).to.equal("New Name");
  },
};

export const tests: Test[] = [
  renameLayerTest,
];
```

```json
{
  "name": "your-plugin",
  "scripts": {
    "uxp-test:build": "uxp-test build",
    "uxp-test:dev": "uxp-test dev"
  }
}
```

Then you can run:
```bash
pnpm uxp-test:dev
```

And you will get a plugin in the `uxp-tests-plugin` directory, which you can load using UXP Developer Tools, and then you can run the tests inside of Photoshop.

In the future, we'd like to get Vitest to work natively with a UXP runner or pool, but for now, this is a good compromise.

The plugin also sourcemaps the errors, so you can find the error much more easily:

<img src="res/screenshot-test-plugin-error.png" alt="Screenshot of the test plugin with an error" width="800" />

### React integration

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
