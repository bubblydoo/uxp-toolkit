import type * as Constants from '../Constants';
/**
 * Options for converting an image to bitmap mode, using {@link Document.changeMode} with `ChangeMode.BITMAP`.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#changemode}
 *
 * @example
 * ```javascript
 * const doc = app.activeDocument;
 * await doc.changeMode(constants.ChangeMode.BITMAP, {
 *   method: constants.BitmapConversionType.DIFFUSIONDITHER,
 *   resolution: 72
 * });
 * ```
 *
 * @example
 * ```javascript
 * // Convert with halftone screen
 * await doc.changeMode(constants.ChangeMode.BITMAP, {
 *   method: constants.BitmapConversionType.HALFTONESCREEN,
 *   frequency: 60,
 *   angle: 45,
 *   shape: constants.BitmapHalfToneType.ROUND
 * });
 * ```
 *
 * @targetfolder objects/conversionoptions
 * @optionobject
 */
export interface BitmapConversionOptions {
  /**
   * The angle (in degrees) at which to orient individual dots. See shape property below.
   * Valid only when the method property is set to `BitmapConversionType.HALFTONESCREEN`.
   *
   * @default -
   * @range -180...180
   * @minVersion 23.0
   */
  angle?: number;
  /**
   * The number of dots (per inch) to use.
   * Valid only when the method property is set to `BitmapConversionType.HALFTONESCREEN`.
   *
   * @default -
   * @range 1.0..999.99
   * @minVersion 23.0
   */
  frequency?: number;
  /**
   * The conversion method.
   *
   * @default DIFFUSIONDITHER
   * @range -
   * @minVersion 23.0
   */
  method?: Constants.BitmapConversionType;
  /**
   * The name of the pattern to use.
   * Valid only when the method property is set to BitmapConversionType.CUSTOMPATTERN.
   *
   * @default
   * @range -
   * @minVersion 23.0
   */
  patternName?: string;
  /**
   * The output resolution (in pixels per inch).
   *
   * @default 72
   * @range -
   * @minVersion 23.0
   */
  resolution?: number;
  /**
   * The dot shape.
   * Valid only when the method property is set to BitmapConversionType.HALFTONESCREEN.
   *
   * @default -
   * @range -
   * @minVersion 23.0
   */
  shape?: Constants.BitmapHalfToneType;
}
/**
 * Options for converting an RGB image to an indexed color model using {@link Document.changeMode}
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#changemode}
 *
 * @example
 * ```javascript
 * const doc = app.activeDocument;
 * await doc.changeMode(constants.ChangeMode.INDEXEDCOLOR, {
 *   palette: constants.Palette.LOCALPERCEPTUAL,
 *   colors: 256,
 *   dither: constants.Dither.DIFFUSION,
 *   transparency: true
 * });
 * ```
 *
 * @example
 * ```javascript
 * // Convert with web palette
 * await doc.changeMode(constants.ChangeMode.INDEXEDCOLOR, {
 *   palette: constants.Palette.WEBPALETTE,
 *   colors: 216,
 *   preserveExactColors: true
 * });
 * ```
 *
 * @targetfolder objects/conversionoptions
 * @optionobject
 * @minVersion 23.0
 */
export interface IndexedConversionOptions {
  /**
   * The number of palette colors.
   *
   * Valid only with palette types: LOCALADAPTIVE, LOCALPERCEPTUAL,
   * LOCALSELECTIVE, MACOSPALETTE, UNIFORM, WEBPALETTE, or WINDOWSPALETTE.
   *
   * @minVersion 23.0
   */
  colors?: number;
  /**
   * The type of dithering to be done.
   *
   * @minVersion 23.0
   */
  dither?: Constants.Dither;
  /**
   * The amount of dithering to be done.
   *
   * Valid only when dither typ is DIFFUSION.
   * @minVersion 23.0
   */
  ditherAmount?: number;
  /**
   * The set of colors to force into the color palette.
   *
   * @minVersion 23.0
   */
  forced?: Constants.ForcedColors;
  /**
   * The color to use to fill anti-aliased edges adjacent to transparent areas of the image.
   *
   * When transparency is false, the matte color is applied to transparent areas.
   *
   * @default WHITE
   * @minVersion 23.0
   */
  matte?: Constants.MatteColor;
  /**
   * The palette type.
   *
   * @minVersion 23.0
   */
  palette?: Constants.Palette;
  /**
   * When true, the image colors matching entries in the color table will not be dithered.
   *
   * @minVersion 23.0
   */
  preserveExactColors?: boolean;
  /**
   * When true, transparent areas of the image are preserved during conversion to GIF format.
   *
   * @minVersion 23.0
   */
  transparency?: boolean;
}
