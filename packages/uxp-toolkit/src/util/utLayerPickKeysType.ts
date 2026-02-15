import type { UTLayer } from '../ut-tree/photoshopLayerDescriptorsToUTLayers';

export type UTLayerPickKeys<TKey extends keyof Omit<UTLayer, 'layers'>> = Pick<Omit<UTLayer, 'layers'>, TKey> & {
  layers?: UTLayerPickKeys<TKey>[];
};
