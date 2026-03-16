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

  it('should parse RGB solid color layers from RGB fixture', async (t) => {
    const doc = await openFixture(t, 'all-color-schemas-rgb.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);

    function getColorKeys(layerName: string) {
      const layer = descriptors.find(d => d.name === layerName);
      const adjustment = layer?.adjustment?.[0];
      if (!adjustment || !('color' in adjustment) || !adjustment.color) {
        return null;
      }
      return Object.keys(adjustment.color).sort();
    }

    expect(getColorKeys('color-rgb-int')).toEqual(['_obj', 'blue', 'grain', 'red']);
    expect(getColorKeys('color-rgb-float')).toEqual(['_obj', 'blueFloat', 'greenFloat', 'redFloat']);
  });

  it('should parse CMYK solid color layers from CMYK fixture', async (t) => {
    const doc = await openFixture(t, 'all-color-schemas-cmyk.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const layer = descriptors.find(d => d.name === 'color-cmyk');
    const color = layer?.adjustment?.[0] && 'color' in layer.adjustment[0] ? layer.adjustment[0].color : null;
    const keys = color ? Object.keys(color).sort() : null;
    expect(keys).toEqual(['_obj', 'black', 'cyan', 'magenta', 'yellowColor']);
  });

  it('should parse LAB solid color layers from LAB fixture', async (t) => {
    const doc = await openFixture(t, 'all-color-schemas-lab.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const layer = descriptors.find(d => d.name === 'color-lab');
    const color = layer?.adjustment?.[0] && 'color' in layer.adjustment[0] ? layer.adjustment[0].color : null;
    const keys = color ? Object.keys(color).sort() : null;
    expect(keys).toEqual(['_obj', 'a', 'b', 'luminance']);
  });

  it('should parse grayscale solid color layers from grayscale fixture', async (t) => {
    const doc = await openFixture(t, 'all-color-schemas-gray.psd');
    const descriptors = await getDocumentLayerDescriptors(doc.id);
    const layer = descriptors.find(d => d.name === 'color-gray');
    const color = layer?.adjustment?.[0] && 'color' in layer.adjustment[0] ? layer.adjustment[0].color : null;
    const keys = color ? Object.keys(color).sort() : null;
    expect(keys).toEqual(['_obj', 'gray']);
  });
});
