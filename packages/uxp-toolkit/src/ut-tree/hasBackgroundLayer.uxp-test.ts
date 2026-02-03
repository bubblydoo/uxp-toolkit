import { app } from 'photoshop';
import { describe, expect, it } from 'vitest';
import { createGetDocumentHasBackgroundLayerCommand } from '../commands-library/getDocument';
import { createGetBackgroundLayerCommand } from '../commands-library/getLayer';
import { batchPlayCommand } from '../core/command';
import { executeAsModal } from '../core/executeAsModal';
import { openFileByPath } from '../filesystem/openFileByPath';

describe('hasBackgroundLayer', () => {
  it('should detect background layer in document with background', async () => {
    const doc = await openFileByPath('plugin:/fixtures/one-layer-with-bg.psd');
    const hasBackgroundLayer = await batchPlayCommand(
      createGetDocumentHasBackgroundLayerCommand(doc.id),
    );
    expect(hasBackgroundLayer.hasBackgroundLayer).toBe(true);
    const layer = await batchPlayCommand(
      createGetBackgroundLayerCommand(app.activeDocument.id),
    );
    expect(layer.name).toBe('Background');
    await executeAsModal('Close Document', async () => await doc.close(0));
  });

  it('should not detect background layer in document without background', async () => {
    const doc2 = await openFileByPath('plugin:/fixtures/one-layer.psd');

    const hasBackgroundLayer2 = await batchPlayCommand(
      createGetDocumentHasBackgroundLayerCommand(doc2.id),
    );
    expect(hasBackgroundLayer2.hasBackgroundLayer).toBe(false);
    let rejected = false;
    try {
      await batchPlayCommand(
        createGetBackgroundLayerCommand(doc2.id),
      );
    }
    catch {
      rejected = true;
    }
    expect(rejected).toBe(true);

    await executeAsModal('Close Document', async () => await doc2.close(0));
  });
});
