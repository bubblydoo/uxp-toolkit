import { expect, it } from "vitest";
import { utTreeToText } from "./utTreeToText";

it("converts a single layer to text", () => {
  expect(utTreeToText([
    {
      name: "circle",
      effects: {},
      blendMode: "normal",
      isClippingMask: false,
      kind: "pixel",
      docId: 1,
      id: 1,
      visible: true,
    },
  ])).toMatchInlineSnapshot(`"◯ circle"`)
});

it("converts a nested layer to text", () => {
  expect(utTreeToText([
    {
      name: "group",
      effects: {},
      blendMode: "passThrough",
      isClippingMask: false,
      kind: "group",
      docId: 1,
      id: 1,
      visible: true,
      layers: [
        {
          name: "circle",
          effects: {},
          blendMode: "normal",
          isClippingMask: false,
          kind: "pixel",
          docId: 1,
          id: 1,
          visible: true,
        },
        {
          name: "square",
          effects: {},
          blendMode: "normal",
          isClippingMask: false,
          kind: "pixel",
          docId: 1,
          id: 1,
          visible: true,
        },
        {
          name: "other",
          effects: {},
          blendMode: "passThrough",
          isClippingMask: false,
          kind: "group",
          docId: 1,
          id: 1,
          visible: true,
          layers: [
            {
              name: "nested",
              effects: {},
              blendMode: "normal",
              isClippingMask: false,
              kind: "pixel",
              docId: 1,
              id: 1,
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
  expect(utTreeToText([
    {
      name: "clipper",
      effects: {},
      blendMode: "normal",
      isClippingMask: true,
      kind: "pixel",
      docId: 1,
      id: 1,
      visible: true,
    },
    {
      name: "circle",
      effects: {},
      blendMode: "normal",
      isClippingMask: false,
      kind: "pixel",
      docId: 1,
      id: 1,
      visible: true,
    },
  ])).toMatchInlineSnapshot(`
    "◯ ⬐ clipper
    ◯ circle"
  `)
});