import { openFileByPath } from '../src/filesystem/openFileByPath';
import { resolveFixturePath } from './resolve-fixture';

export async function openFixture(fixture: string) {
  return openFileByPath(`file:${resolveFixturePath(fixture)}`);
}
