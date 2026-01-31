import { describe, expectTypeOf, test } from 'vitest';

describe('UXP module types', () => {
  test('basic UXP types exist', () => {
    type UxpCommandEvent = import('./index').UxpCommandEvent;

    // Check that the type is not any
    expectTypeOf<UxpCommandEvent>().not.toBeAny();
    expectTypeOf<UxpCommandEvent>().toMatchTypeOf<Event>();
  });

  test('dialog namespace types', () => {
    const dialog = {} as typeof import('./index').dialog;

    expectTypeOf(dialog.showOpenDialog).toBeFunction();
    expectTypeOf(dialog.showSaveDialog).toBeFunction();
  });

  test('entrypoints namespace types', () => {
    const entrypoints = {} as typeof import('./index').entrypoints;

    expectTypeOf(entrypoints.setup).toBeFunction();
  });

  test('shell namespace types', () => {
    const shell = {} as typeof import('./index').shell;

    expectTypeOf(shell.openExternal).toBeFunction();
    expectTypeOf(shell.openPath).toBeFunction();
  });

  test('storage namespace types', () => {
    const storage = {} as typeof import('./index').storage;

    expectTypeOf(storage.localFileSystem).toBeObject();
  });

  test('os namespace types', () => {
    const os = {} as typeof import('./index').os;

    expectTypeOf(os.platform).toBeFunction();
    expectTypeOf(os.release).toBeFunction();
  });
});
