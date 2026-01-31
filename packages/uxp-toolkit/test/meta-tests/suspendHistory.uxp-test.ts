import type { Test } from '@bubblydoo/uxp-test-framework';
import { expect } from 'chai';
import { app } from 'photoshop';

export const suspendHistoryErrorTest: Test = {
  name: 'meta: suspendHistory should throw correctly',
  async run() {
    const document = app.activeDocument;
    if (!document) {
      throw new Error('No active document');
    }

    let threw = false;
    try {
      await document.suspendHistory(
        async (context) => {
          throw new Error('Uncaught error');
        },
        'Test',
      );
    }
    catch (_e) {
      threw = true;
    }
    // eslint-disable-next-line ts/no-unused-expressions
    expect(threw).to.be.true;
  },
};
