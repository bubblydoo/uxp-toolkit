import { z } from "zod";
import { createCommand } from "../core/command";

export function createDeleteChannelCommand() {
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
    },
    schema: z.unknown(),
  });
}
