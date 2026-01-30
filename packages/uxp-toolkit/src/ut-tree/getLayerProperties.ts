import { z } from "zod";
import { batchPlayCommand, batchPlayCommands, createCommand } from "../core/command";
import { createGetDocumentHasBackgroundLayerCommand } from "../commands-library/getDocument";
import { createGetBackgroundLayerCommand } from "../commands-library/getLayer";

export function createGetLayerPropertiesCommand(docId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: "multiGet",
      _target: { _ref: [{ _ref: "document", _id: docId }] },
      extendedReference: [
        ["name", "layerID", "visible", "group", "layerSection", "layerKind", "itemIndex", "background", "mode", "layerEffects"],
        { _obj: "layer", index: 1, count: -1 },
      ],
    },
    schema: z.object({
      list: z.array(
        z.object({
          name: z.string(),
          layerID: z.number(),
          visible: z.boolean(),
          group: z.boolean(),
          layerSection: z.object({
            _value: z.enum([
              "layerSectionStart",
              "layerSectionEnd",
              "layerSectionContent",
            ]),
            _enum: z.literal("layerSectionType"),
          }),
          layerKind: z.number(),
          itemIndex: z.number(),
          background: z.boolean(),
          mode: z.object({
            _enum: z.literal("blendMode"),
            _value: z.string(),
          }),
          layerEffects: z.record(z.string(), z.object({
            // "scale" does not have an "enabled" property, that's why it's optional
            enabled: z.boolean().optional(),
          }).or(z.array(z.object({
            enabled: z.boolean(),
          })))).optional(),
        })
      )
    })
  });
}

// get layer properties like name and layerID for all layers in the document (by index)
export const getDocumentLayerDescriptors = async (documentId: number) => {
  const [layersResult, documentHasBackgroundLayerResult] = await batchPlayCommands([
    createGetLayerPropertiesCommand(documentId),
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
};

export type LayerDescriptor = Awaited<ReturnType<typeof getDocumentLayerDescriptors>>[number];
