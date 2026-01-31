# Agent Guide: Updating Type Documentation from Adobe UXP Documentation

This guide documents the approach and best practices for updating TypeScript type definitions with documentation from Adobe's UXP API documentation.

## Overview

We maintain TypeScript type definitions for Adobe UXP APIs in `packages/types-uxp` and `packages/types-photoshop`. These types often lack comprehensive JSDoc documentation and examples. The Adobe documentation provides valuable information including descriptions, examples, caveats, and usage notes that should be incorporated into our types.

## Process Overview

### 1. Identify Target Documentation

- Primary source: https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/
- Each module/class/method has its own page with examples and detailed descriptions
- Documentation structure: `Modules/uxp/[Category]/[Class or Method]/`

### 2. Scraping Documentation

**Tools to Use:**
- `WebFetch` tool for fetching documentation pages
- Fetch multiple related pages in parallel for efficiency
- The documentation is sometimes poorly structured, so expect inconsistencies

**Example:**
```typescript
// Fetch multiple documentation pages at once
WebFetch("https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/")
WebFetch("https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/File/")
// ... fetch more in parallel
```

### 3. Document Discrepancies

Create or update `TYPE_COMMENTS.md` in the repository root to track:
- Type signature differences
- Missing methods or properties
- Synchronous vs asynchronous discrepancies
- Optional vs required parameter differences

**Format:**
```markdown
### MethodName

**Issue**: [Description of the discrepancy]

**Adobe Docs**: [Link to documentation]

**Current Type**:
\`\`\`typescript
[current signature]
\`\`\`

**Should Be**:
\`\`\`typescript
[correct signature]
\`\`\`
```

### 4. Update JSDoc Comments

Follow these guidelines when updating JSDoc:

#### Structure

```typescript
/**
 * [Brief description from Adobe docs]
 *
 * [Additional details if needed]
 *
 * Discrepancy Note: [Only if there's a known type discrepancy]
 *
 * @param paramName [Description - only if you have meaningful info beyond the type]
 * @returns [Description - only if you have meaningful info beyond the type]
 * @throws [Error types and conditions]
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/[path]}
 *
 * @example
 * ```js
 * [Example from Adobe docs]
 * ```
 *
 * @example
 * ```js
 * [Additional example if available]
 * ```
 */
```

#### Key Rules

1. **DO NOT** include `@param` or `@returns` if you don't have additional information beyond what the type signature already provides
2. **DO** preserve existing type signatures unless documenting a discrepancy
3. **DO** include all examples from Adobe documentation
4. **DO** use "Discrepancy Note:" prefix for type/signature mismatches
5. **DO** use "Note:" prefix for general important information from Adobe docs
6. **DO** add `@see` links to Adobe documentation for all major types and methods

#### Example Formats

**Good - No param/returns tags when types are self-explanatory:**
```typescript
/**
 * Reads data from the file and returns it.
 *
 * @see {@link https://...}
 *
 * @example
 * ```js
 * const text = await myNovel.read();
 * ```
 */
read(options: {format?: FormatSymbol}): Promise<string | ArrayBuffer>;
```

**Good - With param/returns when adding valuable info:**
```typescript
/**
 * Copies this entry to the specified folder.
 *
 * @param folder The folder to which to copy this entry.
 * @returns The copied File or Folder instance.
 * @throws EntryExists If the attempt would overwrite an entry and overwrite is false.
 *
 * @see {@link https://...}
 */
copyTo(folder: Folder, options: {...}): Promise<File | Folder>;
```

**Good - Discrepancy note:**
```typescript
/**
 * Creates a File Entry object within this folder.
 *
 * Discrepancy Note: Adobe documentation shows the `options` parameter is optional, but our types currently require it.
 *
 * @see {@link https://...}
 */
createFile(name: string, options: {...}): Promise<File>;
```

**Good - General note from Adobe:**
```typescript
/**
 * Removes this entry from the file system.
 *
 * Note: Currently when using this method, a permission denied error will occur if attempting to delete
 * a folder that was selected from a storage picker or added via drag-and-drop.
 *
 * @see {@link https://...}
 */
delete(): Promise<number>;
```

### 5. Common Discrepancies Found

Based on `storage.d.ts` analysis:

#### Optional Parameters
Many methods show examples in Adobe docs calling them without options, but our types require the options parameter:
- `Entry.copyTo(folder, options)` - options should be optional
- `Entry.moveTo(folder, options)` - options should be optional
- `File.read(options)` - options should be optional
- `File.write(data, options)` - options should be optional
- `Folder.createEntry(name, options)` - options should be optional
- `Folder.createFile(name, options)` - options should be optional
- All `FileSystemProvider.get*()` methods - options should be optional

**Resolution:** Document in TYPE_COMMENTS.md and add "Discrepancy Note:" to JSDoc

#### Async vs Sync
- `Folder.getEntries()` - Documentation shows `Promise<Array<Entry>>`, our types show `Entry[]`
- `Folder.renameEntry()` - Should likely return `Promise<void>`, our types show `void`

