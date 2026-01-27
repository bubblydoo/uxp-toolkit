import type { Test } from "@bubblydoo/uxp-test-framework";
import { parseUxpErrorSourcemaps } from "./sourcemaps";
import { expect } from "chai";

function throwError() {
  throw new Error("Uncaught error"); // this error should stay exactly here in the source code, see below
}

export const sourcemapsTest: Test = {
  name: "sourcemaps: should parse error sourcemaps",
  async run() {
    let error: Error;
    try {
      throwError();
    } catch (e) {
      error = e as Error;
    }
    const parsedError = await parseUxpErrorSourcemaps(error!);
    console.log(parsedError);
    expect(parsedError[0]!.fileName).to.include("sourcemaps.uxp-test.ts");
    expect(parsedError[0]!.lineNumber).to.eq(6);
    expect(parsedError[0]!.columnNumber).to.eq(8);
  },
};