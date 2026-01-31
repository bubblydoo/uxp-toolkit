import type * as Constants from './Constants';
import type { Layer } from './Layer';
import type { CharacterStyle } from './text/CharacterStyle';
import type { ParagraphStyle } from './text/ParagraphStyle';
import type { TextWarpStyle } from './text/TextWarpStyle';
/**
 * The Class that groups all Type related properties of a Text Layer in Photoshop.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/}
 *
 * @example
 * ```javascript
 * const app = require('photoshop').app;
 * const textItem = app.activeDocument.activeLayers[0].textItem;
 * ```
 *
 * Some properties and methods are available directly in the TextItem instance itself:
 *
 * @example
 * ```javascript
 * textItem.contents; // "Lorem Ipsum"
 * textItem.contents = "Hello World";
 * textItem.isPointText; // true
 * await textItem.convertToParagraphText();
 * ```
 *
 * Most properties and methods are grouped for convenience in
 * the {@link characterStyle} and {@link paragraphStyle} properties of {@link TextItem}.
 *
 * ```javascript
 * textItem.characterStyle.size; // 12
 * textItem.characterStyle.size = 24;
 * textItem.paragraphStyle.hyphenation; // true
 * ```
 *
 * Finally, the {@link warpStyle} object contains all the properties related to the
 * Warp effect applied to the text layer.
 *
 * ```javascript
 * textItem.warpStyle.style; // "arcLower"
 * ```
 *
 * Please note that for some properties that are expressed in pixels, the valid range
 * of values might depend on the document's resolution. When this is the case, you'll find
 * that in the documentation "for a 72ppi document" is specified.
 *
 * An example is the font size:
 *
 * ```javascript
 * // Range: 0.01..1296—for a 72ppi document
 * textItem.characterStyle.size = 1000;
 * ```
 *
 * If you want to find the range for documents with a different resolution, please use
 * the following conversion formula:
 *
 * ```javascript
 * newVal = (documentResolution / 72) * referenceVal;
 *
 * // I.e., for a 300ppi document the maximum font size will be:
 * // (300 / 72) * 1296 = 5400px
 * ```
 *
 * Upon setting a value, validation will be performed internally.
 * An invalid value will result in a Range Error.
 *
 * @minVersion 24.1
 */
export class TextItem {
  /**
   * The parent Layer
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#parent}
   * @minVersion 24.1
   */
  get parent(): Layer;
  /**
   * The typename
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#typename}
   * @minVersion 24.1
   */
  get typename(): 'TextItem';
  /**
   * The actual text of the Layer.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#contents}
   * @minVersion 24.1
   */
  get contents(): string;
  set contents(text: string);
  /**
   * The text insertion point in the document, as an `{x, y}` object
   * where the coordinates are expressed in pixels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#textclickpoint}
   * @minVersion 24.1
   */
  get textClickPoint(): {
    x: number;
    y: number;
  };
  set textClickPoint(point: {
    x: number;
    y: number;
  });
  /**
   * The text orientation.
   *
   * @default HORIZONTAL
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#orientation}
   * @minVersion 24.1
   */
  get orientation(): Constants.Orientation;
  set orientation(orientation: Constants.Orientation);
  /**
   * True if the Text Layer is a "Point Text": a horizontal or vertical line of text
   * that begins where the user clicks in the image.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#ispointtext}
   * @minVersion 24.1
   */
  get isPointText(): boolean;
  /**
   * True if the Text Layer is a "Paragraph Text": text that uses boundaries
   * to control the flow of characters, either horizontally or vertically.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#isparagraphtext}
   * @minVersion 24.1
   */
  get isParagraphText(): boolean;
  /**
   * Convert a Text Layer from Point Text to Paragraph Text
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#converttoparagraphtext}
   *
   * @example
   * ```javascript
   * const textLayer = app.activeDocument.activeLayers[0];
   * if (textLayer.textItem.isPointText) {
   *   await textLayer.textItem.convertToParagraphText();
   * }
   * ```
   *
   * @minVersion 24.1
   */
  convertToParagraphText(): Promise<TextItem>;
  /**
   * Convert a Text Layer from Paragraph Text to Point Text
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#converttopointtext}
   *
   * @example
   * ```javascript
   * const textLayer = app.activeDocument.activeLayers[0];
   * if (textLayer.textItem.isParagraphText) {
   *   await textLayer.textItem.convertToPointText();
   * }
   * ```
   *
   * @minVersion 24.1
   */
  convertToPointText(): Promise<TextItem>;
  /**
   * Convert the Text Layer into a Shape Layer
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#converttoshape}
   *
   * @example
   * ```javascript
   * const textLayer = app.activeDocument.activeLayers[0];
   * await textLayer.textItem.convertToShape();
   * ```
   *
   * @minVersion 24.1
   */
  convertToShape(): Promise<void>;
  /**
   * Create a Work Path from the Text Layer
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#createworkpath}
   *
   * @example
   * ```javascript
   * const textLayer = app.activeDocument.activeLayers[0];
   * await textLayer.textItem.createWorkPath();
   * ```
   *
   * @minVersion 24.1
   */
  createWorkPath(): Promise<void>;
  /**
   * The object that stores properties related to the Character panel in the Photoshop UI.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#characterstyle}
   * @minVersion 24.1
   */
  characterStyle: CharacterStyle;
  /**
   * The object that stores properties related to the Paragraph panel in the Photoshop UI.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#paragraphstyle}
   * @minVersion 24.1
   */
  paragraphStyle: ParagraphStyle;
  /**
   * The object that stores properties related to the Warp Text dialog.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textitem/#warpstyle}
   * @minVersion 24.1
   */
  warpStyle: TextWarpStyle;
}
