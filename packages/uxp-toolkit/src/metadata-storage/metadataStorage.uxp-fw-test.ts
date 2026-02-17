import type { Test } from '@bubblydoo/uxp-test-framework';
import { app } from 'adobe:photoshop';
import { expect } from 'chai';
import { openFileByPath } from '../filesystem/openFileByPath';
import {
  readDocumentMetadata,
  writeDocumentMetadata,
} from './metadataStorage';

const TEST_PREFIX = 'bubblytest';
const TEST_PREFIX_NAMESPACE = 'https://example.com/bubbly-test';
const TEST_KEY = 'testKey';
const TEST_VALUE = 'test-value-written-by-uxp-fw-test';

export const metadataStorageTest: Test = {
  name: 'metadataStorage',
  description: 'should write and read document metadata',
  run: async () => {
    await openFileByPath('plugin:/fixtures/one-layer.psd');
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

    expect(readBack).to.equal(TEST_VALUE);
  },
};
