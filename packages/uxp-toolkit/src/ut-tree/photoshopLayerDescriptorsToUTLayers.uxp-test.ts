import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { getDocumentLayerDescriptors } from './getDocumentLayerDescriptors';
import { photoshopLayerDescriptorsToUTLayers } from './photoshopLayerDescriptorsToUTLayers';

describe('photoshopLayerDescriptorsToUTLayers', () => {
  it('should convert clipping layers correctly', async () => {
    const doc = await openFixture('clipping-layers.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);

    console.log(descriptors);

    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);

    // Check first layer (circle)
    expect(layers[0]).toMatchObject({
      name: 'circle',
      visible: true,
      kind: 'pixel',
      blendMode: 'normal',
      isClippingMask: true,
      effects: {},
    });

    // Check group layer
    expect(layers[1]).toMatchObject({
      name: 'group',
      visible: true,
      kind: 'group',
      blendMode: 'passThrough',
      isClippingMask: false,
      effects: {},
    });

    // Check nested layers in group
    const groupLayers = (layers[1] as { layers: unknown[] }).layers;
    expect(groupLayers[0]).toMatchObject({
      name: 'green square',
      visible: true,
      kind: 'pixel',
      blendMode: 'normal',
      isClippingMask: true,
      effects: {},
    });
    expect(groupLayers[1]).toMatchObject({
      name: 'red square',
      id: 2,
      visible: true,
      kind: 'pixel',
      blendMode: 'normal',
      isClippingMask: false,
      effects: {},
    });
  });

  it('should convert layers with background correctly', async () => {
    const doc = await openFixture('one-layer-with-bg.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    console.log(descriptors);
    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
    console.log(layers);

    expect(layers[0]).toMatchObject({
      name: 'Layer 1',
      visible: true,
      kind: 'pixel',
      blendMode: 'normal',
      isClippingMask: false,
      effects: {},
    });

    expect(layers[1]).toMatchObject({
      name: 'Background',
      visible: true,
      kind: 'pixel',
      blendMode: 'normal',
      isClippingMask: false,
      effects: {},
    });
  });
});
