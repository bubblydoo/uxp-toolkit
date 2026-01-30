import { z } from "zod";
import { createCommand } from "../core/command";
import type { PsLayerRef } from "../ut-tree/psLayerRef";

export function createAddLayerToSelectionCommand(
  layerRef: PsLayerRef,
  previousLayerRef: PsLayerRef
) {
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
      selectionModifier: {
        _enum: 'selectionModifierType',
        _value: 'addToSelection',
      },
      makeVisible: false,
      layerID: [layerRef.id, previousLayerRef.id],
      _isCommand: true,
    },
    schema: z.unknown(),
  });
}
