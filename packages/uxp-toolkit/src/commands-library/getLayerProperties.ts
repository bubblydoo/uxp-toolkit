import type { Document } from "photoshop/dom/Document";
import { z } from "zod";
import { batchPlayCommand, createCommand } from "../core/command";

// get layer properties like name and layerID for all layers in the document (by index)
export const getLayerProperties = async (document: Document) => {
  const command = createCommand({
    modifying: false,
    descriptor: {
      _obj: "multiGet",
      _target: { _ref: [{ _ref: "document", _id: document.id }] },
      extendedReference: [
        ["name", "layerID", "visible"],
        { _obj: "layer", index: 1, count: -1 },
      ],
    },
    schema: z.object({
      list: z.array(
        z.object({
          name: z.string(),
          layerID: z.number(),
          visible: z.boolean().optional(),
        })
      )
    })
  });
  
  const result = await batchPlayCommand(command);

  // Reverse to get bottom-up order
  return [...result.list].reverse();
};
