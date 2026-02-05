import { app } from 'photoshop';
import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { createGetDocumentHasBackgroundLayerCommand } from '../commands-library/getDocument';
import { createGetBackgroundLayerCommand } from '../commands-library/getLayer';
import { batchPlayCommand } from '../core/command';

describe('hasBackgroundLayer', () => {
  it('should detect background layer in document with background', async (t) => {
    const doc = await openFixture(t, 'one-layer-with-bg.psd');
    const hasBackgroundLayer = await batchPlayCommand(
      createGetDocumentHasBackgroundLayerCommand(doc.id),
    );
    expect(hasBackgroundLayer.hasBackgroundLayer).toBe(true);
    const layer = await batchPlayCommand(
      createGetBackgroundLayerCommand(app.activeDocument.id),
    );
    expect(layer.name).toBe('Background');
  });

  it('should not detect background layer in document without background', async (t) => {
    const doc2 = await openFixture(t, 'one-layer.psd');

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
  });
});
