import { describe, expect, it } from 'vitest';
import { layerDescriptorSchema } from './multiGetDocument';

const baseLayerDescriptor = {
  name: 'Color Layer',
  layerID: 1,
  visible: true,
  group: false,
  layerSection: {
    _value: 'layerSectionContent' as const,
    _enum: 'layerSectionType' as const,
  },
  layerKind: 11,
  itemIndex: 1,
  background: false,
  mode: {
    _enum: 'blendMode' as const,
    _value: 'normal',
  },
};

function parseSolidColorLayer(color: Record<string, unknown>) {
  return layerDescriptorSchema.parse({
    ...baseLayerDescriptor,
    adjustment: [
      {
        _obj: 'solidColorLayer',
        color,
      },
    ],
  });
}

describe('multiGetDocument color parsing', () => {
  it('parses all supported solid color schemas', () => {
    const variants = [
      {
        _obj: 'RGBColor',
        red: 200,
        grain: 120,
        blue: 40,
      },
      {
        _obj: 'RGBColor',
        redFloat: -0.03941090777516365,
        greenFloat: -0.034222397953271866,
        blueFloat: -0.008142096921801567,
      },
      {
        _obj: 'HSBColor',
        hue: 120,
        saturation: 50,
        brightness: 70,
      },
      {
        _obj: 'CMYKColor',
        cyan: 20,
        magenta: 30,
        yellow: 40,
        black: 10,
      },
      {
        _obj: 'CMYKColorClass',
        cyan: 20,
        magenta: 30,
        yellowColor: 40,
        black: 10,
      },
      {
        _obj: 'labColor',
        luminance: 50,
        a: 10,
        b: -10,
      },
      {
        _obj: 'grayscale',
        gray: 30,
      },
    ];

    for (const variant of variants) {
      const parsed = parseSolidColorLayer(variant);
      const adjustment = parsed.adjustment?.[0];
      expect(adjustment?._obj).toBe('solidColorLayer');
      expect('color' in (adjustment ?? {})).toBe(true);
    }
  });
});
