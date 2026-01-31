import { z } from 'zod';
import { createCommand } from '../core/command';

export function createConvertModeCommand(depth: 8 | 16) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'convertMode',
      depth,
    },
    schema: z.unknown(),
  });
}
