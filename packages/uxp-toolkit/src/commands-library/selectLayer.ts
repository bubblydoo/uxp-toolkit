import { z } from "zod";
import { createCommand } from "../core/command";
import type { PsLayerRef } from "../ut-tree/psLayerRef";

export function createSelectLayerCommand(layerRef: PsLayerRef) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'select',
      _target: [
        {
          _ref: 'layer',
          _id: layerRef.id,
        },
        {
          _ref: 'document',
          _id: layerRef.docId,
        },
      ],
      makeVisible: false,
      layerID: [layerRef.id],
      _isCommand: false,
    },
    schema: z.unknown(),
  });
}
