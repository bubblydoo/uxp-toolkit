# @adobe-uxp-types/uxp

![NPM Version](https://img.shields.io/npm/v/@adobe-uxp-types/uxp)

Type definitions for Adobe UXP API (`uxp`, `fs`, `os`, `path`, `process`, `shell` modules).

Based on previous art by Justin Walsh, Simon Henke and Justin Taylor.

## Usage

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["@adobe-uxp-types/uxp"]
  }
}
```
```ts
import { app } from 'uxp';
```

### With `adobe:` protocol

Note: you will need to configure your bundler to strip the protocol.

```json
{
  "compilerOptions": {
    "types": ["@adobe-uxp-types/uxp/with-protocol"]
  }
}
```
```ts
import { app } from 'adobe:uxp';
import { fs } from 'adobe:fs';
import { os } from 'adobe:os';
import { path } from 'adobe:path';
import { process } from 'adobe:process';
```
