import type { PsLayerRef } from '../ut-tree/psLayerRef';
import { z } from 'zod';
import { createCommand } from '../core/command';

export function createRasterizeLayerStyleCommand(psLayerRef: PsLayerRef) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'rasterizeLayer',
      _target: [{ _ref: 'layer', _id: psLayerRef.id }, { _ref: 'document', _id: psLayerRef.docId }],
      what: { _enum: 'rasterizeItem', _value: 'layerStyle' },
    },
    schema: z.unknown(),
  });
}
