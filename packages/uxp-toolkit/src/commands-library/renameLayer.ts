import { createCommand } from "../core/command";
import type { PsLayerRef } from "../ut-tree/psLayerRef";
import { z } from "zod";

export function createRenameLayerCommand(layerRef: PsLayerRef, newName: string) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: "set",
      _target: [{ _ref: "layer", _id: layerRef.id }, { _ref: "document", _id: layerRef.docId }],
      to: { _obj: "layer", name: newName },
    },
    schema: z.unknown(),
  });
}
