# @bubblydoo/eslint-plugin-uxp

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/eslint-plugin-uxp)

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
      'uxp/no-unsupported-css': 'error',
      'uxp/no-unsupported-css-tailwind': 'error',
      'uxp/prefer-adobe-protocol': 'error',
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
    "@bubblydoo/uxp/no-unsupported-css": "error",
    "@bubblydoo/uxp/no-unsupported-css-tailwind": "error",
    "@bubblydoo/uxp/prefer-adobe-protocol": "error"
  }
}
```

## Rules

### `prefer-adobe-protocol`

Requires `adobe:` protocol for Adobe UXP native module specifiers.

**❌ Incorrect:**

```js
import { app } from 'uxp';
```

```js
const { app } = require('photoshop');
```

**✅ Correct:**

```js
import { app } from 'adobe:uxp';
```

```js
const { app } = require('adobe:photoshop');
```

### `no-unsupported-css`

Disallows CSS `gap` usage, because it is unsupported in UXP.

**❌ Incorrect:**

```js
const style = { gap: 8 };
```

```js
const css = `
  .row {
    gap: 1rem;
  }
`;
```

### `no-unsupported-css-tailwind`

Disallows Tailwind `gap-*` utilities, because they map to CSS `gap`.

**❌ Incorrect:**

```jsx
<div className="flex gap-2" />
```

```jsx
<div className={`grid gap-x-4`} />
```

## License

MIT
