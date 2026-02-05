import { renameLayerTest } from '../src/commands-library/renameLayer.uxp-fw-test';
import { sourcemapsTest } from '../src/error-sourcemaps/sourcemaps.uxp-fw-test';
import { metadataStorageTest } from '../src/metadata-storage/metadataStorage.uxp-fw-test';
import { builtinModulesTest } from './meta-tests/builtinModules.uxp-fw-test';

export const tests = [
  renameLayerTest,
  sourcemapsTest,
  metadataStorageTest,
  builtinModulesTest,
];
