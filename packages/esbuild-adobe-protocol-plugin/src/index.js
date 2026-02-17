/**
 * Rewrites `adobe:*` imports to plain module IDs and marks them external.
 */
export function stripAdobeProtocolPlugin() {
  /** @type {import('esbuild').Plugin} */
  const plugin = {
    name: 'strip-adobe-protocol',
    setup(build) {
      build.onResolve({ filter: /^adobe:/ }, (args) => {
        return { path: args.path.replace('adobe:', ''), external: true };
      });
    },
  };
  return plugin;
}
