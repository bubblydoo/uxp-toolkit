import type z from 'zod';
import type { adjustmentSchema } from '../commands-library';
import type { LayerDescriptor } from './getDocumentLayerDescriptors';

// todo: this is probably not complete, and the map neither
type UTLayerKind = 'pixel' | 'adjustmentLayer' | 'text' | 'curves' | 'smartObject' | 'video' | 'group' | 'threeD' | 'gradientFill' | 'pattern' | 'solidColor' | 'background';

type UTBlendMode = 'normal' | 'dissolve' | 'darken' | 'multiply' | 'colorBurn' | 'linearBurn' | 'darkerColor' | 'lighten' | 'screen' | 'colorDodge' | 'linearDodge' | 'lighterColor' | 'overlay' | 'softLight' | 'hardLight' | 'vividLight' | 'linearLight' | 'pinLight' | 'hardMix' | 'difference' | 'exclusion' | 'blendSubtraction' | 'blendDivide' | 'hue' | 'saturation' | 'color' | 'luminosity' | 'passThrough';

type UTAdjustmentRaw = z.infer<typeof adjustmentSchema>;

interface UTAdjustment<T extends UTAdjustmentRaw['_obj'] = UTAdjustmentRaw['_obj']> {
  type: T;
  raw: Extract<UTAdjustmentRaw, { _obj: T }>;
}

interface UTLayerMask {
  enabled: boolean;
  density: number;
  feather: number;
};

interface UTLayerLock {
  transparency: boolean;
  composite: boolean;
  position: boolean;
  artboardAutonest: boolean;
  all: boolean;
}

interface UTLayerBuilder {
  name: string;
  docId: number;
  id: number;
  visible: boolean;
  kind: UTLayerKind;
  blendMode: UTBlendMode;
  effects: Record<string, boolean>;
  isClippingMask: boolean;
  background: boolean;
  adjustment?: UTAdjustment;
  linkedLayerIds?: number[];
  opacity?: number;
  fillOpacity?: number;
  /** Also called `userMask` */
  rasterMask?: UTLayerMask;
  filterMask?: UTLayerMask;
  vectorMask?: UTLayerMask;
  lock?: UTLayerLock;

  layers?: UTLayerBuilder[];
}

export type UTLayer = Readonly<Omit<UTLayerBuilder, 'layers'>> & {
  layers?: UTLayer[];
};

export type UTLayerMultiGetOnly = Omit<UTLayer, 'effects'>;

const layerKindMap = new Map<number, UTLayerKind>([
  [1, 'pixel'],
  [2, 'adjustmentLayer'], // All adjustment layers, but not curves, gradientFill, pattern and solidColor
  [3, 'text'],
  [4, 'curves'],
  [5, 'smartObject'],
  [6, 'video'],
  [7, 'group'],
  [8, 'threeD'],
  [9, 'gradientFill'],
  [10, 'pattern'],
  [11, 'solidColor'],
  [12, 'background'], // according to the internet but the actual value is undefined
]);

const blendModes: string[] = [
  'normal',
  'dissolve',
  'darken',
  'multiply',
  'colorBurn',
  'linearBurn',
  'darkerColor',
  'lighten',
  'screen',
  'colorDodge',
  'linearDodge',
  'lighterColor',
  'overlay',
  'softLight',
  'hardLight',
  'vividLight',
  'linearLight',
  'pinLight',
  'hardMix',
  'difference',
  'exclusion',
  'blendSubtraction',
  'blendDivide',
  'hue',
  'saturation',
  'color',
  'luminosity',
  'passThrough',
] satisfies UTBlendMode[];

function getLayerKind(layer: LayerDescriptor): UTLayerKind {
  const kind = layerKindMap.get(layer.layerKind);
  if (!kind) {
    throw new Error(`Unknown layer kind: ${layer.layerKind}`);
  }
  return kind;
}

function getBlendMode(layer: LayerDescriptor): UTBlendMode {
  const mode = layer.mode._value;
  if (!blendModes.includes(mode)) {
    throw new Error(`Unknown blend mode: ${mode}`);
  }
  return mode as UTBlendMode;
}

export function photoshopLayerDescriptorsToUTLayers(layers: LayerDescriptor[]): UTLayer[] {
  const root: UTLayerBuilder[] = [];
  const stack: {
    layers: UTLayerBuilder[];
  }[] = [{ layers: root }];

  for (const layer of layers) {
    // Determine if the layer is a group start or end
    const sectionType = determineLayerSection(layer);

    // Handle group end
    if (sectionType === 'end') {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    // Create the node
    const node = buildLayerFromDescriptor(layer);

    // Add the node to the current level
    const current = stack[stack.length - 1];
    current!.layers.push(node);

    // Handle group start
    if (sectionType === 'start') {
      node.layers = [];
      // Push children array to stack to process content
      stack.push({ layers: node.layers });
    }
  }

  // Cast to the readonly Tree type
  return root as UTLayer[];
};

function determineLayerSection(layer: LayerDescriptor): 'start' | 'end' | 'normal' {
  const section = layer.layerSection._value;
  const isGroupEnd
    = layer.name === '</Layer group>'
      || layer.name === '</Layer set>'
      || section === 'layerSectionEnd';

  const isGroupStart = section === 'layerSectionStart';
  return isGroupStart ? 'start' : isGroupEnd ? 'end' : 'normal';
}

function getEffects(layer: LayerDescriptor): Record<string, boolean> {
  const effects: Record<string, boolean> = {};
  if (layer.layerEffects) {
    for (const effect in layer.layerEffects) {
      effects[effect] = Array.isArray(layer.layerEffects[effect]) ? layer.layerEffects[effect].some(e => e.enabled) : !!layer.layerEffects[effect]?.enabled;
    }
  }
  return effects;
}

function getAdjustment(layer: LayerDescriptor): UTAdjustment | undefined {
  const adjustment = layer.adjustment?.[0];
  if (!adjustment) {
    return undefined;
  }
  return {
    type: adjustment._obj,
    raw: adjustment,
  };
}

function buildLayerFromDescriptor(layer: LayerDescriptor): UTLayerBuilder {
  return {
    name: layer.name,
    docId: layer.docId,
    id: layer.layerID,
    visible: layer.visible,
    kind: getLayerKind(layer),
    blendMode: getBlendMode(layer),
    isClippingMask: layer.group,
    effects: getEffects(layer),
    background: layer.background,
    adjustment: getAdjustment(layer),
    linkedLayerIds: layer.linkedLayerIDs,
    opacity: layer.opacity,
    fillOpacity: layer.fillOpacity,
    rasterMask: layer.hasUserMask
      ? {
          enabled: layer.userMaskEnabled!,
          density: layer.userMaskDensity!,
          feather: layer.userMaskFeather!,
        }
      : undefined,
    filterMask: layer.hasFilterMask
      ? {
          enabled: true,
          density: layer.filterMaskDensity!,
          feather: layer.filterMaskFeather!,
        }
      : undefined,
    vectorMask: layer.hasVectorMask
      ? {
          enabled: layer.vectorMaskEnabled!,
          density: layer.vectorMaskDensity!,
          feather: layer.vectorMaskFeather!,
        }
      : undefined,
    lock: Object.values(layer.layerLocking ?? {}).filter(v => v === true).length > 0
      ? {
          transparency: layer.layerLocking!.protectTransparency,
          composite: layer.layerLocking!.protectComposite,
          position: layer.layerLocking!.protectPosition,
          artboardAutonest: layer.layerLocking!.protectArtboardAutonest,
          all: layer.layerLocking!.protectAll,
        }
      : undefined,
  };
}
