# UXP Polyfills

This package contains polyfills that are convenient and sometimes needed for building UXP extensions.

- 'matchmedia-polyfill' is a polyfill for the `matchMedia` API, which is not available in the UXP API but needed for React.
- 'mutationobserver-shim' is a polyfill for the `MutationObserver` API, which is not available in the UXP API but needed for React.
- 'performance-measure' is a polyfill for the `performance.measure` API, which is not available in the UXP API but needed for React dev mode.
- 'core-js/actual/error' is a polyfill for the `Error.cause` property, which is very useful for error handling.

## Implementation details

They are all bundled into a single file, because some of these (e.g. `matchmedia-polyfill`) has been patched with pnpm.
