import type { SubPathItems } from './collections/SubPathItems';
import type * as Constants from './Constants';
import type { Document } from './Document';
import type { Layer } from './Layer';
import type { SolidColor } from './objects/SolidColor';
/**
 * A path or drawing object, such as the outline of a shape or a straight or curved line,
 * which contains sub paths defining its geometry.
 *
 * Access through the collection in the {@link Document.pathItems} property. For example, this selects a named path item:
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/}
 *
 * @example
 * ```javascript
 * const currentPathItem = app.activeDocument.pathItems.getByName("myPath");
 * currentPathItem.select()
 * ```
 *
 * Create these objects by passing a set of SubPathInfo objects to the {@link PathItems.add}() method. This method creates
 * a {@link SubPathItem} object for each {@link SubPathInfo} object, and creates and returns a new {@link PathItem} object for the
 * path represented by all of the subpaths.
 *
 * @minVersion 23.3
 */
export class PathItem {
  /**
   * @ignore
   */
  constructor(id: number, docId: number);
  /**
   * The class name of the referenced object: *"PathItem"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#typename}
   * @minVersion 23.3
   */
  get typename(): 'PathItem';
  /**
   * For use with batchPlay operations. This pathItem ID, along with its document ID
   * can be used to represent this pathItem for the lifetime of this document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#id}
   * @minVersion 23.3
   */
  get id(): number;
  /**
   * The ID of the document of this pathItem.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#docid}
   * @minVersion 23.3
   */
  get docId(): number;
  /**
   * The document in which the path resides.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#parent}
   * @minVersion 23.3
   */
  get parent(): Document;
  /**
   * The specific kind of path.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#kind}
   * @minVersion 23.3
   */
  get kind(): Constants.PathKind;
  set kind(kind: Constants.PathKind);
  /**
   * Name of this path
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#name}
   * @minVersion 23.3
   */
  get name(): string;
  set name(name: string);
  /**
   * The contained {@link SubPathItem}s in this path.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#subpathitems}
   * @minVersion 23.3
   */
  get subPathItems(): SubPathItems;
  /**
   * Deselects this `pathItem` object.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#deselect}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems[0];
   * await path.deselect();
   * ```
   *
   * @minVersion 23.3
   */
  deselect(): Promise<void>;
  /**
   * Duplicates the `pathItem` object with the new name, returning the duplicate.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#duplicate}
   *
   * @example
   * ```javascript
   * const originalPath = app.activeDocument.pathItems[0];
   * const duplicatePath = await originalPath.duplicate("Copy of " + originalPath.name);
   * ```
   *
   * @minVersion 23.3
   */
  duplicate(name?: string): Promise<PathItem>;
  /**
   * Fills the area enclosed by this path.
   *
   * `opacity` is a percentage, in the `[0.0 ... 100.0]` range.
   *
   * `feather` is in pixels, in the `[0.0 ... 250.0]` range.
   *
   * If `wholePath` is true, all subpaths are used when doing the fill.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#fillpath}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems[0];
   * const fillColor = new SolidColor();
   * fillColor.rgb.red = 255;
   * fillColor.rgb.green = 0;
   * fillColor.rgb.blue = 0;
   * await path.fillPath(fillColor, constants.ColorBlendMode.NORMAL, 100, false, 0, true, true);
   * ```
   *
   * @minVersion 23.3
   */
  fillPath(
    fillColor?: SolidColor,
    mode?: Constants.ColorBlendMode,
    opacity?: number,
    preserveTransparency?: boolean,
    feather?: number,
    wholePath?: boolean,
    antiAlias?: boolean,
  ): Promise<void>;
  /**
   * Makes this the clipping path for this document.
   *
   * `flatness` tells the PostScript printer how to approximate curves in the path.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#makeclippingpath}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems.getByName("ClipPath");
   * await path.makeClippingPath(2);
   * ```
   *
   * @minVersion 23.3
   */
  makeClippingPath(flatness?: number): Promise<void>;
  /**
   * Makes a selection object whose border is this path.
   *
   * `feather` is in pixels, in the range [0.0...250.0]
   *
   * `operation`, by default, is `SelectionType.REPLACE`
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#makeselection}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems[0];
   * await path.makeSelection(5, true, constants.SelectionType.REPLACE);
   * ```
   *
   * @minVersion 23.3
   */
  makeSelection(feather?: number, antiAlias?: boolean, operation?: Constants.SelectionType): Promise<void>;
  /**
   * Deletes this object.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#remove}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems[0];
   * await path.remove();
   * ```
   *
   * @minVersion 23.3
   */
  remove(): Promise<void>;
  /**
   * Makes this the active or selected `PathItem` object.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#select}
   *
   * @example
   * ```javascript
   * const path = app.activeDocument.pathItems.getByName("myPath");
   * await path.select();
   * ```
   *
   * @minVersion 23.3
   */
  select(): Promise<void>;
  /**
   * Strokes the path with the specified tool
   *
   * `tool` is optional, and by default will use `ToolType.PENCIL`
   *
   * `simulatePressure` is false by default.
   *
   * If the tool is `ToolType.CLONESTAMP` or `ToolType.HEALINGBRUSH`, `sourceOrigin` must be provided as a
   * an object with x and y properties (in pixels) to indicate the location of the stroke source. `sourceLayer`
   * is optional, and by default will use the active layer in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitem/#strokepath}
   *
   * @example
   * ```javascript
   * // Stroke a path with the brush tool
   * const path = app.activeDocument.pathItems[0];
   * await path.strokePath(constants.ToolType.BRUSH, false);
   * ```
   *
   * @example
   * ```javascript
   * // Stroke with clone stamp tool
   * const path = app.activeDocument.pathItems[0];
   * await path.strokePath(
   *   constants.ToolType.CLONESTAMP,
   *   false,
   *   {x: 100, y: 100},
   *   app.activeDocument.layers[0]
   * );
   * ```
   *
   * @minVersion 23.3
   */
  strokePath(tool?: Constants.ToolType, simulatePressure?: boolean, sourceOrigin?: {
    x: number;
    y: number;
  }, sourceLayer?: Layer): Promise<void>;
}
