import('./internal/all-types');
import('./internal/dom/Constants');
import('./internal/dom/CoreModules');
import('./internal/dom/ImagingModule');
import('./internal/dom/Photoshop');

declare module 'photoshop' {
  import { constants } from './internal/dom/Constants';
  import { action, core } from './internal/dom/CoreModules';
  import { imaging } from './internal/dom/ImagingModule';
  import { app } from './internal/dom/Photoshop';

  export type * from './internal/all-types';
  export { action, app, constants, core, imaging };

  const _default: {
    app: typeof app;
    core: typeof core;
    action: typeof action;
    constants: typeof constants;
    imaging: typeof imaging;
  };
  export default _default;
}
