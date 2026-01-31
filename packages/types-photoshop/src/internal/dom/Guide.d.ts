import type * as Constants from './Constants';
import type { Document } from './Document';
/**
 * Represents a single guide in the document.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/}
 *
 * @example
 * ```javascript
 * // Create a vertical guide at 100px
 * const doc = app.activeDocument;
 * const guide = doc.guides.add(constants.Direction.VERTICAL, 100);
 * ```
 *
 * @example
 * ```javascript
 * // Access existing guides
 * const doc = app.activeDocument;
 * const firstGuide = doc.guides[0];
 * console.log(`Guide at ${firstGuide.coordinate}px, direction: ${firstGuide.direction}`);
 * ```
 *
 * @minVersion 23.0
 */
export class Guide {
  /**
   * @ignore
   */
  constructor(id: number, docId: number);
  /**
   * The class name of the referenced object: *"Guide"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#typename}
   * @minVersion 23.0
   */
  get typename(): 'Guide';
  /**
   * For use with batchPlay operations. This guide ID, along with its document ID
   * can be used to represent this guide for the lifetime of this document or the guide.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#id}
   * @minVersion 23.0
   */
  get id(): number;
  /**
   * The ID of the document of this guide.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#docid}
   * @minVersion 23.0
   */
  get docId(): number;
  /**
   * Owner document of this guide.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#parent}
   * @minVersion 23.0
   */
  get parent(): Document;
  /**
   * Indicates whether the guide is vertical or horizontal.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#direction}
   * @minVersion 23.0
   */
  get direction(): Constants.Direction;
  set direction(direction: Constants.Direction);
  /**
   * Position of the guide measured from the ruler origin in pixels. The value can be a decimal.
   *
   * Note: the user can move the ruler origin which will affect the position value of the guides.
   *
   * ***Fixes in Photoshop 24.0:***
   * - *Return correct value when resolution is not 72 PPI*
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#coordinate}
   * @minVersion 23.0
   */
  get coordinate(): number;
  /**
   * Position of the guide measured from the ruler origin in pixels. The value can be a decimal.
   *
   * Note: the user can move the ruler origin which will affect the position value of the guides.
   *
   * ***Fixes in Photoshop 24.0:***
   * - *Sets correct value when resolution is not 72 PPI*
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#coordinate}
   */
  set coordinate(coordinate: number);
  /**
   * Deletes the guide from the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/guide/#delete}
   *
   * @example
   * ```javascript
   * // Delete all guides in the document
   * const doc = app.activeDocument;
   * doc.guides.forEach(guide => guide.delete());
   * ```
   *
   * @minVersion 23.0
   */
  delete(): void;
}
