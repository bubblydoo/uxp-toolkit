import type { Test } from "@bubblydoo/uxp-test-framework";
import { photoshopLayerDescriptorsToUTLayers } from "./photoshopLayerDescriptorsToUTLayers";
import { openFileByPath } from "../filesystem/openFileByPath";
import { expect } from "chai";
import { getDocumentLayerDescriptors } from "./getLayerProperties";

export const photoshopLayerDescriptorsToUTLayersTest: Test = {
  name: "photoshopLayerDescriptorsToUTLayers",
  description: "Test the photoshopLayerDescriptorsToUTLayers function",
  run: async () => {
    const doc = await openFileByPath("plugin:/fixtures/clipping-layers.psd");
    const descriptors = await getDocumentLayerDescriptors(doc.id);

    console.log(descriptors);

    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
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

export const photoshopLayerDescriptorsToUTLayersTest2: Test = {
  name: "photoshopLayerDescriptorsToUTLayers",
  description: "Test the photoshopLayerDescriptorsToUTLayers function",
  run: async () => {
    const doc = await openFileByPath("plugin:/fixtures/one-layer-with-bg.psd");
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    console.log(descriptors);
    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
    console.log(layers);
    expect(layers).to.containSubset([
      {
        name: "Layer 1",
        visible: true,
        kind: "pixel",
        blendMode: "normal",
        isClippingMask: false,
        effects: {},
      },
      {
        name: "Background",
        visible: true,
        kind: "background",
        blendMode: "normal",
        isClippingMask: false,
        effects: {},
      },
    ]);
  },
};
