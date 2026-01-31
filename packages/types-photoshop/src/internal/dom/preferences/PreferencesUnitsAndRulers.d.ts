import type * as Constants from '../Constants';
import { PreferencesBase } from './PreferencesBase';
/**
 * Preferences related to ruler units, type units and resolution
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/preferences/#unitsandrulers}
 * @targetfolder classes/preferences
 * @minVersion 24.0
 */
export class PreferencesUnitsAndRulers extends PreferencesBase {
  /**
   * @ignore
   */
  constructor();
  /**
   * The class name of the referenced object: *"PreferencesUnitsAndRulers"*.
   *
   * @minVersion 24.0
   */
  get typename(): 'PreferencesUnitsAndRulers';
  /**
   * The unit that will be used for the displayed Rulers and consequently considered primary in Photoshop.
   *
   * @minVersion 24.0
   */
  get rulerUnits(): Constants.RulerUnits;
  set rulerUnits(value: Constants.RulerUnits);
  /**
   * The unit type-size that the numeric inputs are assumed to represent.
   *
   * @minVersion 24.0
   */
  get typeUnits(): Constants.TypeUnits;
  set typeUnits(value: Constants.TypeUnits);
  /**
   * The point/pica size
   *
   * @minVersion 24.0
   */
  get pointSize(): Constants.PointType;
  set pointSize(value: Constants.PointType);
}
/** @ignore */
export const preferencesUnitsAndRulers: PreferencesUnitsAndRulers;
