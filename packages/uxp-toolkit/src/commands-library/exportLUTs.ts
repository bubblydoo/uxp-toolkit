import { z } from 'zod';
import { createCommand } from '../core/command';

export type LUTExportFormat = 'CUBE' | 'ICC' | '3DL' | 'CSP';

export interface ExportLUTsOptions {
  description?: string;
  gridPoints?: number;
  copyright?: string;
  exportFormats?: LUTExportFormat[];
  lowercaseExtension?: boolean;
}

export function createExportLUTsCommand(
  path: string,
  options: ExportLUTsOptions = {},
) {
  const {
    description = 'Exported LUT',
    gridPoints = 32,
    copyright = 'Copyright',
    exportFormats = ['CUBE', 'ICC', '3DL', 'CSP'] as LUTExportFormat[],
    lowercaseExtension = false,
  } = options;

  return createCommand({
    modifying: true,
    descriptor: {
      _obj: 'export',
      using: {
        _obj: '$lut ',
        $fpth: path,
        $dscr: description,
        $gPts: gridPoints,
        copyright,
        $wICC: exportFormats.includes('ICC'),
        $w3DL: exportFormats.includes('3DL'),
        $wCUB: exportFormats.includes('CUBE'),
        $wCSP: exportFormats.includes('CSP'),
        $lcFE: lowercaseExtension,
      },
    },
    schema: z.unknown(),
  });
}
