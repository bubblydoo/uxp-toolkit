import { z } from 'zod';
import { createCommand } from '../core/command';

const presetKindSchema = z.object({
  _enum: z.literal('presetKindType'),
  _value: z.string(),
});

const percentUnitSchema = z.object({
  _unit: z.literal('percentUnit'),
  _value: z.number(),
});

const rgbColorSchema = z.object({
  _obj: z.literal('RGBColor'),
  red: z.number(),
  grain: z.number(),
  blue: z.number(),
});

const channelMatrixSchema = z.object({
  _obj: z.literal('channelMatrix'),
  red: percentUnitSchema,
  grain: percentUnitSchema,
  blue: percentUnitSchema,
  constant: percentUnitSchema,
});

const colorStopSchema = z.object({
  _obj: z.literal('colorStop'),
  color: rgbColorSchema,
  type: z.object({
    _enum: z.literal('colorStopType'),
    _value: z.string(),
  }),
  location: z.number(),
  midpoint: z.number(),
});

const transferSpecSchema = z.object({
  _obj: z.literal('transferSpec'),
  opacity: percentUnitSchema,
  location: z.number(),
  midpoint: z.number(),
});

const gradientSchema = z.object({
  _obj: z.literal('gradientClassEvent'),
  name: z.string(),
  gradientForm: z.object({
    _enum: z.literal('gradientForm'),
    _value: z.string(),
  }),
  interfaceIconFrameDimmed: z.number(),
  colors: z.array(colorStopSchema),
  transparency: z.array(transferSpecSchema),
});

export const adjustmentSchema = z.discriminatedUnion('_obj', [
  // vibrance (Color and vibrance)
  z.object({
    _obj: z.literal('vibrance'),
    whiteBalancePopupIndex: z.number(),
    temperature: z.number(),
    tint: z.number(),
    useLegacy: z.boolean(),
    vibrance: z.number(),
    saturation: z.number(),
  }),
  // clarity (Clarity and dehaze)
  z.object({
    _obj: z.literal('clarity'),
    clarity: z.number(),
    dehaze: z.number(),
  }),
  // grainAdjustment (Grain)
  z.object({
    _obj: z.literal('grainAdjustment'),
    grainAmount: z.number(),
    grainSize: z.number(),
    grainRoughness: z.number(),
    grainSeed: z.number(),
  }),
  // brightnessEvent (Brightness/Contrast)
  z.object({
    _obj: z.literal('brightnessEvent'),
    brightness: z.number(),
    center: z.number(),
    useLegacy: z.boolean(),
  }),
  // levels (Levels)
  z.object({
    _obj: z.literal('levels'),
    presetKind: presetKindSchema,
    adjustment: z.array(z.object({
      _obj: z.literal('levelsAdjustment'),
      channel: z.object({
        _ref: z.literal('channel'),
        _enum: z.literal('channel'),
        _value: z.string(),
      }),
      input: z.tuple([z.number(), z.number()]),
      gamma: z.number(),
      output: z.tuple([z.number(), z.number()]),
    })),
  }),
  // curves (Curves)
  z.object({
    _obj: z.literal('curves'),
    transferFunction: z.number(),
    presetKind: presetKindSchema,
    adjustment: z.array(z.object({
      _obj: z.literal('curvesAdjustment'),
      channel: z.object({
        _ref: z.literal('channel'),
        _enum: z.literal('channel'),
        _value: z.string(),
      }),
      curve: z.array(z.object({
        _obj: z.literal('paint'),
        horizontal: z.number(),
        vertical: z.number(),
      })),
    })),
  }),
  // exposure (Exposure)
  z.object({
    _obj: z.literal('exposure'),
    presetKind: presetKindSchema,
    exposure: z.number(),
    offset: z.number(),
    gammaCorrection: z.number(),
  }),
  // hueSaturation (Hue/Saturation)
  z.object({
    _obj: z.literal('hueSaturation'),
    presetKind: presetKindSchema,
    GeneratedPreset: z.boolean(),
    colorize: z.boolean(),
    OriginalColors: z.array(z.object({
      _obj: z.literal('OriginalColor'),
      hue: z.number(),
      saturation: z.number(),
      lightness: z.number(),
    })),
    adjustment: z.array(z.object({
      _obj: z.literal('hueSatAdjustmentV2'),
      hue: z.number(),
      saturation: z.number(),
      lightness: z.number(),
    })),
  }),
  // colorBalance (Color Balance)
  z.object({
    _obj: z.literal('colorBalance'),
    shadowLevels: z.tuple([z.number(), z.number(), z.number()]),
    midtoneLevels: z.tuple([z.number(), z.number(), z.number()]),
    highlightLevels: z.tuple([z.number(), z.number(), z.number()]),
    preserveLuminosity: z.boolean(),
  }),
  // blackAndWhite (Black & White)
  z.object({
    _obj: z.literal('blackAndWhite'),
    presetKind: presetKindSchema,
    red: z.number(),
    yellow: z.number(),
    grain: z.number(),
    cyan: z.number(),
    blue: z.number(),
    magenta: z.number(),
    useTint: z.boolean(),
    tintColor: rgbColorSchema,
  }),
  // photoFilter (Photo Filter)
  z.object({
    _obj: z.literal('photoFilter'),
    color: z.object({
      _obj: z.literal('labColor'),
      luminance: z.number(),
      a: z.number(),
      b: z.number(),
    }),
    density: z.number(),
    preserveLuminosity: z.boolean(),
  }),
  // channelMixer (Channel Mixer)
  z.object({
    _obj: z.literal('channelMixer'),
    presetKind: presetKindSchema,
    monochromatic: z.boolean(),
    red: channelMatrixSchema,
    grain: channelMatrixSchema,
    blue: channelMatrixSchema,
  }),
  // colorLookup (Color Lookup)
  z.object({
    _obj: z.literal('colorLookup'),
    lookupType: z.object({
      _enum: z.literal('colorLookupType'),
      _value: z.string(),
    }),
    name: z.string(),
    dither: z.boolean(),
    profile: z.unknown(),
    LUTFormat: z.object({
      _enum: z.literal('LUTFormatType'),
      _value: z.string(),
    }),
    LUT3DFileData: z.unknown(),
    LUT3DFileName: z.string(),
  }),
  // selectiveColor (Selective Color)
  z.object({
    _obj: z.literal('selectiveColor'),
    presetKind: presetKindSchema,
    method: z.object({
      _enum: z.literal('correctionMethod'),
      _value: z.string(),
    }),
    colorCorrection: z.array(z.object({
      _obj: z.literal('colorCorrection'),
      colors: z.object({
        _enum: z.literal('colors'),
        _value: z.string(),
      }),
      cyan: percentUnitSchema,
      magenta: percentUnitSchema,
      yellowColor: percentUnitSchema,
      black: percentUnitSchema,
    })),
  }),
  // invert (Invert)
  z.object({
    _obj: z.literal('invert'),
  }),
  // posterization (Posterize)
  z.object({
    _obj: z.literal('posterization'),
    levels: z.number(),
  }),
  // thresholdClassEvent (Threshold)
  z.object({
    _obj: z.literal('thresholdClassEvent'),
    level: z.number(),
  }),
  // gradientMapClass (Gradient Map)
  z.object({
    _obj: z.literal('gradientMapClass'),
    reverse: z.boolean(),
    dither: z.boolean(),
    gradientsInterpolationMethod: z.object({
      _enum: z.literal('gradientInterpolationMethodType'),
      _value: z.string(),
    }),
    gradient: gradientSchema,
  }),
  // solidColorLayer (Color Fill)
  z.object({
    _obj: z.literal('solidColorLayer'),
    color: rgbColorSchema,
  }),
  // gradientLayer (Gradient Fill)
  z.object({
    _obj: z.literal('gradientLayer'),
    gradientsInterpolationMethod: z.object({
      _enum: z.literal('gradientInterpolationMethodType'),
      _value: z.string(),
    }),
    angle: z.object({
      _unit: z.literal('angleUnit'),
      _value: z.number(),
    }),
    type: z.object({
      _enum: z.literal('gradientType'),
      _value: z.string(),
    }),
    noisePreSeed: z.number(),
    gradient: gradientSchema,
  }),
  // patternLayer (Pattern Fill)
  z.object({
    _obj: z.literal('patternLayer'),
    pattern: z.object({
      _obj: z.literal('pattern'),
      name: z.string(),
      ID: z.string(),
    }),
  }),
]);

