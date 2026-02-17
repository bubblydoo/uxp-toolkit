# UXP Test Framework

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-test-framework)

> [!NOTE]
> The Vitest pool works better, so we recommend using that instead.

This is a package that exports the base types for the UXP Test Framework.

## Installation

```bash
pnpm add @bubblydoo/uxp-test-framework
```

## Usage

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
