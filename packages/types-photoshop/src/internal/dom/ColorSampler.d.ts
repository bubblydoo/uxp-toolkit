import type { Document } from './Document';
import type { NoColor } from './objects/Colors';
import type { SolidColor } from './objects/SolidColor';
/**
 * Represents a ColorSampler object in the Photoshop DOM.
 *
 * ColorSamplers are created through the {@link ColorSamplers} collection via the {@link ColorSamplers.add} method:
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/}
 *
 * @example
 * ```javascript
 * const app = require("photoshop").app;
 * app.activeDocument.colorSamplers.add({x: 100, y: 100});
 * ```
 *
 * Properties such as `color`, `position` and `parent` document can be then accessed on the ColorSampler instance:
 *
 * ```javascript
 * let cs = app.activeDocument.colorSamplers[0];
 * console.log(cs.position);  // {x: 100, y: 100}
 * console.log(cs.color.rgb); // SolidColor {red: 0, green: 255, blue: 0}
 * console.log(cs.parent);    // Document
 * ```
 *
 * An existing ColorSampler instance can be moved to a different position:
 *
 * ```javascript
 * cs.move({x: 200, y: 200});
 * console.log(cs.position);  // {x: 200, y: 200}
 * ```
 *
 * Or removed altogether from the document:
 *
 * ```javascript
 * cs.remove();
 * console.log(app.activeDocument.colorSamplers.length); // 0
 * ```
 */
export class ColorSampler {
  /**
   * @ignore
   */
  constructor(docId: number, index: number, position: {
    x: number;
    y: number;
  }, color: SolidColor | NoColor);
  /**
   * The class name of the referenced object: *"ColorSampler"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#typename}
   * @minVersion 24.0
   */
  get typename(): 'ColorSampler';
  /**
   * The ID of the Document of this ColorSampler.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#docid}
   * @minVersion 24.0
   */
  get docId(): number;
  /**
   * Owner document of this ColorSampler.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#parent}
   * @minVersion 24.0
   */
  get parent(): Document;
  /**
   * The position of this ColorSampler.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#position}
   * @minVersion 24.0
   */
  get position(): {
    x: number;
    y: number;
  };
  /**
   * The color reading of this ColorSampler in its current position.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#color}
   * @minVersion 24.0
   * @returns a {@link SolidColor} instance.
   */
  get color(): SolidColor | NoColor;
  /**
   * Deletes the given ColorSampler object.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#remove}
   * @minVersion 24.0
   */
  remove(): void;
  /**
   * Moves the ColorSampler object to the given position
   *
   * @param position Object literal with target coordinates in pixels `{x: number, y: number}`.
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/colorsampler/#move}
   * @minVersion 24.0
   */
  move(position: {
    x: number;
    y: number;
  }): void;
}
