import { expect, it } from "vitest";
import { photoshopLayerDescriptorsToUTLayersCore } from "./photoshopLayerDescriptorsToUTLayers";
import { utTreeToText } from "./utTreeToText";

it("parses a flat list correctly", async () => {
  expect(
    utTreeToText(
      photoshopLayerDescriptorsToUTLayersCore(
        [
          {
            name: "circle",
            layerID: 4,
            mode: {
              _enum: "blendMode",
              _value: "normal",
            },
            background: false,
            itemIndex: 5,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: "layerSectionContent",
              _enum: "layerSectionType",
            },
            docId: 70,
          },
          {
            name: "group",
            layerID: 6,
            mode: {
              _enum: "blendMode",
              _value: "passThrough",
            },
            background: false,
            itemIndex: 4,
            visible: true,
            layerKind: 7,
            layerSection: {
              _value: "layerSectionStart",
              _enum: "layerSectionType",
            },
            docId: 70,
          },
          {
            name: "green square",
            layerID: 3,
            mode: {
              _enum: "blendMode",
              _value: "normal",
            },
            background: false,
            itemIndex: 3,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: "layerSectionContent",
              _enum: "layerSectionType",
            },
            docId: 70,
          },
          {
            name: "red square",
            layerID: 2,
            mode: {
              _enum: "blendMode",
              _value: "normal",
            },
            background: false,
            itemIndex: 2,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: "layerSectionContent",
              _enum: "layerSectionType",
            },
            docId: 70,
          },
          {
            name: "</Layer group>",
            layerID: 7,
            mode: {
              _enum: "blendMode",
              _value: "passThrough",
            },
            background: false,
            itemIndex: 1,
            visible: true,
            layerKind: 13,
            layerSection: {
              _value: "layerSectionEnd",
              _enum: "layerSectionType",
            },
            docId: 70,
          },
        ],
        new Map([
          [4, { group: true, effects: {} }],
          [6, { group: false, effects: {} }],
          [3, { group: true, effects: {} }],
          [2, { group: false, effects: {} }],
          [7, { group: false, effects: {} }],
        ]),
      ),
    ),
  ).toMatchInlineSnapshot(`
    "◯ ⬐ circle
    ◯ ▾ group
    ◯    ⬐ green square
    ◯    red square"
  `);
});
