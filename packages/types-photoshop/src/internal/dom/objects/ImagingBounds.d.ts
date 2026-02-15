/**
 * Defines a rectangle.
 *
 * @targetfolder objects
 * @optionobject
 */
export interface ImagingBounds {
  /**
   * Coordinate of the left edge.
   * @minVersion 22.5
   */
  left: number;
  /**
   * Coordinate of the right edge.
   * @minVersion 22.5
   */
  right: number;
  /**
   * Coordinate of the top edge.
   * @minVersion 22.5
   */
  top: number;
  /**
   * Coordinate of the bottom edge.
   * @minVersion 22.5
   */
  bottom: number;
  /**
   * Calculated width (readonly when returned from Photoshop).
   * @minVersion 22.5
   */
  readonly width?: number;
  /**
   * Calculated height (readonly when returned from Photoshop).
   * @minVersion 22.5
   */
  readonly height?: number;
}
