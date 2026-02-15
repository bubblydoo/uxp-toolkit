import { z } from 'zod';
import { createCommand } from '../core/command';

export function createRenderGridCommand(gridPoints: number) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: '$3grd',
      $grdP: gridPoints,
    },
    schema: z.unknown(),
  });
}
