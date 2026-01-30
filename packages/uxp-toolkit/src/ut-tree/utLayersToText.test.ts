import { expect, it } from "vitest";
import { utLayersToText } from "./utLayersToText";

it("converts a single layer to text", () => {
  expect(utLayersToText([
    {
      name: "circle",
      effects: {},
      blendMode: "normal",
      isClippingMask: false,
      kind: "pixel",
      visible: true,
    },
  ])).toMatchInlineSnapshot(`"◯ circle"`)
});

it("converts a nested layer to text", () => {
  expect(utLayersToText([
    {
      name: "group",
      effects: {},
      blendMode: "passThrough",
      isClippingMask: false,
      kind: "group",
      visible: true,
      layers: [
        {
          name: "circle",
          effects: {},
          blendMode: "normal",
          isClippingMask: false,
          kind: "pixel",
          visible: true,
        },
        {
          name: "square",
          effects: {},
          blendMode: "normal",
          isClippingMask: false,
          kind: "pixel",
          visible: true,
        },
        {
          name: "other",
          effects: {},
          blendMode: "passThrough",
          isClippingMask: false,
          kind: "group",
          visible: true,
          layers: [
            {
              name: "nested",
              effects: {},
              blendMode: "normal",
              isClippingMask: false,
              kind: "pixel",
              visible: true,
            },
          ],
        },
      ],
    },
  ])).toMatchInlineSnapshot(`
    "◯ ▾ group
    ◯    circle
    ◯    square
    ◯    ▾ other
    ◯      nested"
  `)
});

it("converts a nested layer with a clipping mask to text", () => {
  expect(utLayersToText([
    {
      name: "clipper",
      effects: {},
      blendMode: "normal",
      isClippingMask: true,
      kind: "pixel",
      visible: true,
    },
    {
      name: "circle",
      effects: {},
      blendMode: "normal",
      isClippingMask: false,
      kind: "pixel",
      visible: true,
    },
  ])).toMatchInlineSnapshot(`
    "◯ ⬐ clipper
    ◯ circle"
  `)
});
