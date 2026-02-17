We are creating tools to build Adobe UXP Photoshop applications.
Read the readme for more information on the motivation.
Adobe provides two JS modules: uxp and photoshop, but they are poorly documented, often don't work as expected, and they don't come with Typescript types.
One of the things we provide are these Typescript types: `packages/types-photoshop` and `packages/types-uxp`.
See AGENTS_TYPES.md for information if you have to update the types by scraping the docs.
We also provide a library of functions for common actions in Photoshop, as well as convenient wrappers for common operations, and type helpers, which you can import from `packages/uxp-toolkit`. (see root readme for more info)

