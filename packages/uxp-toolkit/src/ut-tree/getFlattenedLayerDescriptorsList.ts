import { getLayerProperties } from "./getLayerProperties";
import { z } from "zod";
import { batchPlayCommands, createCommand } from "../core/command";

// export interface LayerDescriptor {
//   name: string;
//   layerID: number;
//   layerSection?: string | { _value: string; _enum: string };
//   [key: string]: any;
// }

const layerDescriptorSchema = z.object({
  name: z.string(),
  // id: z.number(),
  layerID: z.number(),
  // _docId: z.number(),
  mode: z.object({
    _enum: z.literal("blendMode"),
    _value: z.string(), // passThrough, normal, multiply, screen, overlay, etc.
  }),
  background: z.boolean(),
  itemIndex: z.number(),
  visible: z.boolean(),
  opacity: z.number(),
  layerKind: z.number(),
  layerSection: z.object({
    _value: z.enum([
      "layerSectionStart",
      "layerSectionEnd",
      "layerSectionContent",
    ]),
    _enum: z.literal("layerSectionType"),
  }),
});

export type LayerDescriptor = z.infer<typeof layerDescriptorSchema> & {
  docId: number;
};

// get all layers (including nested in groups)
export const getFlattenedLayerDescriptorsList = async (
  documentId: number
) => {
  const layerProperties = await getLayerProperties(documentId);

  const commands = layerProperties.map((layerProp) =>
    createCommand({
      modifying: false,
      descriptor: {
        _obj: "get",
        _target: [
          {
            _ref: "layer",
            _id: layerProp.layerID,
          },
        ],
        makeVisible: false,
        layerID: [layerProp.layerID],
        _isCommand: false,
      },
      schema: layerDescriptorSchema,
    })
  );

  const layerDescriptors = await batchPlayCommands(commands);

  return layerDescriptors.map((desc) => {
    return {
      ...desc,
      docId: documentId,
    };
  });
};
