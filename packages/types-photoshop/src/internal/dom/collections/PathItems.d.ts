import type { SubPathInfo } from '../objects/SubPathInfo';
import type { PathItem } from '../PathItem';
/**
 * The collection of {@link PathItem} objects in a document.
 *
 * Access through the {@link Document.pathItems} collection property. To create new paths,
 * see {@link PathPointInfo} and {@link SubPathInfo} classes and pass them to {@link PathItems.add}() method.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/pathitems/}
 */
export class PathItems extends Array<PathItem> {
  /**
   * @ignore
   */
  readonly _docId: number;
  /**
   * @ignore
   */
  private proxy;
  /**
   * Used to access the paths in the collection.
   * @minVersion 23.3
   */
  [index: number]: PathItem;
  /**
   * @ignore
   */
  constructor(docId: number);
  /**
   * @ignore
   */
  handler(): {
    get: (obj: any, key: any) => any;
  };
  /**
   * Number of {@link PathItem} objects in this collection.
   * @minVersion 23.3
   */
  get length(): number;
  /**
   * The owner document of this PathItem collection.
   * @minVersion 23.3
   */
  get parent(): Document;
  /**
   * Creates a new path item object and adds it to this collection.
   *
   * A new {@link SubPathItem} object is created for each {@link SubPathInfo} object provided in `entirePath`,
   * and those {@link SubPathItem} objects are added to the {@link PathItem.subPathItems} collection of the returned
   * {@link PathItem}.
   * @minVersion 23.3
   */
  add(name: string, entirePath: SubPathInfo[]): PathItem;
  /**
   * Removes all paths from this collection.
   * @minVersion 23.3
   */
  removeAll(): void;
  /**
   * Retrieve the first PathItem matching the given name.
   * @param name Name to find
   * @minVersion 23.3
   */
  getByName(name: string): PathItem;
}
