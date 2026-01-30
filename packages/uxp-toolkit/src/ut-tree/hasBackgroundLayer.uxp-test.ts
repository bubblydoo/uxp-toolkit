import { app } from "photoshop";
import { openFileByPath } from "../filesystem/openFileByPath";
import { batchPlayCommand } from "../core/command";
import { expect } from "chai";
import { createGetDocumentHasBackgroundLayerCommand } from "../commands-library/getDocument";
import type { Test } from "@bubblydoo/uxp-test-framework";
import { createGetBackgroundLayerCommand } from "../commands-library/getLayer";
import { executeAsModal } from "../core/executeAsModal";

export const backgroundLayerTest: Test = {
  name: "Has/Get Background Layer",
  async run() {
    const doc = await openFileByPath("plugin:/fixtures/one-layer-with-bg.psd");
    const hasBackgroundLayer = await batchPlayCommand(
      createGetDocumentHasBackgroundLayerCommand(doc.id)
    )
    expect(hasBackgroundLayer.hasBackgroundLayer).to.be.true;
    const layer = await batchPlayCommand(
      createGetBackgroundLayerCommand(app.activeDocument.id)
    )
    expect(layer.name).to.equal("Background");
    await executeAsModal("Close Document", async () => await doc.close(0));

    const doc2 = await openFileByPath("plugin:/fixtures/one-layer.psd");

    const hasBackgroundLayer2 = await batchPlayCommand(
      createGetDocumentHasBackgroundLayerCommand(doc2.id)
    )
    expect(hasBackgroundLayer2.hasBackgroundLayer).to.be.false;
    let rejected = false;
    try {
      await batchPlayCommand(
        createGetBackgroundLayerCommand(doc2.id)
      )
    } catch (e) {
      rejected = true;
    }
    expect(rejected).to.be.true;

    await executeAsModal("Close Document", async () => await doc2.close(0));
  },
};
