import type { Test } from "@bubblydoo/uxp-test-framework";
import { expect } from "chai";

export const builtinModulesTest: Test = {
  name: "meta: some builtin modules should be available",
  async run() {
    const testModules = [
      "photoshop",
      "uxp",
      "fs",
      "os",
      "path",
      "process",
      "shell",
      "http",
      "https",
      "url",
      "util",
      "crypto",
      "stream",
      "zlib",
    ];
    const successModules = testModules.filter(module => doesImportExist(module));
    expect(successModules).to.deep.eq([
      "photoshop",
      "uxp",
      "fs",
      "os",
      "path",
      "process",
    ]); 
  },
};

function doesImportExist(module: string) {
  try {
    require(module);
    return true;
  } catch {
    return false;
  }
}