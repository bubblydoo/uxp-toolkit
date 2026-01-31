import type { PathPoints } from './collections/PathPoints';
import type * as Constants from './Constants';
import type { PathItem } from './PathItem';
/**
 * Represents a subpath; a collection of subpaths make up a {@link PathItem}.
 *
 * Create these objects by passing {@link SubPathInfo} objects to {@link PathItems.add}() method. This method creates a
 * `SubPathItem` object for each {@link SubPathInfo} object, and creates and then returns a new {@link PathItem} object for the
 * path represented by all of the subpaths. Access these objects in the {@link PathItem.subPathItems} collection.
 *
 *  - Use the {@link SubPathItem} object to retrieve information about existing subpaths. The properties are read-only.
 *  - Use {@link SubPathInfo} to create subpaths; the properties are read-write.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/}
 *
 * @example
 * ```javascript
 * // Access subpaths from a path
 * const path = app.activeDocument.pathItems[0];
 * path.subPathItems.forEach(subPath => {
 *   console.log(`SubPath closed: ${subPath.closed}, operation: ${subPath.operation}`);
 *   console.log(`Points count: ${subPath.pathPoints.length}`);
 * });
 * ```
 *
 * Added in Photoshop 23.3*
 */
export class SubPathItem {
  /**
   * @ignore
   */
  constructor(index: number, pathId: number, docId: number);
  /**
   * The class name of the referenced object: *"SubPathItem"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/#typename}
   * @minVersion 23.3
   */
  get typename(): 'SubPathItem';
  /**
   * The path that contains this subpath.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/#parent}
   * @minVersion 23.3
   */
  get parent(): PathItem;
  /**
   * How this `SubPathItem` behaves when it intersects another. Specifies how to combine the shapes
   * if the destination path already has a selection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/#operation}
   * @minVersion 23.3
   */
  get operation(): Constants.ShapeOperation;
  /**
   * True if the path is closed.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/#closed}
   * @minVersion 23.3
   */
  get closed(): boolean;
  /**
   * The collection of the {@link PathPoint}s on this `SubPathItem`.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/subpathitem/#pathpoints}
   * @minVersion 23.3
   */
  get pathPoints(): PathPoints;
}
