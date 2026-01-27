
import { type PsLayerRef } from "./psLayerRef";
import { batchPlayCommand, createCommand } from "../core/command";
import { z } from "zod";

export function createGetLayerCommand(layerRef: PsLayerRef) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: "get",
      _target: [
        { _ref: "layer", _id: layerRef.id },
        { _ref: "document", _id: layerRef.docId },
      ],
    },
    schema: z.object({
      layerID: z.number(),
      group: z.boolean().optional(),
      layerEffects: z.record(z.string(), z.object({
        // "scale" does not have an "enabled" property, that's why it's optional
        enabled: z.boolean().optional(),
      }).or(z.array(z.object({
        enabled: z.boolean(),
      })))).optional(),
    }),
  });
}

export async function getLayerEffects(layerRef: PsLayerRef) {
  const result = await batchPlayCommand(createGetLayerCommand(layerRef));

  const data = result.layerEffects || {};
  
  const effects: Record<string, boolean> = {};

  for (const effect in data) {
    if (effect !== "scale") effects[effect] = Array.isArray(data[effect]) ? data[effect].some((e) => e.enabled) : !!data[effect]?.enabled;
  }

  return effects;
}
