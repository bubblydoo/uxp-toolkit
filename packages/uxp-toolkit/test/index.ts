import { applicationInfoTest } from "@/other/applicationInfo.uxp-test";
import { renameLayerTest } from "@/commands-library/renameLayer.uxp-test";
import { suspendHistoryErrorTest } from "./meta-tests/suspendHistory.uxp-test";
import { executeAsModalErrorTest } from "./meta-tests/executeAsModal.uxp-test";
import { suspendHistoryTest } from "@/core/suspendHistory.uxp-test";
import { sourcemapsTest } from "@/error-sourcemaps/sourcemaps.uxp-test";
import { clipboardTest } from "@/other/clipboard.uxp-test";

export const tests = [
  applicationInfoTest,
  renameLayerTest,
  suspendHistoryErrorTest,
  executeAsModalErrorTest,
  suspendHistoryTest,
  sourcemapsTest,
  clipboardTest,
];
