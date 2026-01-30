
import { type PsLayerRef } from "./psLayerRef";
import { batchPlayCommand } from "../core/command";
import { createGetLayerCommand } from "../commands-library/getLayer";

export async function getLayerEffects(layerRef: PsLayerRef) {
  const result = await batchPlayCommand(createGetLayerCommand(layerRef));

  const data = result.layerEffects || {};

  const effects: Record<string, boolean> = {};

  for (const effect in data) {
    if (effect !== "scale") effects[effect] = Array.isArray(data[effect]) ? data[effect].some((e) => e.enabled) : !!data[effect]?.enabled;
  }

  return effects;
}
