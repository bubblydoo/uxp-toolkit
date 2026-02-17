import { app } from 'adobe:photoshop';
import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { executeAsModal } from '../core/executeAsModal';
import { getDocumentLayerDescriptors } from '../ut-tree/getDocumentLayerDescriptors';
import { createRenameLayerCommand } from './renameLayer';

async function getFirstLayer() {
  const allLayers = await getDocumentLayerDescriptors(app.activeDocument.id);
  return {
    ref: {
      id: allLayers[0]!.layerID,
      docId: app.activeDocument.id,
    },
    name: allLayers[0]!.name,
  };
}

describe('renameLayer', () => {
  it('should rename a layer', async (t) => {
    await openFixture(t, 'one-layer.psd');
    const layer = await getFirstLayer();
    expect(layer.name).toBe('Layer 1');
    await executeAsModal('Rename Layer', async (ctx) => {
      await ctx.batchPlayCommand(createRenameLayerCommand(layer.ref, 'New Name'));
    });
    const layer2 = await getFirstLayer();
    expect(layer2.name).toBe('New Name');
  });
});
