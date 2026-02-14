import type { PsLayerRef } from '../ut-tree/psLayerRef';
import { createCommand } from '../core/command';
import { layerDescriptorSchema } from './multiGetDocument';

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
    schema: layerDescriptorSchema,
  });
}

export function createGetBackgroundLayerCommand(docId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: { _ref: [{ _ref: 'layer', _property: 'background' }, { _ref: 'document', _id: docId }] },
    },
    schema: layerDescriptorSchema,
  });
}
