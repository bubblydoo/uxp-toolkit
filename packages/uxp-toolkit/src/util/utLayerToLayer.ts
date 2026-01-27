import { Layer as DomLayer } from "photoshop/dom/Layer";
import { type UTLayer } from "@/ut-tree/photoshopLayerDescriptorsToTree";
import { app } from "photoshop";
import { getFlattenedDomLayersList } from "@/dom/getFlattenedDomLayersList";

export function utLayerToDomLayer(layer: UTLayer): DomLayer {
  const doc = app.documents.find((d) => d.id === layer.docId);
  if (!doc) {
    throw new Error(`Document with id ${layer.docId} not found.`);
  }
  const allLayers = getFlattenedDomLayersList(doc.layers);
  const domLayer = allLayers.find((l) => l.id === layer.id);
  if (!domLayer) {
    throw new Error(
      `Layer with id ${layer.id} not found in document ${layer.docId}.`
    );
  }
  return domLayer;
}

export function utLayersToDomLayers(layers: UTLayer[]): DomLayer[] {
  if (layers.length === 0) return [];
  const docId = layers[0]!.docId;
  if (!layers.every((l) => l.docId === docId)) {
    throw new Error("All layers must be from the same document.");
  }
  const doc = app.documents.find((d) => d.id === docId);
  if (!doc) {
    throw new Error(`Document with id ${docId} not found.`);
  }
  const allLayers = getFlattenedDomLayersList(doc.layers);
  return layers.map((l) => {
    const domLayer = allLayers.find((dl) => dl.id === l.id);
    if (!domLayer) {
      throw new Error(
        `Layer with id ${l.id} not found in document ${docId}.`
      );
    }
    return domLayer;
  });
}
