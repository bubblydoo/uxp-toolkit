import type { Document } from '@adobe-uxp-types/photoshop';
import type { TestContext } from 'vitest';
import { app, constants } from 'photoshop';
import { executeAsModal } from '../src/core/executeAsModal';
import { openFileByPath } from '../src/filesystem/openFileByPath';
import { resolveFixturePath } from './resolve-fixture';

function closeDocument(doc: Document) {
  return executeAsModal('Close document', async () => {
    await doc.close(constants.SaveOptions.DONOTSAVECHANGES);
  });
}

export async function openFixture(t: TestContext, fixture: string) {
  const fixturePath = resolveFixturePath(fixture);
  const openDoc = app.documents.find(doc => doc.path === fixturePath);
  if (openDoc) {
    await closeDocument(openDoc);
  }
  const doc = await openFileByPath(`file:${resolveFixturePath(fixture)}`);
  t.onTestFinished(() => closeDocument(doc));
  return doc;
}