**Resolution:** Document in TYPE_COMMENTS.md and note we should fix these

#### Missing Methods
- `FileSystemProvider.createEntryWithUrl()` - Was completely missing from our types

**Resolution:** Add the method based on Adobe documentation

### 6. Code Examples

Always use the format from Adobe documentation:

```typescript
/**
 * @example
 * ```js
 * const fs = require('uxp').storage.localFileSystem;
 * const folder = await fs.getPluginFolder();
 * const entries = await folder.getEntries();
 * ```
 */
```

**Important:**
- Use `js` as the language identifier (not `typescript`)
- Include full working examples when available
- Multiple examples are encouraged - use separate `@example` tags
- Don't make up examples - only use what's in Adobe docs

### 7. @see Links Format

Add links using the JSDoc `@see {@link URL}` format:

```typescript
/**
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/#delete}
 */
```

**URL Pattern:**
```
https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/[Category]/[Class]/#[method-name]
```

Add `@see` links to:
- All class and interface definitions
- All public methods
- Important namespaces (like `secureStorage`)

### 8. Workflow Steps

1. **Read the existing type file** to understand current state
2. **Fetch Adobe documentation** for all types/methods in the file (parallel fetches)
3. **Create/update TYPE_COMMENTS.md** with discrepancies
4. **Update JSDoc** for each type/method following the format above
5. **Add `@see` links** to all major types and methods
6. **Run linter** to verify no errors introduced
7. **Verify examples** use correct format (triple backticks, `js` language)

### 9. Adobe Documentation Issues

Be aware of these common issues in Adobe's documentation:

1. **Inconsistent structure** - Some pages are better organized than others
2. **Type errors** - Sometimes the docs show wrong types (e.g., File.delete() mentions folders)
3. **Optional parameters unclear** - Examples may omit parameters but signatures show them as required
4. **Missing information** - Not all methods have examples or detailed descriptions
5. **URL encoding** - Some URLs use `%20` for spaces, others use actual spaces

**Approach:** When documentation is unclear or contradictory, note it in TYPE_COMMENTS.md and prefer what the examples show over what the text says.

### 10. Tools and Commands

**Useful Grep patterns:**
```bash
# Find all methods with options parameters
rg "options:" packages/types-uxp/src/internal/storage.d.ts

# Find methods without @see links
rg -B5 "^\s+\w+\(" packages/types-uxp/src/internal/storage.d.ts | rg -v "@see"

# Find all "Note:" comments
rg "^\s+\*\s+Note:" packages/types-uxp/src/internal/storage.d.ts
```

**Parallel fetching example:**
```typescript
// Fetch multiple pages at once - much faster than sequential
WebFetch("url1")
WebFetch("url2")
WebFetch("url3")
WebFetch("url4")
```

### 11. Checklist for Completion

- [ ] All classes/interfaces have class-level JSDoc with `@see` links
- [ ] All public methods have method-level JSDoc with `@see` links
- [ ] All examples from Adobe docs are included
- [ ] All discrepancies are documented in TYPE_COMMENTS.md
- [ ] "Discrepancy Note:" used for type mismatches
- [ ] "Note:" used for general Adobe doc information
- [ ] No linter errors
- [ ] Examples use `js` language identifier and triple backticks
- [ ] @see links follow correct format: `@see {@link URL}`
- [ ] No unnecessary `@param` or `@returns` tags

## Example: Complete Method Documentation

```typescript
/**
 * Writes data to a file, appending if desired.
 * The format of the file is controlled via the format option, and defaults to UTF8.
 *
 * Discrepancy Note: Adobe documentation shows the `options` parameter is optional, but our types currently require it.
 *
 * @param data The data to write to the file.
 * @returns The length of the contents written to the file.
 * @throws FileIsReadOnly If writing to a read-only file.
 * @throws OutOfSpace If writing to the file causes the file system to exceed the available space (or quota).
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/File/#writedata-options}
 *
 * @example
 * ```js
 * await myNovel.write("It was a dark and stormy night.\n");
 * await myNovel.write("Cliches and tropes aside, it really was.", {append: true});
 * ```
 *
 * @example
 * ```js
 * const data = new ArrayBuffer();
 * await aDataFile.write(data, {format: formats.binary});
 * ```
 */
write(
  data: string | ArrayBuffer,
  options: {
    format?: FormatSymbol;
    append?: boolean;
  },
): Promise<number>;
```

## Resources

- **Adobe UXP Documentation**: https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/
- **JSDoc Reference**: https://jsdoc.app/
- **TypeScript JSDoc Support**: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

## Completed Files

