import('./index');

declare module 'adobe:fs' {
  export * from 'node:fs';
}
declare module 'adobe:os' {
  export * from 'node:os';
}
declare module 'adobe:path' {
  // eslint-disable-next-line ts/no-require-imports
  import path = require('node:path');

  export = path;
}
declare module 'adobe:process' {
  export * from 'node:process';
}
declare module 'adobe:uxp' {
  export * from 'uxp';
  const _default: typeof import('uxp').default;
  export default _default;
}
