import type { Tree } from "../general-tree/treeTypes";
import type { UTLayer } from "./photoshopLayerDescriptorsToUTLayers";

export type UTLayerWithoutChildren = Omit<UTLayer, "layers">;

export function utLayersToTree(layer: UTLayer[]): Tree<UTLayerWithoutChildren> {
  return layer.map((layer) => ({
    ref: {
      name: layer.name,
      docId: layer.docId,
      id: layer.id,
      visible: layer.visible,
      kind: layer.kind,
      blendMode: layer.blendMode,
      isClippingMask: layer.isClippingMask,
      effects: layer.effects,
      background: layer.background,
    },
    name: layer.name,
    children: layer.layers ? utLayersToTree(layer.layers) : undefined,
  }));
}
