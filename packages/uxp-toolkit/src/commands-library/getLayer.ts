import type { PsLayerRef } from '../ut-tree/psLayerRef';
import z from 'zod';
import { createCommand } from '../core/command';

const layerSchema = z.object({
  name: z.string(),
  visible: z.boolean(),
  group: z.boolean(),
  layerSection: z.object({
    _value: z.enum([
      'layerSectionStart',
      'layerSectionEnd',
      'layerSectionContent',
    ]),
    _enum: z.literal('layerSectionType'),
  }),
  layerKind: z.number(),
  itemIndex: z.number(),
  background: z.boolean(),
  mode: z.object({
    _enum: z.literal('blendMode'),
    _value: z.string(),
  }),
  layerID: z.number(),
  layerEffects: z.record(z.string(), z.object({
    // "scale" does not have an "enabled" property, that's why it's optional
    enabled: z.boolean().optional(),
  }).or(z.array(z.object({
    enabled: z.boolean(),
  })))).optional(),
});

export function createGetLayerCommand(layerRef: PsLayerRef) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: [
        { _ref: 'layer', _id: layerRef.id },
        { _ref: 'document', _id: layerRef.docId },
      ],
    },
    schema: layerSchema,
  });
}

export function createGetBackgroundLayerCommand(docId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: { _ref: [{ _ref: 'layer', _property: 'background' }, { _ref: 'document', _id: docId }] },
    },
    schema: layerSchema,
  });
}
