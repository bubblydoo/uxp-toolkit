import { readFileSync } from 'node:fs';
import path from 'node:path';

export function getServerIcons(root: string): Array<{ src: string; mimeType: string }> {
  const iconPath = path.resolve(root, 'assets/photoshop-icon.svg');
  const mimeType = 'image/svg+xml';

  try {
    const iconBuffer = readFileSync(iconPath);
    const base64 = iconBuffer.toString('base64');
    return [{ src: `data:${mimeType};base64,${base64}`, mimeType }];
  }
  catch {
    console.error(`[photoshop-mcp] Failed to load icon at ${iconPath}. Continuing without icon.`);
    return [];
  }
}
