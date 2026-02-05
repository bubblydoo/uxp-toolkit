import { app, constants } from 'photoshop';
import { executeAsModal } from '../src/core/executeAsModal';
import { openFileByPath } from '../src/filesystem/openFileByPath';
import { resolveFixturePath } from './resolve-fixture';

export async function openFixture(fixture: string) {
  const fixturePath = resolveFixturePath(fixture);
  const openDoc = app.documents.find(doc => doc.path === fixturePath);
  if (openDoc) {
    await executeAsModal('Close document', async () => {
      await openDoc.close(constants.SaveOptions.DONOTSAVECHANGES);
    });
  }
  return openFileByPath(`file:${resolveFixturePath(fixture)}`);
}
