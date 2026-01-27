import { core } from "photoshop";
import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";

export const executeAsModalErrorTest: Test = {
  name: "meta: executeAsModal should throw correctly",
  async run() {
    let threw = false;
    try {
      await core.executeAsModal(
        async () => {
          throw new Error("Uncaught error");
        },
        {
          commandName: "Test",
        }
      );
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be.true;
  },
};

export const executeAsModalReturnTest: Test = {
  name: "meta: executeAsModal should return correctly",
  async run() {
    const result = await core.executeAsModal(
      async () => {
        return 'test'
      },
      {
        commandName: "Test",
      }
    );
    expect(result).to.equal('test');
  },
};
