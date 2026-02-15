import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { getDocumentLayerDescriptors } from './getDocumentLayerDescriptors';
import { photoshopLayerDescriptorsToUTLayers } from './photoshopLayerDescriptorsToUTLayers';

describe('getDocumentLayerDescriptors', () => {
  it('should correctly identify all adjustment layers', async (t) => {
    const doc = await openFixture(t, 'all-adjustment-layers.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const nativeKinds = descriptors.map(d => `${d.name}:${d.layerKind}`);
    expect(nativeKinds.join(',')).toEqual(
      [
        'Color and vibrance 1:2',
        'Clarity and dehaze 1:2',
        'Grain 1:2',
        'Brightness/Contrast 1:2',
        'Levels 1:2',
        'Curves 1:2',
        'Exposure 1:2',
        'Hue/Saturation 1:2',
        'Color Balance 1:2',
        'Black & White 1:2',
        'Photo Filter 1:2',
        'Channel Mixer 1:2',
        'Color Lookup 1:2',
        'Selective Color 1:2',
        'Invert 1:2',
        'Posterize 1:2',
        'Threshold 1:2',
        'Gradient Map 1:2',
        'Color Fill 1:11',
        'Gradient Fill 1:9',
        'Pattern Fill 1:10',
        'Background:1',
      ].join(','),
    );
    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
    const kinds = layers.map(l => `${l.name}:${l.kind}:${l.adjustment?.type}`);
    expect(kinds.join(',')).toEqual(
      [
        'Color and vibrance 1:adjustmentLayer:vibrance',
        'Clarity and dehaze 1:adjustmentLayer:clarity',
        'Grain 1:adjustmentLayer:grainAdjustment',
        'Brightness/Contrast 1:adjustmentLayer:brightnessEvent',
        'Levels 1:adjustmentLayer:levels',
        'Curves 1:adjustmentLayer:curves',
        'Exposure 1:adjustmentLayer:exposure',
        'Hue/Saturation 1:adjustmentLayer:hueSaturation',
        'Color Balance 1:adjustmentLayer:colorBalance',
        'Black & White 1:adjustmentLayer:blackAndWhite',
        'Photo Filter 1:adjustmentLayer:photoFilter',
        'Channel Mixer 1:adjustmentLayer:channelMixer',
        'Color Lookup 1:adjustmentLayer:colorLookup',
        'Selective Color 1:adjustmentLayer:selectiveColor',
        'Invert 1:adjustmentLayer:invert',
        'Posterize 1:adjustmentLayer:posterization',
        'Threshold 1:adjustmentLayer:thresholdClassEvent',
        'Gradient Map 1:adjustmentLayer:gradientMapClass',
        'Color Fill 1:solidColor:solidColorLayer',
        'Gradient Fill 1:gradientFill:gradientLayer',
        'Pattern Fill 1:pattern:patternLayer',
        'Background:pixel:undefined',
      ].join(','),
    );
  });

  it('should correctly identify linked layers', async (t) => {
    const doc = await openFixture(t, 'linked-layers.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const layers = photoshopLayerDescriptorsToUTLayers(descriptors);
    expect(layers[0]?.linkedLayerIds).toEqual([2]);
    expect(layers[1]?.linkedLayerIds).toEqual([3]);
  });

  it('should correctly identify mask layers', async (t) => {
    const doc = await openFixture(t, 'layer-with-mask.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    expect(descriptors[0]?.hasUserMask).toBe(true);
  });
});
