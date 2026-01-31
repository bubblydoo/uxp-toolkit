import type { TextFont } from '../objects/TextFont';
import type { Photoshop } from '../Photoshop';
/**
 * The collection of fonts available on your computer. Fonts are represented by
 *  {@link TextFont} objects. Access this object in the {@link Photoshop.fonts} property.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/textfonts/}
 */
export class TextFonts extends Array<TextFont> {
  /** @ignore */
  private proxy;
  /** @ignore */
  constructor();
  /**
   * Used to access the text fonts in the collection.
   * @minVersion 23.0
   */
  [index: number]: TextFont;
  /** @ignore */
  handler(): {
    get: (obj: any, key: any) => any;
  };
  /**
   * Find the first font with the given PostScript name.
   * @minVersion 23.0
   */
  getByName(name: string): TextFont;
  /**
   * Number of {@link TextFont} elements in this collection.
   * @minVersion 23.0
   */
  get length(): number;
  /**
   * The owner application of this TextFonts collection.
   * @minVersion 23.0
   */
  get parent(): Photoshop;
  /**
   * The name for this object collection: TextFonts.
   * @minVersion 23.0
   */
  get typename(): 'TextFonts';
}
