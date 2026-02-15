import { expect, it } from 'vitest';
import { photoshopLayerDescriptorsToUTLayers } from './photoshopLayerDescriptorsToUTLayers';
import { utLayersToText } from './utLayersToText';

it('parses a flat list correctly', async () => {
  expect(
    utLayersToText(
      photoshopLayerDescriptorsToUTLayers(
        [
          {
            name: 'circle',
            layerID: 4,
            mode: {
              _enum: 'blendMode',
              _value: 'normal',
            },
            background: false,
            itemIndex: 5,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: 'layerSectionContent',
              _enum: 'layerSectionType',
            },
            docId: 70,
            layerEffects: {},
            group: true,
          },
          {
            name: 'group',
            layerID: 6,
            mode: {
              _enum: 'blendMode',
              _value: 'passThrough',
            },
            background: false,
            itemIndex: 4,
            visible: true,
            layerKind: 7,
            layerSection: {
              _value: 'layerSectionStart',
              _enum: 'layerSectionType',
            },
            docId: 70,
            layerEffects: {},
            group: false,
          },
          {
            name: 'green square',
            layerID: 3,
            mode: {
              _enum: 'blendMode',
              _value: 'normal',
            },
            background: false,
            itemIndex: 3,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: 'layerSectionContent',
              _enum: 'layerSectionType',
            },
            docId: 70,
            layerEffects: {},
            group: true,
          },
          {
            name: 'red square',
            layerID: 2,
            mode: {
              _enum: 'blendMode',
              _value: 'normal',
            },
            background: false,
            itemIndex: 2,
            visible: true,
            layerKind: 1,
            layerSection: {
              _value: 'layerSectionContent',
              _enum: 'layerSectionType',
            },
            docId: 70,
            layerEffects: {},
            group: false,
          },
          {
            name: '</Layer group>',
            layerID: 7,
            mode: {
              _enum: 'blendMode',
              _value: 'passThrough',
            },
            background: false,
            itemIndex: 1,
            visible: true,
            layerKind: 13,
            layerSection: {
              _value: 'layerSectionEnd',
              _enum: 'layerSectionType',
            },
            docId: 70,
            layerEffects: {},
            group: true,
          },
        ],
      ),
    ),
  ).toMatchInlineSnapshot(`
    "◯ ⬐ circle
    ◯ ▾ group
    ◯    ⬐ green square
    ◯    red square"
  `);
});
