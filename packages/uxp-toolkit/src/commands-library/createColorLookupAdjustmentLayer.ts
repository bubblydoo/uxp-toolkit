import { z } from 'zod';
import { createCommand } from '../core/command';

export function createColorLookupAdjustmentLayerCommand() {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'make',
      _target: [
        {
          _ref: 'adjustmentLayer',
        },
      ],
      using: {
        _obj: 'adjustmentLayer',
        type: {
          _class: 'colorLookup',
        },
      },
      _isCommand: true,
    },
    schema: z.unknown(),
  });
}
