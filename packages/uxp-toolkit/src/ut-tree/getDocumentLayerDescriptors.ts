import { createGetDocumentHasBackgroundLayerCommand } from '../commands-library/getDocument';
import { createGetBackgroundLayerCommand } from '../commands-library/getLayer';
import { createMultiGetDocumentCommand } from '../commands-library/multiGetDocument';
import { batchPlayCommand, batchPlayCommands } from '../core/command';

// get layer properties like name and layerID for all layers in the document (by index)
export async function getDocumentLayerDescriptors(documentId: number) {
  const [layersResult, documentHasBackgroundLayerResult] = await batchPlayCommands([
    createMultiGetDocumentCommand(documentId),
    createGetDocumentHasBackgroundLayerCommand(documentId),
  ]);

  const backgroundLayerResult = documentHasBackgroundLayerResult.hasBackgroundLayer ? await batchPlayCommand(createGetBackgroundLayerCommand(documentId)) : null;

  const list = [...layersResult.list].reverse();
  if (backgroundLayerResult) {
    list.push(backgroundLayerResult);
  }

  // Reverse to get bottom-up order
  return list.map((layerProp) => {
    return {
      ...layerProp,
      docId: documentId,
    };
  });
}

export type LayerDescriptor = Awaited<ReturnType<typeof getDocumentLayerDescriptors>>[number];
