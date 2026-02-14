import z from 'zod';
import { createCommand } from '../core/command';

export function createGetDocumentCommand(documentId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: { _ref: [{ _ref: 'document', _id: documentId }] },
    },
    schema: z.object({
      title: z.string(),
      documentID: z.number(),
      visible: z.boolean(),
      hasBackgroundLayer: z.boolean(),
      /** Selected layer ids */
      targetLayersIDs: z.array(z.object({
        _ref: z.literal('layer'),
        _id: z.number(),
      })),
      quickMask: z.boolean(),
    }),
  });
}

export function createGetDocumentHasBackgroundLayerCommand(documentId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: {
        _ref: [
          { _property: 'hasBackgroundLayer' },
          { _ref: 'document', _id: documentId },
        ],
      },
    },
    schema: z.object({
      hasBackgroundLayer: z.boolean(),
    }),
  });
}
