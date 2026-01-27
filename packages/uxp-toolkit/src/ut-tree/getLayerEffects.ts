import { type PsLayerData } from "./psLayerData";
import { type PsLayerRef } from "./psLayerRef";
import { batchPlayCommand, createCommand } from "../core/command";
import { z } from "zod";

export function createGetLayerEffectsCommand(layerRef: PsLayerRef) {
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
  const result = await batchPlayCommand(createGetLayerEffectsCommand(layerRef));

  const data = result.layerEffects || {};

  const effects: PsLayerData["effects"] = {};

  for (const effect in data) {
    if (effect !== "scale") effects[effect] = Array.isArray(data[effect]) ? data[effect].some((e) => e.enabled) : !!data[effect]?.enabled;
  }

  return effects;
}
