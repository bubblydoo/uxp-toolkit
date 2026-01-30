import { expect, it } from "vitest";
import { photoshopLayerDescriptorsToUTLayers } from "./photoshopLayerDescriptorsToUTLayers";

it("parses a flat list correctly", async () => {
  expect(
    photoshopLayerDescriptorsToUTLayers()
  )
});