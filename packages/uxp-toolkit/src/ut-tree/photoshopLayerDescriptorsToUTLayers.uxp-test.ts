import type { Test } from "@bubblydoo/uxp-test-framework";
import { photoshopLayerDescriptorsToUTLayers } from "./photoshopLayerDescriptorsToUTLayers";
import { openFileByPath } from "../filesystem/openFileByPath";
import { getFlattenedLayerDescriptorsList } from "./getFlattenedLayerDescriptorsList";
import { expect } from "chai";

export const photoshopLayerDescriptorsToUTLayersTest: Test = {
  name: "photoshopLayerDescriptorsToUTLayers",
  description: "Test the photoshopLayerDescriptorsToUTLayers function",
  run: async () => {
    const doc = await openFileByPath("plugin:/fixtures/clipping-layers.psd");
    const descriptors = await getFlattenedLayerDescriptorsList(doc.id);
    const layers = await photoshopLayerDescriptorsToUTLayers(descriptors);
    expect(layers).to.containSubset([
      {
        name: "circle",
        visible: true,
        kind: "pixel",
        blendMode: "normal",
        isClippingMask: true,
        effects: {},
      },
      {
        name: "group",
        visible: true,
        kind: "group",
        blendMode: "passThrough",
        isClippingMask: false,
        effects: {},
        layers: [
          {
            name: "green square",
            visible: true,
            kind: "pixel",
            blendMode: "normal",
            isClippingMask: true,
            effects: {},
          },
          {
            name: "red square",
            id: 2,
            visible: true,
            kind: "pixel",
            blendMode: "normal",
            isClippingMask: false,
            effects: {},
          },
        ],
      },
    ]);
  },
};
