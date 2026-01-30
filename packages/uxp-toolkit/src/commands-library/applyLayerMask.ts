import { z } from "zod";
import { createCommand } from "../core/command";

export function createSelectLayerMaskCommand(layerId: number) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'select',
      _target: [
        {
          _ref: 'channel',
          _enum: 'channel',
          _value: 'mask',
        },
        {
          _ref: 'layer',
          _id: layerId,
        },
      ],
      makeVisible: false,
    },
    schema: z.unknown(),
  });
}

export function createDeleteChannelAndApplyCommand() {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'delete',
      _target: [
        {
          _ref: 'channel',
          _enum: 'ordinal',
          _value: 'targetEnum',
        },
      ],
      apply: true,
    },
    schema: z.unknown(),
  });
}
