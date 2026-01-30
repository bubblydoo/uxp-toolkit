import { z } from "zod";
import { createCommand } from "../core/command";
import type { PsLayerRef } from "../ut-tree/psLayerRef";

export function createExpandFolderCommand(layerRef: PsLayerRef) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'set',
      _target: {
        _ref: [
          { _property: 'layerSectionExpanded' },
          { _ref: 'layer', _id: layerRef.id },
          { _ref: 'document', _id: layerRef.docId }
        ],
      },
      to: true,
    },
    schema: z.unknown(),
  });
}
