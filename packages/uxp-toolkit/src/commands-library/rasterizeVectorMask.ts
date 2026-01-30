import { z } from "zod";
import { createCommand } from "../core/command";

export function createRasterizeVectorMaskCommand() {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'rasterizeLayer',
      _target: [
        {
          _ref: 'layer',
          _enum: 'ordinal',
          _value: 'targetEnum',
        },
      ],
      what: {
        _enum: 'rasterizeItem',
        _value: 'vectorMask',
      },
    },
    schema: z.unknown(),
  });
}
