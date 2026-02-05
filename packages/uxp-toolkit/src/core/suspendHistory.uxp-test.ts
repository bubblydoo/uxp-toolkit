import { constants } from 'photoshop';
import { describe, expect, it } from 'vitest';
import { openFixture } from '../../test/open-fixture';
import { executeAsModal } from './executeAsModal';
import { suspendHistory } from './suspendHistory';

describe('core/suspendHistory', () => {
  it('should return correctly', async (t) => {
    const doc = await openFixture('one-layer.psd'); // some document needs to be open
    t.onTestFinished(() => executeAsModal('Close document', async () => {
      doc.close(constants.SaveOptions.DONOTSAVECHANGES);
    }));
    const result = await suspendHistory(doc, 'Test', async () => {
      return 'test';
    });
    expect(result).toBe('test');
  });
});