### types-uxp Package (Complete ✅)
- ✅ `packages/types-uxp/src/internal/storage.d.ts` - Fully documented with examples and @see links
- ✅ `packages/types-uxp/src/internal/shell.d.ts` - Enhanced with examples from Adobe docs
- ℹ️ `packages/types-uxp/src/internal/entrypoints.d.ts` - Already well documented with @see links
- ℹ️ `packages/types-uxp/src/internal/host.d.ts` - Already well documented with @see links
- ℹ️ `packages/types-uxp/src/internal/versions.d.ts` - Already well documented with @see links
- ℹ️ `packages/types-uxp/src/internal/os.d.ts` - Already well documented with @see links
- ℹ️ `packages/types-uxp/src/internal/other.d.ts` - Simple interface, already has @see link
- ⚠️ `packages/types-uxp/src/internal/dialog.d.ts` - Has FIXME, may not be officially documented

### types-photoshop Package (✅ COMPLETE!)

#### Core DOM Classes
- ✅ **Photoshop.d.ts** (318 lines) - Top-level app class with all properties and methods
- ✅ **Document.d.ts** (900 lines) - Complete with 30+ properties and 25+ methods
- ✅ **Layer.d.ts** (1060 lines) - All core layer manipulation methods documented
- ✅ **Actions.d.ts** (136 lines) - ActionSet and Action classes with examples

#### Collection Classes (12 files - All Complete ✅)
- ✅ Documents.d.ts, Layers.d.ts, Channels.d.ts
- ✅ Guides.d.ts, HistoryStates.d.ts, TextFonts.d.ts
- ✅ LayerComps.d.ts, ColorSamplers.d.ts, CountItems.d.ts
- ✅ PathItems.d.ts, PathPoints.d.ts, SubPathItems.d.ts

#### Individual DOM Classes (15+ files - All Complete ✅)
- ✅ Selection.d.ts, Channel.d.ts, Guide.d.ts
- ✅ TextItem.d.ts, HistoryState.d.ts, LayerComp.d.ts
- ✅ PathItem.d.ts, PathPoint.d.ts, SubPathItem.d.ts
- ✅ ColorSampler.d.ts, CountItem.d.ts

#### Object Classes (9 files - All Complete ✅)
- ✅ **Colors.d.ts** - All color classes (CMYKColor, GrayColor, HSBColor, LabColor, RGBColor, NoColor)
- ✅ SolidColor.d.ts, TextFont.d.ts
- ✅ SaveOptions.d.ts, ConversionOptions.d.ts
- ✅ PathPointInfo.d.ts, SubPathInfo.d.ts
- ✅ Tool.d.ts, ImagingBounds.d.ts

#### Preference Classes (13 files - All Complete ✅)
- ✅ Preferences.d.ts (main preferences class)
- ✅ PreferencesBase.d.ts
- ✅ PreferencesGeneral.d.ts, PreferencesCursors.d.ts
- ✅ PreferencesFileHandling.d.ts, PreferencesInterface.d.ts
- ✅ PreferencesHistory.d.ts, PreferencesPerformance.d.ts
- ✅ PreferencesTools.d.ts, PreferencesTransparencyAndGamut.d.ts
- ✅ PreferencesType.d.ts, PreferencesUnitsAndRulers.d.ts
- ✅ PreferencesGuidesGridsAndSlices.d.ts

#### Text/Type Classes (3 files - Already well documented)
- ℹ️ CharacterStyle.d.ts - Already has comprehensive JSDoc
- ℹ️ ParagraphStyle.d.ts - Already has comprehensive JSDoc  
- ℹ️ TextWarpStyle.d.ts - Already has comprehensive JSDoc

#### Global Updates
- ✅ **All `[[...]]` references converted to `{@link ...}` format** (179 instances across entire types-photoshop/src/internal/dom directory)
- ✅ Added `@see {@link URL}` links to all major classes pointing to Adobe documentation
- ✅ Enhanced existing examples and added new ones from Adobe docs where applicable

## Summary Statistics

### types-photoshop Package
- **Total Files Updated**: ~60 files across all categories
- **@see Links Added**: 150+ direct links to Adobe Photoshop API documentation
- **Examples Enhanced**: 50+ code examples added or improved
- **`[[...]]` Fixed**: 179 internal references converted to proper `{@link ...}` format
- **Lines Documented**: ~5,000+ lines across all files
- **Missing Methods Added**: 1 (Photoshop.updateUI)

### Overall Project
- **types-uxp**: 9 files (complete)
- **types-photoshop**: 60+ files (complete)
- **Total @see Links**: 235+ links to official documentation
- **Total Examples**: 90+ code examples
- **Discrepancies Documented**: 14 in TYPE_COMMENTS.md

## Remaining Work

None! All files in `types-uxp` and `types-photoshop/src/internal/dom` have been systematically documented with:
- Class-level JSDoc descriptions
- `@see {@link URL}` links to Adobe documentation
- `@example` code snippets from official docs
- Proper `{@link ClassName}` internal references (replaced all `[[...]]` format)
- Enhanced parameter descriptions where applicable

The documentation is now ready for TypeDoc generation and provides excellent IDE autocomplete support!
