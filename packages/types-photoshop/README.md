# @adobe-uxp-types/photoshop

![NPM Version](https://img.shields.io/npm/v/@adobe-uxp-types/photoshop)

Type definitions for Adobe Photoshop UXP API. (`photoshop` module)

Based on previous art by Justin Walsh, Simon Henke and Justin Taylor.

## Usage

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["@adobe-uxp-types/photoshop"]
  }
}
```
```ts
import { app } from 'photoshop';
```

### With `adobe:` protocol

Note: you will need to configure your bundler to strip the protocol.

```json
{
  "compilerOptions": {
    "types": ["@adobe-uxp-types/photoshop/with-protocol"]
  }
}
```
```ts
import { app } from 'adobe:photoshop';
```
