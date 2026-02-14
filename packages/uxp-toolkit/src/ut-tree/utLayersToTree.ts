import type { Tree } from '../general-tree/treeTypes';
import type { UTLayer } from './photoshopLayerDescriptorsToUTLayers';

export type UTLayerWithoutChildren = Omit<UTLayer, 'layers'>;

export function utLayersToTree(layer: UTLayer[]): Tree<UTLayerWithoutChildren> {
  return layer.map(layer => ({
    ref: layer,
    name: layer.name,
    children: layer.layers ? utLayersToTree(layer.layers) : undefined,
  }));
}
