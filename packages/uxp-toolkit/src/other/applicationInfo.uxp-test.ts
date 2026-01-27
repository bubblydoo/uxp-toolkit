import { photoshopGetApplicationInfo } from "./applicationInfo";
import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";

export const applicationInfoTest: Test = {
  name: "Application Info",
  async run() {
    const info = await photoshopGetApplicationInfo();
    expect(info.hostName).to.include("Adobe Photoshop");
  },
}