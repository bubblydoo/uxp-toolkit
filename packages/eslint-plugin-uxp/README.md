# @bubblydoo/eslint-plugin-uxp

Custom ESLint plugin for UXP development with Photoshop.

## Installation

```bash
pnpm add -D @bubblydoo/eslint-plugin-uxp
```

## Usage

### ESLint Flat Config (ESLint 9+)

```js
import uxpPlugin from '@bubblydoo/eslint-plugin-uxp';

export default [
  {
    plugins: {
      uxp: uxpPlugin,
    },
    rules: {
      'uxp/no-constants-import': 'error',
    },
  },
  // Or use the recommended config
  uxpPlugin.configs.recommended,
];
```

### Legacy ESLint Config

```json
{
  "plugins": ["@bubblydoo/uxp"],
  "rules": {
    "@bubblydoo/uxp/no-constants-import": "error"
  }
}
```

## Rules

### `no-constants-import`

Disallows importing from `"photoshop/dom/Constants"`.

**❌ Incorrect:**

```js
import { BlendMode } from 'photoshop/dom/Constants';
```

```js
const { BlendMode } = require('photoshop/dom/Constants');
```

**✅ Correct:**

```js
import { constants } from 'photoshop';
const { BlendMode } = constants;
```

```js
const { constants } = require('photoshop');
const { BlendMode } = constants;
```

## License

MIT
