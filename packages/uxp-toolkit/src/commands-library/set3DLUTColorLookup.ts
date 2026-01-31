import { z } from 'zod';
import { createCommand } from '../core/command';

export type LUTFormatType = 'LUTFormatCUBE' | 'LUTFormat3DL' | 'LUTFormatCSP';

export interface Set3DLUTColorLookupOptions {
  lutPath: string;
  lutFormat?: LUTFormatType;
  profileBase64?: string;
  lutFileDataBase64?: string;
}

export function createSet3DLUTColorLookupCommand(options: Set3DLUTColorLookupOptions) {
  const {
    lutPath,
    lutFormat = 'LUTFormatCUBE',
    profileBase64,
    lutFileDataBase64,
  } = options;

  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'set',
      _target: [
        {
          _enum: 'ordinal',
          _ref: 'adjustmentLayer',
          _value: 'targetEnum',
        },
      ],
      to: {
        _obj: 'colorLookup',
        lookupType: {
          _enum: 'colorLookupType',
          _value: '3DLUT',
        },
        name: lutPath,
        LUTFormat: {
          _enum: 'LUTFormatType',
          _value: lutFormat,
        },
        ...(profileBase64 && {
          profile: {
            _data: profileBase64,
            _rawData: 'base64',
          },
        }),
        ...(lutFileDataBase64 && {
          LUT3DFileData: {
            _data: lutFileDataBase64,
            _rawData: 'base64',
          },
        }),
        LUT3DFileName: lutPath,
      },
      _isCommand: true,
    },
    schema: z.unknown(),
  });
}
