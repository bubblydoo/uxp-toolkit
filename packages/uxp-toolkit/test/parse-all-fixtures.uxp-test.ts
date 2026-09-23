import { app } from 'adobe:photoshop';
import { describe, it } from 'vitest';
import { getDocumentLayerDescriptors } from '../src/ut-tree/getDocumentLayerDescriptors';
import { openFixture } from './open-fixture';

const fixtures = [
  'all-adjustment-layers-empty.psd',
  'all-adjustment-layers.psd',
  'all-color-schemas-cmyk.psd',
  'all-color-schemas-gray.psd',
  'all-color-schemas-lab.psd',
  'all-color-schemas-rgb.psd',
  'skin-colors.psd',
];

describe('parse all fixtures', () => {
  for (const fixture of fixtures) {
    it(`should parse ${fixture}`, async (t) => {
      await openFixture(t, fixture);
      await getDocumentLayerDescriptors(app.activeDocument.id);
    });
  }
});
