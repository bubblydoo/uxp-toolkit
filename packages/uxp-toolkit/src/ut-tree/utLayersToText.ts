import type { UTLayerPickKeys } from '../util/utLayerPickKeysType';
import type { UTLayer } from './photoshopLayerDescriptorsToUTLayers';

const VISIBLE_ICON = '◯';
const INVISIBLE_ICON = '⊘';
const CLIPPING_MASK_ICON = '⬐';
const GROUP_ICON = '▾';
const EFFECTS_ICON = 'ƒ';
const BLEND_ICON = '⁕';

type MinimalUTLayer = UTLayerPickKeys<'effects' | 'visible' | 'isClippingMask' | 'kind' | 'blendMode' | 'name'>;

export function utLayersToText(tree: MinimalUTLayer[], depth = 0): string {
  return tree.map((layer) => {
    const prefix = ' '.repeat(depth * 2);
    const name = layer.name;
    const effects = Object.keys(layer.effects).length > 0 ? EFFECTS_ICON : '';
    const blend = isSpecialBlendMode(layer) ? BLEND_ICON : '';
    const clippingMask = layer.isClippingMask ? CLIPPING_MASK_ICON : '';
    const group = layer.kind === 'group' ? GROUP_ICON : '';
    const visible = layer.visible ? VISIBLE_ICON : INVISIBLE_ICON;
    const line = [visible, prefix, clippingMask, group, name, effects, blend].filter(Boolean).join(' ');
    if (layer.layers) {
      return `${line}\n${utLayersToText(layer.layers, depth + 1)}`;
    }
    return line;
  }).join('\n');
}

function isSpecialBlendMode(layer: Pick<UTLayer, 'kind' | 'blendMode'>): boolean {
  return layer.kind === 'group' ? layer.blendMode !== 'passThrough' : layer.blendMode !== 'normal';
}
