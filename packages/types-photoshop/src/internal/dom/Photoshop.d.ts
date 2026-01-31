import type { File } from 'uxp';
import type { Action, ActionSet } from './Actions';
import type { Documents } from './collections/Documents';
import type { TextFonts } from './collections/TextFonts';
import type { ColorSampler } from './ColorSampler';
import type * as Constants from './Constants';
import type { Document } from './Document';
import type { Guide } from './Guide';
import type { Layer } from './Layer';
import type { LayerComp } from './LayerComp';
import type { PathPointInfo } from './objects/PathPointInfo';
import type { SolidColor } from './objects/SolidColor';
import type { SubPathInfo } from './objects/SubPathInfo';
import type { Tool } from './objects/Tool';
import type { Preferences } from './preferences/Preferences';
import type { Selection } from './Selection';
import type { DocumentCreateOptions } from './types/DocumentTypes';

/**
 * The top level application object, root of the Photoshop DOM.
 *
 * From here you can access open documents, tools, UI elements and run commands or menu items.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/}
 *
 * @example
 * ```js
 * const {app} = require('photoshop');
 * ```
 */
export class Photoshop {
  /**
   * @ignore
   */
  constructor();
  currentDialogMode: Constants.DialogModes;
  /**
   * Allows for polyfills into the Document class
   */
  Document: Document;
  /**
   * Allows for polyfills into the Layer class
   */
  Layer: Layer;
  /**
   * Allows for polyfills into the Action Set class
   */
  ActionSet: ActionSet;
  /**
   * Allows for polyfills into the Action class
   */
  Action: Action;
  /**
   * Allows for polyfills into the Guide class
   */
  Guide: Guide;
  /**
   * Allows for polyfills into the Application object
   */
  Photoshop: Photoshop;
  /**
   * Allows for polyfills into the LayerComp class
   */
  LayerComp: LayerComp;
  /**
   * Allows for polyfills into the Selection class
   */
  Selection: Selection;

  PathPointInfo: PathPointInfo;

  SubPathInfo: SubPathInfo;

