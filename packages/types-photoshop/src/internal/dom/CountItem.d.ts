import type { CountItems } from './collections/CountItems';

/**
 * Represents a single count item in the document.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/}
 *
 * @example
 * ```javascript
 * // Access count items
 * const doc = app.activeDocument;
 * doc.countItems.forEach(item => {
 *   console.log(`Count item at position ${item.position.x}, ${item.position.y}`);
 * });
 * ```
 */
export class CountItem {
  /**
   * The itemIndex of the CountItem as received from the descriptor.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#itemindex}
   */
  readonly itemIndex: number;
  /**
   * The index of the Group the CountItem belongs to.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#groupindex}
   */
  readonly groupIndex: number;
  /**
   * The class name of the referenced CountItem object
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#typename}
   * @minVersion 24.1
   */
  get typename(): 'CountItem';
  /**
   * The document collection in which we will find this and all other CountItems collected.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#parent}
   * @minVersion 24.1
   */
  get parent(): CountItems;
  /**
   * The position of the CountItem as an object with x and y properties in pixels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#position}
   * @minVersion 24.1
   */
  get position(): {
    x: number;
    y: number;
  };
  /**
   * Moves the CountItem to a new position.
   *
   * @param position : Object with x and y properties in pixels;
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#move}
   *
   * @example
   * ```javascript
   * const item = app.activeDocument.countItems[0];
   * item.move({x: 200, y: 200});
   * ```
   *
   * @minVersion 24.1
   */
  move(position: {
    x: number;
    y: number;
  }): void;
  /**
   * Removes the CountItem from the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/countitem/#remove}
   *
   * @example
   * ```javascript
   * const item = app.activeDocument.countItems[0];
   * item.remove();
   * ```
   *
   * @minVersion 24.1
   */
  remove(): void;
}
