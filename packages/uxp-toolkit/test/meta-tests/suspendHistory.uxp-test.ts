import { app } from "photoshop";
import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";

export const suspendHistoryErrorTest: Test = {
  name: "meta: suspendHistory should throw correctly",
  async run() {
    const document = app.activeDocument;
    if (!document) {
      throw new Error("No active document");
    }

    let threw = false;
    try {
      await document.suspendHistory(
        async (context) => {
          throw new Error("Uncaught error");
        },
        "Test"
      );
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be.true;
  },
};

