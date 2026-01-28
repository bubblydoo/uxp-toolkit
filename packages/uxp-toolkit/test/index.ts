import { applicationInfoTest } from "../src/other/applicationInfo.uxp-test";
import { renameLayerTest } from "../src/commands-library/renameLayer.uxp-test";
import { suspendHistoryErrorTest } from "./meta-tests/suspendHistory.uxp-test";
import { executeAsModalErrorTest } from "./meta-tests/executeAsModal.uxp-test";
import { suspendHistoryTest } from "../src/core/suspendHistory.uxp-test";
import { sourcemapsTest } from "../src/error-sourcemaps/sourcemaps.uxp-test";
import { clipboardTest } from "../src/other/clipboard.uxp-test";
import { photoshopLayerDescriptorsToUTLayersTest } from "../src/ut-tree/photoshopLayerDescriptorsToUTLayers.uxp-test";
import { metadataStorageTest } from "../src/metadata-storage/metadataStorage.uxp-test";
import { builtinModulesTest } from "./meta-tests/builtinModules.uxp-test";

export const tests = [
  applicationInfoTest,
  renameLayerTest,
  suspendHistoryErrorTest,
  executeAsModalErrorTest,
  suspendHistoryTest,
  sourcemapsTest,
  clipboardTest,
  photoshopLayerDescriptorsToUTLayersTest,
  metadataStorageTest,
  builtinModulesTest,
];
