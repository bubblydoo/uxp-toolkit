#!/usr/bin/env node

import { runCli } from '@bubblydoo/uxp-test-framework-plugin/cli';

runCli(process.argv.slice(2), process.cwd());
