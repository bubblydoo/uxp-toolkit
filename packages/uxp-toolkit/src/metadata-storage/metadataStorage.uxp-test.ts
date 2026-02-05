import { app } from 'photoshop';
import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import {
  readDocumentMetadata,
  writeDocumentMetadata,
} from './metadataStorage';

const TEST_PREFIX = 'bubblytest';
const TEST_PREFIX_NAMESPACE = 'https://example.com/bubbly-test';
const TEST_KEY = 'testKey';
const TEST_VALUE = 'test-value-written-by-uxp-test';

describe('metadataStorage', () => {
  it('should write and read document metadata', async () => {
    await openFixture('one-layer.psd');
    const document = app.activeDocument!;

    await writeDocumentMetadata(document, {
      key: TEST_KEY,
      value: TEST_VALUE,
      prefix: TEST_PREFIX,
      prefixNamespace: TEST_PREFIX_NAMESPACE,
    });

    const readBack = await readDocumentMetadata(document, {
      key: TEST_KEY,
      prefix: TEST_PREFIX,
    });

    expect(readBack).toBe(TEST_VALUE);
  });
});
