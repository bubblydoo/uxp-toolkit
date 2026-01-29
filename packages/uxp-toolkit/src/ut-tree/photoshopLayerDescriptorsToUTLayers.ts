import { type LayerDescriptor } from "./getFlattenedLayerDescriptorsList";
import { executeAsModal } from "../core/executeAsModal";
import { createGetLayerCommand } from "./getLayerEffects";

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
  opacity: number;
  layers?: UTLayerBuilder[];
};

export type UTLayer = Readonly<Omit<UTLayerBuilder, "layers">> & {
  layers?: UTLayer[];
};

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

const getLayerSectionValue = (layer: LayerDescriptor): string | undefined => {
  if (typeof layer.layerSection === "string") {
    return layer.layerSection;
  }
  if (
    layer.layerSection &&
    typeof layer.layerSection === "object" &&
    "_value" in layer.layerSection
  ) {
    return layer.layerSection._value;
  }
  return undefined;
};

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

const determineLayerSection = (layer: LayerDescriptor): string => {
  const section = getLayerSectionValue(layer);
  const isGroupEnd =
    layer.name === "</Layer group>" ||
    layer.name === "</Layer set>" ||
    section === "layerSectionEnd";

  const isGroupStart = section === "layerSectionStart";
  return isGroupStart ? "start" : isGroupEnd ? "end" : "normal";
};

// Generate a tree from a flat list of layer descriptors
export const photoshopLayerDescriptorsToUTLayers = async (layers: LayerDescriptor[]): Promise<UTLayer[]> => {
  const root: UTLayerBuilder[] = [];
  const stack: {
    layers: UTLayerBuilder[];
  }[] = [{ layers: root }];

  // 1. Prepare a single batch request for all layers
  const commands = layers.map((layer) => createGetLayerCommand({ docId: layer.docId, id: layer.layerID }));

  // 2. Execute one batch command instead of N commands
  const batchResults = await executeAsModal("Get Layer Effects Data", async (ctx) => {
    return await ctx.batchPlayCommands(commands);
  });

  // 3. Create a fast lookup map for the results
  const effectsMap = new Map<number, UTLayerBuilder["effects"]>();
  batchResults.forEach((result, index) => {
    const layerId = layers[index]!.layerID;
    const data = result.layerEffects;
    const effects: UTLayerBuilder["effects"] = {};
    if (data) {
      for (const effect in data) {
        effects[effect] = Array.isArray(data[effect]) ? data[effect].some((e) => e.enabled) : !!data[effect]?.enabled;
      }
    }
    effectsMap.set(layerId, effects);
  });

  for (const layer of layers) {
    // Determine if the layer is a group start or end
    const sectionType = determineLayerSection(layer);

    const isClippingMask = !!batchResults.find((res, index) => {
      return layer.layerID === res.layerID;
    })?.group;

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
      effects: effectsMap.get(layer.layerID) || {},
      opacity: layer.opacity,
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
