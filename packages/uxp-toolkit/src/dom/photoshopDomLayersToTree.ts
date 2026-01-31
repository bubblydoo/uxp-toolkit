import type { Layer as DomLayer } from 'photoshop';
import type { Tree } from '../general-tree/treeTypes';

// get layers recursively
export function photoshopDomLayersToTree(layers: DomLayer[]): Tree<DomLayer> {
  // Get top-level layers
  const filteredLayers = layers.filter(layer => layer.parent === null);

  const generateTree = (layers: DomLayer[]): Tree<DomLayer> => {
    return layers.map((layer: DomLayer) => ({
      ref: layer,
      name: layer.name,
      ...(layer.layers && { children: generateTree(layer.layers) }),
    }));
  };

  return generateTree(filteredLayers);
}