export const layerDescriptorSchema = z.object({
  name: z.string(),
  layerID: z.number(),
  visible: z.boolean(),
  group: z.boolean(),
  layerSection: z.object({
    _value: z.enum([
      'layerSectionStart',
      'layerSectionEnd',
      'layerSectionContent',
    ]),
    _enum: z.literal('layerSectionType'),
  }),
  layerKind: z.number(),
  itemIndex: z.number(),
  background: z.boolean(),
  mode: z.object({
    _enum: z.literal('blendMode'),
    _value: z.string(),
  }),
  layerEffects: z.record(z.string(), z.object({
    // "scale" does not have an "enabled" property, that's why it's optional
    enabled: z.boolean().optional(),
  }).or(z.array(z.object({
    enabled: z.boolean(),
  })))).optional(),
  adjustment: z.array(adjustmentSchema).optional(),
  layerLocking: z.object({
    _obj: z.literal('layerLocking'),
    protectTransparency: z.boolean(),
    protectComposite: z.boolean(),
    protectPosition: z.boolean(),
    protectArtboardAutonest: z.boolean(),
    protectAll: z.boolean(),
  }).optional(),
  hasUserMask: z.boolean().optional(),
  userMaskEnabled: z.boolean().optional(),
  userMaskDensity: z.number().optional(),
  userMaskFeather: z.number().optional(),
  hasFilterMask: z.boolean().optional(),
  filterMaskEnabled: z.boolean().optional(),
  filterMaskDensity: z.number().optional(),
  filterMaskFeather: z.number().optional(),
  hasVectorMask: z.boolean().optional(),
  vectorMaskEnabled: z.boolean().optional(),
  vectorMaskDensity: z.number().optional(),
  vectorMaskFeather: z.number().optional(),
  opacity: z.number().optional(),
  fillOpacity: z.number().optional(),
  linkedLayerIDs: z.array(z.number()).optional(),
});

export function createMultiGetDocumentCommand(docId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'multiGet',
      _target: { _ref: [{ _ref: 'document', _id: docId }] },
      extendedReference: [
        [
          // todo: add all properties, see getLayer.txt
          'name',
          'layerID',
          'visible',
          'group',
          'layerSection',
          'layerKind',
          'itemIndex',
          'background',
          'mode',
          'layerEffects',
          'adjustment',
          'opacity',
          'layerLocking',
          'hasUserMask',
          'userMaskEnabled',
          'userMaskDensity',
          'userMaskFeather',
          'hasFilterMask',
          // 'filterMaskEnabled',
          'filterMaskDensity',
          'filterMaskFeather',
          'hasVectorMask',
          'vectorMaskEnabled',
          'vectorMaskDensity',
          'vectorMaskFeather',
          'bounds',
          'boundsNoEffects',
          'linkedLayerIDs',
          'fillOpacity',
        ],
        { _obj: 'layer', index: 1, count: -1 },
      ],
    },
    schema: z.object({
      list: z.array(
        layerDescriptorSchema.loose(),
      ),
    }),
  });
}
