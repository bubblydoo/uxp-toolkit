import { describe, expectTypeOf, test } from 'vitest';

import { action, app, constants, core, imaging, SaveOptions } from './index';

describe('Photoshop module declarations', () => {
  test('type exports exist', () => {
    type Document = import('./index').Document;
    type Layer = import('./index').Layer;
    type ActionDescriptor = import('./index').ActionDescriptor;
  });
});

describe('constants enums and types are correctly exported', () => {
  // @ts-expect-error SaveOptions is only a type, not a value
  SaveOptions;
  expectTypeOf(constants.SaveOptions.DONOTSAVECHANGES).toBeNumber();
});
