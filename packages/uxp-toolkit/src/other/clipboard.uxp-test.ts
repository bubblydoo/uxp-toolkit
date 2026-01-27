import type { Test } from "@bubblydoo/uxp-test-framework";
import { copyToClipboard, readFromClipboard } from "./clipboard";
import { expect } from "chai";

export const clipboardTest: Test = {
  name: "should copy and read from clipboard",
  async run() {
    const originalClipboard = await readFromClipboard();
    try {
      await copyToClipboard("test");
      const clipboard = await readFromClipboard();
      expect(clipboard).to.eq("test");
    } finally {
      await copyToClipboard(originalClipboard);
    }
  },
};