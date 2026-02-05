import type { Test } from '@bubblydoo/uxp-test-framework';
import { expect } from 'chai';
import { app } from 'photoshop';
import { executeAsModal } from '../core/executeAsModal';
import { openFileByPath } from '../filesystem/openFileByPath';
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

export const renameLayerTest: Test = {
  name: 'renameLayer',
  description: 'should rename a layer',
  run: async () => {
    await openFileByPath('plugin:/fixtures/one-layer.psd');
    const layer = await getFirstLayer();
    expect(layer.name).to.equal('Layer 1');
    await executeAsModal('Rename Layer', async (ctx) => {
      await ctx.batchPlayCommand(createRenameLayerCommand(layer.ref, 'New Name'));
    });
    const layer2 = await getFirstLayer();
    expect(layer2.name).to.equal('New Name');
  },
};
