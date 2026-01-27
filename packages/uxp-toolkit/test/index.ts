// export default from "@/other/applicationInfo.uxp-test";

import { applicationInfoTest as applicationInfoTest } from "@/other/applicationInfo.uxp-test";
import { renameLayerTest as renameLayerTest } from "@/commands-library/renameLayer.uxp-test";

export const tests = [
  applicationInfoTest,
  renameLayerTest,
];
