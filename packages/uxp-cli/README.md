# @bubblydoo/uxp-cli

![NPM Version](https://img.shields.io/npm/v/@bubblydoo/uxp-cli)

CLI helpers for opening Photoshop UXP DevTools without the Adobe Developer Tools app.

## Install

```bash
pnpm add -D @bubblydoo/uxp-cli
```

Or run it directly:

```bash
pnpm --allow-build=@adobe-fixed-uxp/uxp-devtools-helper dlx @bubblydoo/uxp-cli open-devtools
```

## Usage

Open DevTools with a custom plugin:

```bash
uxp-cli open-devtools --plugin-path ./my-plugin
```

## Unexpected but useful details

- If `--plugin-path` is omitted, the CLI uses a built-in fake plugin so you can still open DevTools immediately.
- The CLI validates your plugin path and reads `manifest.json` to resolve the plugin ID automatically.
- `dump-object` is a low-level debug command that writes runtime object internals to `dump.json` for CDP inspection workflows.
