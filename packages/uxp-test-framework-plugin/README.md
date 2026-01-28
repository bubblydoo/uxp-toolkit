# UXP Test Framework Plugin

This is a package that exports a `runCli` function, which runs the Vite CLI and uses `vite-uxp-plugin`.

The whole vite config and most packages are bundled into `dist/cli.js`, except `typescript`, `vite`, `chokidar` and `tailwindcss`. Those are the only dependencies if this package.
