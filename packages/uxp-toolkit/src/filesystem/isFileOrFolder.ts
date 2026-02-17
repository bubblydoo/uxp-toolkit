import type { Entry, File, Folder } from 'adobe:uxp';

export function isFile(entry: Entry): entry is File {
  return entry.isFile === true;
}

export function isFolder(entry: Entry): entry is Folder {
  return entry.isFolder === true;
}
