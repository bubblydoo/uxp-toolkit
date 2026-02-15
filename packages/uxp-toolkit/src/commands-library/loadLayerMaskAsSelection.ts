import { z } from 'zod';
import { createCommand } from '../core/command';

export function createLoadLayerMaskAsSelectionCommand(layerId: number) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'set',
      _target: [
        {
          _ref: 'channel',
          _property: 'selection',
        },
      ],
      to: {
        _ref: [
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
      },
    },
    schema: z.unknown(),
  });
}
