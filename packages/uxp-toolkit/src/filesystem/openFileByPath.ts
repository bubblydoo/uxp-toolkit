import { app } from 'photoshop';
import { storage } from 'uxp';
import { executeAsModal } from '../core/executeAsModal';
import { isFile } from './isFileOrFolder';

export async function openFileByPath(path: string) {
  const fs = storage.localFileSystem;
  const entry = await fs.getEntryWithUrl(path);
  if (!isFile(entry)) {
    throw new Error('Entry is not a file');
  }
  const doc = await executeAsModal('Open file', () => app.open(entry));
  return doc;
}
