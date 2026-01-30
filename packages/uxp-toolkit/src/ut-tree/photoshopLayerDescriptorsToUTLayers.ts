import { type LayerDescriptor } from "./getFlattenedLayerDescriptorsList";
import { executeAsModal } from "../core/executeAsModal";
import { createGetLayerCommand } from "./getLayerEffects";
import { batchPlayCommands, type UTCommandResult } from "../core/command";
import type z from "zod";

type UTLayerKind = "pixel" | "adjustment-layer" | "text" | "curves" | "smartObject" | "video" | "group" | "threeD" | "gradientFill" | "pattern" | "solidColor" | "background";

type UTBlendMode = "normal" | "dissolve" | "darken" | "multiply" | "colorBurn" | "linearBurn" | "darkerColor" | "lighten" | "screen" | "colorDodge" | "linearDodge" | "lighterColor" | "overlay" | "softLight" | "hardLight" | "vividLight" | "linearLight" | "pinLight" | "hardMix" | "difference" | "exclusion" | "blendSubtraction" | "blendDivide" | "hue" | "saturation" | "color" | "luminosity" | "passThrough";

type UTLayerBuilder = {
  name: string;
  docId: number;
  id: number;
  visible: boolean;
  kind: UTLayerKind;
  blendMode: UTBlendMode;
  effects: Record<string, boolean>;
  isClippingMask: boolean;
  layers?: UTLayerBuilder[];
};

export type UTLayer = Readonly<Omit<UTLayerBuilder, "layers">> & {
  layers?: UTLayer[];
};

export type UTLayerMultiGetOnly = Omit<UTLayer, "effects">;

const layerKindMap = new Map<number, UTLayerKind>([
  [1, "pixel"],
  [2, "adjustment-layer"], // All adjustment layers
  [3, "text"],
  [4, "curves"],
  [5, "smartObject"],
  [6, "video"],
  [7, "group"],
  [8, "threeD"],
  [9, "gradientFill"],
  [10, "pattern"],
  [11, "solidColor"],
  [12, "background"], // according to the internet but the actual value is undefined
]);

const blendModes: string[] = [
  "normal",
  "dissolve",
  "darken",
  "multiply",
  "colorBurn",
  "linearBurn",
  "darkerColor",
  "lighten",
  "screen",
  "colorDodge",
  "linearDodge",
  "lighterColor",
  "overlay",
  "softLight",
  "hardLight",
  "vividLight",
  "linearLight",
  "pinLight",
  "hardMix",
  "difference",
  "exclusion",
  "blendSubtraction",
  "blendDivide",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "passThrough",
] satisfies UTBlendMode[];

const getLayerKind = (layer: LayerDescriptor): UTLayerKind => {
  const kind = layerKindMap.get(layer.layerKind);
  if (!kind) {
    throw new Error(`Unknown layer kind: ${layer.layerKind}`);
  }
  return kind;
};

const getBlendMode = (layer: LayerDescriptor): UTBlendMode => {
  const mode = layer.mode._value;
  if (!blendModes.includes(mode)) {
    throw new Error(`Unknown blend mode: ${mode}`);
  }
  return mode as UTBlendMode;
};

// Generate a tree from a flat list of layer descriptors
export const photoshopLayerDescriptorsToUTLayers = async (layers: LayerDescriptor[]): Promise<UTLayer[]> => {
  // 1. Prepare a single batch request for all layers
  const commands = layers.map((layer) => createGetLayerCommand({ docId: layer.docId, id: layer.layerID }));

  // 2. Execute one batch command instead of N commands
  const getCommandResults = await batchPlayCommands(commands);

  // 3. Create a fast lookup map for the results
  const extra = turnGetCommandResultsToExtraLayerData(getCommandResults);

  return photoshopLayerDescriptorsToUTLayersCore(layers, extra);
};

type ExtraLayerData = {
  effects: UTLayerBuilder["effects"];
  /** Whether it's a clipping mask or not. For some reason called "group" in the command result. */
  group: boolean;
};

// type GetLayerCommandResult = z.infer<ReturnType<typeof createGetLayerCommand>['schema']>;
type GetLayerCommandResult = UTCommandResult<ReturnType<typeof createGetLayerCommand>>;

function turnGetCommandResultsToExtraLayerData(results: GetLayerCommandResult[]): Map<number, ExtraLayerData> {
  const map = new Map<number, ExtraLayerData>();
  results.forEach((result) => {
    const layerId = result.layerID;
    const data = result.layerEffects;
    const effects: UTLayerBuilder["effects"] = {};
    if (data) {
      for (const effect in data) {
        effects[effect] = Array.isArray(data[effect]) ? data[effect].some((e) => e.enabled) : !!data[effect]?.enabled;
      }
    }
    map.set(layerId, { effects, group: !!result.group });
  });
  return map;
}

export function photoshopLayerDescriptorsToUTLayersCore(layers: LayerDescriptor[], extra: Map<number, ExtraLayerData>): UTLayer[] {
  const root: UTLayerBuilder[] = [];
  const stack: {
    layers: UTLayerBuilder[];
  }[] = [{ layers: root }];

  for (const layer of layers) {
    // Determine if the layer is a group start or end
    const sectionType = determineLayerSection(layer);

    const isClippingMask = !!extra.get(layer.layerID)?.group;

    // Handle group end
    if (sectionType === "end") {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    // Create the node
    const node: UTLayerBuilder = {
      name: layer.name,
      docId: layer.docId,
      id: layer.layerID,
      visible: layer.visible,
      kind: getLayerKind(layer),
      blendMode: getBlendMode(layer),
      isClippingMask,
      effects: extra.get(layer.layerID)?.effects ?? {},
    };

    // Add the node to the current level
    const current = stack[stack.length - 1];
    current!.layers.push(node);

    // Handle group start
    if (sectionType === "start") {
      node.layers = [];
      // Push children array to stack to process content
      stack.push({ layers: node.layers });
    }
  }

  // Cast to the readonly Tree type
  return root as UTLayer[];
};

const determineLayerSection = (layer: LayerDescriptor): "start" | "end" | "normal" => {
  const section = layer.layerSection._value;
  const isGroupEnd =
    layer.name === "</Layer group>" ||
    layer.name === "</Layer set>" ||
    section === "layerSectionEnd";

  const isGroupStart = section === "layerSectionStart";
  return isGroupStart ? "start" : isGroupEnd ? "end" : "normal";
};
