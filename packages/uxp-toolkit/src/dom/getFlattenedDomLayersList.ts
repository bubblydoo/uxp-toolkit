import type { Layer as DomLayer } from 'photoshop';
import { constants } from 'photoshop';

// get all layers (including nested in groups)
// TODO: I would rename this to getAllDOMLayers to avoid confusion with UXPToolkitLayer
export function getFlattenedDomLayersList(layers: DomLayer[]): DomLayer[] {
  const allLayers: DomLayer[] = [];

  // Use a stack to avoid maximal call stack size (recursion) errors efficiently
  const stack: DomLayer[] = [];

  // Initialize stack with input layers in reverse order so the first layer is popped first.
  // We use a manual loop because 'layers' can be a Photoshop 'Layers' collection object
  // or an Array, and this covers both efficiently.
  for (let i = layers.length - 1; i >= 0; i--) {
    stack.push(layers[i]!);
  }

  while (stack.length > 0) {
    const layer = stack.pop();
    if (!layer)
      continue;

    allLayers.push(layer);

    // Check for group
    if (layer.kind === constants.LayerKind.GROUP) {
      // PERF: Accessing '.layers' on a DOM object is an expensive IPC call.
      // We must cache it in a variable ensuring we only access it ONCE per group.
      const children = layer.layers;

      if (children && children.length > 0) {
        // Push children in reverse to maintain depth-first standard order
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i]!);
        }
      }
    }
  }

  return allLayers;
}