  ColorSampler: ColorSampler;
  /**
   * The class name of the referenced object: *"Photoshop"*.
   * @minVersion 23.0
   */
  get typename(): 'Photoshop';
  /**
   * Disabled validation checks, use at your own risk!
   */
  set validation(enable: boolean);
  /**
   * Exposes SolidColor class for constructing objects
   */
  SolidColor: typeof SolidColor;
  /**
   * Contains Photoshop preferences grouped into several categories similar to the Preferences dialog.
   * @minVersion 24.0
   */
  get preferences(): Preferences;
  /**
   * The dialog mode for the application, which controls what types of
   * dialogs should be displayed when your code is interacting with Photoshop.
   * @minVersion 23.0
   */
  get displayDialogs(): Constants.DialogModes;
  set displayDialogs(mode: Constants.DialogModes);
  /**
   * The current document that has the application's focus.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#activedocument}
   * @minVersion 23.0
   */
  get activeDocument(): Document;
  /**
   * Set the current active document to the provided Document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#activedocument}
   * @minVersion 23.0
   */
  set activeDocument(doc: Document);
  /**
   * List of installed color profiles, for RGB and Gray modes.
   * @param colorMode Specify which color mode's profiles to list. (default: "RGB", options: "Gray")
   * @minVersion 24.1
   */
  getColorProfiles: (colorMode?: string) => string[];
  /**
   * Current selected tool. For now, the Tool class is an object with
   * only an `id` field. In the future, we aim to provide tools with their own classes.
   * @minVersion 23.0
   */
  get currentTool(): Tool;
  /**
   * Returns the action tree shown in Actions panel, as an array of ActionSets, each containing Actions.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#actiontree}
   * @minVersion 23.0
   */
  get actionTree(): ActionSet[];
  /**
   * A list of the documents currently open.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#documents}
   * @minVersion 23.0
   */
  get documents(): Documents;
  /**
   * The foreground color (used to paint, fill, and stroke selections). [(24.2)](/ps_reference/changelog#other-fixes)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#foregroundcolor}
   * @minVersion 23.0
   */
  get foregroundColor(): SolidColor;
  set foregroundColor(color: SolidColor);
  /**
   * Convert the given value from one unit to another. Available units are:
   * Constants.Units.{CM, MM, INCHES, PIXELS, POINTS, PICAS}.
   * Use {@link Document.resolution} when converting from or to PIXELS.
   * For example, use this routine for converting a document's width from pixels to inches.
   *
   * ```javascript
   * // convert the current document's width to inches
   * const exportDoc = psApp.activeDocument;
   * let widthInInches = psApp.convertUnits(exportDoc.width,
   *                                        Constants.Units.PIXELS,
   *                                        Constant.Units.INCHES,
   *                                        exportDoc.resolution);
   *
   * ```
   * @param fromValue The value that is to be converted.
   * @param fromUnits The unit that the fromValue is in. Use {@link Constants.Units} for valid values.
   * @param toUnits The unit that the return value is in. Use {@link Constants.Units} for valid values.
   * @param resolution The pixels per inch value to use when converting to and from pixel values.
   * @minVersion 23.4
   */
  convertUnits: (fromValue: number, fromUnits: Constants.Units, toUnits: Constants.Units, resolution?: number) => number;
  /**
   * The background color and color style for documents. [(24.2)](/ps_reference/changelog#other-fixes)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#backgroundcolor}
   * @minVersion 23.0
   */
  get backgroundColor(): SolidColor;
  set backgroundColor(color: SolidColor);
  /**
   * The fonts installed on this system.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#fonts}
   * @minVersion 23.0
   */
  get fonts(): TextFonts;
  /**
   * Shows an alert in Photoshop with the given message.
   *
   * @param message The message to display in the alert.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#showalert}
   * @minVersion 23.0
   */
  showAlert: (message: string) => Promise<void>;
  /**
   * At the heart of all our APIs is batchPlay. It is the evolution of executeAction. It accepts
   * ActionDescriptors deserialized from JS objects, and can play multiple descriptors sequentially
   * without updating the UI. This API is subject to change and may be accessible in other ways in the future.
   *
   * @param commands Array of action descriptors to execute.
   * @param options Options for batchPlay execution.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#batchplay}
   * @minVersion 23.0
   */
  batchPlay: (commands: any, options: any) => Promise<Array<import('./CoreModules').ActionDescriptor>>;
  /**
   * Brings application to focus, useful when your script ends, or requires an input.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#bringtofront}
   * @minVersion 23.0
   */
  bringToFront: () => void;
  /**
   * Opens the specified document and returns the model.
   *
   * Note that this API requires a UXPFileEntry object as its argument.
   *
   * @param entry File entry to open, or undefined to show the open dialog.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#open}
   *
   * @example
   * ```js
   * // Open a file given entry
   * let entry = await require('uxp').storage.localFileSystem.getFileForOpening()
   * const document = await app.open(entry);
   * ```
   *
   * @example
   * ```js
   * // Show open file dialog
   * const document = await app.open();
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  open: (entry?: File) => Promise<Document>;
  /**
   * Create a new document.
   *
   * No options will create a document of 7 x 5 inches at 300 pixels per inch.
   * This is the same as the "Default Photoshop Size" preset.
   *
   * An object with a 'preset' string parameter can be used to specify any of
   * the other presets that come installed with Photoshop or created by users.
   *
   * An object with one or more parameters can also be supplied. Any parameter
   * missing will be set to the default of: width 2100 pixels, height 1500 pixels,
   * resolution 300 pixels per inch, mode: RGB, and a fill of white with
   * no transparency.
   *
   * Updates: [(26.9)](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/changelog/#photoshop-269-july-2025)
   *
   * @param options An object literal containing the option values.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#createdocument}
   *
   * @example
   * ```js
   * // "Default Photoshop Size" 7x5 inches at 300ppi
   * let defaultDoc = await app.createDocument({
   *   preset: "Default Photoshop Size"
   * });
   * ```
   *
   * @example
   * ```js
   * let transparentDoc = await app.createDocument({
   *   width: 800, height: 600, resolution: 300, mode: "RGBColorMode", fill: "transparent"
   * });
   * ```
   *
   * @example
   * ```js
   * const redColor = new SolidColor();
   * redColor.rgb.green = 0;
   * redColor.rgb.blue = 0;
   * let fillColorDoc = await app.createDocument({
   *   mode: "RGBColorMode", fillColor: redColor
   * });
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  createDocument: (options?: DocumentCreateOptions) => Promise<Document | null>;
  /**
   * Force an update to the following panels: Layers, Channels, and Paths.
   *
   * The primary use case is within the handler function of a slider control.
   * Normally, the panels will not update until after the handle is released.
   *
   * Note: this function will have no apparent effect outside of a tracking context like a slider handle.
   * Inside a plain loop (encapsulated in `executeAsModal`),
   * a slight pause can be used to demonstrate the need to refresh.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/photoshop/#updateui}
   *
   * @example
   * ```js
   * // Inside slider handler function.
   * await app.activeDocument.createPixelLayer();
   * await app.updateUI();
   * ```
   *
   * @async
   * @minVersion 26.0
   */
  updateUI: () => Promise<void>;
}

/**
 * Root of the DOM, the `app` object where you can access application settings,
 * open documents and reach rest of the APIs
 */
export const app: Photoshop;
