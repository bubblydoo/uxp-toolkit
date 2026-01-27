import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";
import { suspendHistory } from "./suspendHistory";
import { app } from "photoshop";

export const suspendHistoryTest: Test = {
  name: "core/suspendHistory should return correctly",
  async run() {
    const document = app.activeDocument;
    if (!document) {
      throw new Error("No active document");
    }
    const result = await suspendHistory(document, "Test", async (context) => {
      return 'test';
    });
    expect(result).to.equal('test');
  },
};