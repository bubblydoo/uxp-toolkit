import { type PsLayerData } from "./psLayerData";
import { type Tree } from "@/general-tree/treeTypes";
import { batchPlay } from "@/core/batchPlay";
import { type LayerDescriptor } from "./getFlattenedLayerDescriptorsList";
import { executeAsModal } from "@/core/executeAsModal";

type UTLayerKind = "pixel" | "adjustment-layer" | "text" | "curves" | "smartObject" | "video" | "group" | "threeD" | "gradientFill" | "pattern" | "solidColor" | "background";

type UTBlendMode = "normal" | "dissolve" | "darken" | "multiply" | "colorBurn" | "linearBurn" | "darkerColor" | "lighten" | "screen" | "colorDodge" | "linearDodge" | "lighterColor" | "overlay" | "softLight" | "hardLight" | "vividLight" | "linearLight" | "pinLight" | "hardMix" | "difference" | "exclusion" | "blendSubtraction" | "blendDivide" | "hue" | "saturation" | "color" | "luminosity" | "passThrough";

type UTLayerBuilder = {
  name: string;
  docId: number;
  id: number;
  visible: boolean;
  kind: UTLayerKind;
  blendMode: UTBlendMode;
  layers?: UTLayerBuilder[];
  isClippingMask: boolean;
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

type PsTreeNodeBuilder = {
  data: PsLayerData;
  layer: UTLayerBuilder;
};

type PsTreeNode = {
  data: PsLayerData;
  layer: UTLayer;
};

// Generate a tree from a flat list of layer descriptors
export const photoshopLayerDescriptorsToTree = async (layers: LayerDescriptor[]): Promise<Tree<PsTreeNode>> => {
  const root: Tree<PsTreeNodeBuilder> = [];
  const stack: {
    nodes: Tree<PsTreeNodeBuilder>;
  }[] = [{ nodes: root }];

  // 1. Prepare a single batch request for all layers
  const descriptors = layers.map((layer) => ({
    _obj: "get",
    _target: [
      { _ref: "layer", _id: layer.layerID },
      { _ref: "document", _id: layer.docId },
    ],
    _options: {
      dialogOptions: "dontDisplay",
    },
  }));

  // 2. Execute one batch command instead of N commands
  const batchResults = await executeAsModal("Get Layer Effects Data", async () => {
    return await batchPlay(descriptors, {
      synchronousExecution: true,
      modalBehavior: "fail",
    });
  });

  // 3. Create a fast lookup map for the results
  const effectsMap = new Map<number, PsLayerData["effects"]>();
  batchResults.forEach((result, index) => {
    const layerId = layers[index]!.layerID;
    const data = result.layerEffects;
    const effects: PsLayerData["effects"] = {};
    if (data) {
      for (const effect in data) {
        if (effect !== "scale") effects[effect] = data[effect].enabled;
      }
    }
    effectsMap.set(layerId, effects);
  });

  for (const layer of layers) {
    // Determine if the layer is a group start or end
    const sectionType = determineLayerSection(layer);

    const isClippingMask = batchResults.find((res, index) => {
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
    const node: Tree<PsTreeNodeBuilder>[number] = {
      ref: {
        layer: {
          name: layer.name,
          docId: layer.docId,
          id: layer.layerID,
          visible: layer.visible,
          kind: getLayerKind(layer),
          blendMode: getBlendMode(layer),
          isClippingMask,
        },
        data: {
          // add clipping (isClippingMask) for adjustment layers
          type:
            getLayerKind(layer) === "adjustment-layer" // This is messy
              ? "adjustment-layer"
              : (getLayerKind(layer) as any) || "pixel",
          blendMode: getBlendMode(layer),
          effects: effectsMap.get(layer.layerID) || {},
        },
      },
      name: layer.name,
    };

    // Add the node to the current level
    const current = stack[stack.length - 1];
    current!.nodes.push(node);

    // Handle group start
    if (sectionType === "start") {
      node.children = [];
      node.ref.layer.layers = [];
      // Push children array to stack to process content
      stack.push({ nodes: node.children });
    }
  }

  // Cast to the readonly Tree type
  return root as Tree<PsTreeNode>;
};
