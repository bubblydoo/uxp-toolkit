import { action, app, constants, core, imaging, SaveOptions } from 'adobe:photoshop';

import { describe, expectTypeOf, test } from 'vitest';

describe('Photoshop module declarations', () => {
  test('type exports exist', () => {
    type Document = import('photoshop').Document;
    type Layer = import('photoshop').Layer;
    type ActionDescriptor = import('photoshop').ActionDescriptor;
  });
});

describe('constants enums and types are correctly exported', () => {
  // @ts-expect-error SaveOptions is only a type, not a value
  SaveOptions;
  expectTypeOf(constants.SaveOptions.DONOTSAVECHANGES).toBeNumber();
});
