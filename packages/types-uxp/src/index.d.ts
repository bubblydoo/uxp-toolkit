import { dialog } from './internal/dialog';
import { entrypoints } from './internal/entrypoints';
import { host } from './internal/host';
import { os } from './internal/os';
import { shell } from './internal/shell';
import { storage } from './internal/storage';
import { versions } from './internal/versions';

export type * from './internal/all-types';
export { dialog, entrypoints, host, os, shell, storage, versions };

const _default: {
  dialog: typeof dialog;
  entrypoints: typeof entrypoints;
  host: typeof host;
  os: typeof os;
  shell: typeof shell;
  storage: typeof storage;
  versions: typeof versions;
};
export default _default;
