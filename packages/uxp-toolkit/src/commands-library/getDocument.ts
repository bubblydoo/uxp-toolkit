import z from "zod";
import { createCommand } from "../core/command";

export function createGetDocumentCommand(documentId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: "get",
      _target: { _ref: [{ _ref: "document", _id: documentId }] },
    },
    schema: z.object({
      title: z.string(),
      documentID: z.number(),
      visible: z.boolean(),
      hasBackgroundLayer: z.boolean(),
    }),
  });
}

export function createGetDocumentHasBackgroundLayerCommand(documentId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: "get",
      _target: {
        _ref: [
          { _property: "hasBackgroundLayer" },
          { _ref: "document", _id: documentId },
        ],
      },
    },
    schema: z.object({
      hasBackgroundLayer: z.boolean(),
    }),
  });
}
