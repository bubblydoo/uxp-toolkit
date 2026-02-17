import('./internal/dialog');
import('./internal/entrypoints');
import('./internal/host');
import('./internal/os');
import('./internal/shell');
import('./internal/storage');
import('./internal/versions');
import('./internal/all-types');

declare module 'uxp' {
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
}
