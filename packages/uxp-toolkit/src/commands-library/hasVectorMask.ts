import { z } from "zod";
import { createCommand } from "../core/command";

export function createHasVectorMaskCommand(layerId: number) {
  return createCommand({
    modifying: false,
    descriptor: {
      _obj: 'get',
      _target: [
        {
          _property: 'hasVectorMask',
        },
        {
          _ref: 'layer',
          _id: layerId,
        },
      ],
    },
    schema: z.object({
      hasVectorMask: z.boolean(),
    }),
  });
}
