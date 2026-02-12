import type { File } from 'uxp';
import type { Channel } from './Channel';
import type { Channels } from './collections/Channels';
import type { ColorSamplers } from './collections/ColorSamplers';
import type { CountItems } from './collections/CountItems';
import type { Guides } from './collections/Guides';
import type { HistoryStates } from './collections/HistoryStates';
import type { LayerComps } from './collections/LayerComps';
import type { Layers } from './collections/Layers';
import type { PathItems } from './collections/PathItems';
import type * as Constants from './Constants';
import type { ExecutionContext } from './CoreModules';
import type { HistoryState } from './HistoryState';
import type { Layer } from './Layer';
import type { BMPSaveOptions, GIFSaveOptions, JPEGSaveOptions, PhotoshopSaveOptions, PNGSaveOptions } from './Objects';
import type { NoColor } from './objects/Colors';
import type { BitmapConversionOptions, IndexedConversionOptions } from './objects/ConversionOptions';
import type { ImagingBounds } from './objects/ImagingBounds';
import type { SolidColor } from './objects/SolidColor';
import type { Selection } from './Selection';
import type { CalculationsOptions } from './types/CalculationsTypes';
import type { GroupLayerCreateOptions, PixelLayerCreateOptions, TextLayerCreateOptions } from './types/LayerTypes';

/**
 * Execution Context with the Document injected for modal execution within Document.suspendHistory
 * @ignore
 */
export interface SuspendHistoryContext extends ExecutionContext {
  document: Document;
}

export interface GenerativeUpscaleOptions {
  /** @minVersion 27.4 */
  scale: number;
}

/**
 * Represents a single Photoshop document that is currently open.
 *
 * You can access instances of documents using one of these methods:
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/}
 *
 * @example
 * ```js
 * const {app, constants} = require('photoshop');
 * // The currently active document from the Photoshop object
 * const currentDocument = app.activeDocument;
 * // Choose one of the open documents from the Photoshop object
 * const secondDocument = app.documents[1];
 * ```
 *
 * @example
 * ```js
 * // You can also create an instance of a document via a UXP File entry
 * let fileEntry = require('uxp').storage.localFileSystem.getFileForOpening();
 * const newDocument = await app.open('/project.psd');
 * ```
 */
export class Document {
  /**
   * The class name of the referenced object: *"Document"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#typename}
   * @minVersion 23.0
   */
  get typename(): 'Document';
  /**
   * The internal ID of this document will remain valid as long as this document is open.
   * It can be used for batchPlay calls to refer to this document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#id}
   * @minVersion 22.5
   */
  get id(): number;
  /**
   * True if the document has been saved since the last change.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#saved}
   * @minVersion 23.0
   */
  get saved(): boolean;
  /**
   * The selected layers in the document.
   *
   * Updates: [(26.9)](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/changelog/#photoshop-269-july-2025)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#activelayers}
   * @minVersion 22.5
   */
  get activeLayers(): Layers;
  /**
   * The artboards in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#artboards}
   * @minVersion 22.5
   */
  get artboards(): Layers;
  /**
   * The name of the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#name}
   * @minVersion 23.0
   */
  get name(): string;
  /**
   * A histogram containing the number of pixels at each color
   * intensity level for the component channel. The array contains 256
   * members.
   *
   * Valid only when mode = `DocumentMode.{RGB,CMYK,INDEXEDCOLOR}`
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#histogram}
   * @minVersion 23.0
   */
  get histogram(): number[];
  /**
   * The state of Quick Mask mode. If true, the app is in Quick Mask mode.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#quickmaskmode}
   * @minVersion 23.0
   */
  get quickMaskMode(): boolean;
  set quickMaskMode(qmMode: boolean);
  /**
   * The collection of Guides present in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#guides}
   * @minVersion 23.0
   */
  get guides(): Guides;
  /**
   * The collection of CountItems present in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#countitems}
   * @minVersion 24.1
   */
  get countItems(): CountItems;
  /**
   * The collection of ColorSamplers present in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#colorsamplers}
   * @minVersion 24.0
   */
  get colorSamplers(): ColorSamplers;
  /**
   * The color mode. To change it, please use Document.changeMode.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#mode}
   * @minVersion 23.0
   */
  get mode(): Constants.DocumentMode;
  /**
   * The bits per color channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#bitsperchannel}
   * @minVersion 23.0
   */
  get bitsPerChannel(): Constants.BitsPerChannelType;
  set bitsPerChannel(bitDepth: Constants.BitsPerChannelType);
  /**
   * Check whether this a [Photoshop cloud document](https://helpx.adobe.com/photoshop/using/cloud-documents-faq.html).
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#clouddocument}
   * @minVersion 23.0
   */
  get cloudDocument(): boolean;
  /**
   * Local directory for this cloud document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#cloudworkareadirectory}
   * @minVersion 23.0
   */
  get cloudWorkAreaDirectory(): string;
  /**
   * The layers in the document at the top level of the layer/group hierarchy.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#layers}
   * @minVersion 22.5
   */
  get layers(): Layers;
  /**
   * The layer comps present in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#layercomps}
   * @minVersion 24.0
   */
  get layerComps(): LayerComps;
  /**
   * Background layer, if it exists.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#backgroundlayer}
   * @minVersion 22.5
   */
  get backgroundLayer(): Layer | null;
  /**
   * Full file system path to this document, or the identifier if it is a cloud document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#path}
   * @minVersion 22.5
   */
  get path(): string;
  /**
   * The collection of paths in this document, as shown in the
   * Paths panel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#pathitems}
   * @minVersion 23.3
   */
  get pathItems(): PathItems;
  /**
   * History states of the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#historystates}
   * @minVersion 22.5
   */
  get historyStates(): HistoryStates;
  /**
   * Currently active history state of the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#activehistorystate}
   * @minVersion 22.5
   */
  get activeHistoryState(): HistoryState;
  /**
   * Selects the given history state to be the active one.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#activehistorystate}
   * @minVersion 22.5
   */
  set activeHistoryState(historyState: HistoryState);
  /**
   * The history state that history brush tool will use as its source.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#activehistorybrushsource}
   * @minVersion 22.5
   */
  get activeHistoryBrushSource(): HistoryState;
  set activeHistoryBrushSource(historyState: HistoryState);
  /**
   * Document title.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#title}
   * @minVersion 22.5
   */
  get title(): string;
  /**
   * Document's resolution (in pixels per inch).
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#resolution}
   * @minVersion 22.5
   */
  get resolution(): number;
  /**
   * Document's width in pixels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#width}
   * @minVersion 22.5
   */
  get width(): number;
  /**
   * Document's height in pixels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#height}
   * @minVersion 22.5
   */
  get height(): number;
  /**
   * The (custom) pixel aspect ratio to use.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#pixelaspectratio}
   * @minVersion 22.5
   */
  get pixelAspectRatio(): number;
  set pixelAspectRatio(newValue: number);
  /**
   * Name of the color profile.
   *
   * Valid only when colorProfileType is `CUSTOM` or `WORKING`, returns "None" otherwise.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#colorprofilename}
   * @minVersion 23.0
   */
  get colorProfileName(): string;
  set colorProfileName(profile: string);
  /**
   * Whether the document uses the working color profile, a custom profile, or no profile.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#colorprofiletype}
   * @minVersion 23.0
   */
  get colorProfileType(): Constants.ColorProfileType;
  set colorProfileType(type: Constants.ColorProfileType);
  /**
   * The object containing the document's currently active selection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#selection}
   * @minVersion 25.0
   */
  readonly selection: Selection;
  /**
   * @ignore
   */
  constructor(id: number);
  /**
   * Closes the document, showing a prompt to save
   * unsaved changes if specified.
   *
   * @param saveDialogOptions By default, prompts a save dialog
   *                    if there are unsaved changes.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#close}
   *
   * @async
   * @minVersion 22.5
   */
  close(saveDialogOptions?: Constants.SaveOptions): Promise<void>;
  /**
   * Close the document, discarding all unsaved changes.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#closewithoutsaving}
   * @minVersion 22.5
   */
  closeWithoutSaving(): void;
  /**
   * Crops the document to the given bounds.
   *
   * @param bounds The crop area bounds.
   * @param angle Angle to rotate the crop area (default: 0).
   * @param width Width of the crop area (default: 0).
   * @param height Height of the crop area (default: 0).
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#crop}
   *
   * @async
   * @minVersion 23.0
   */
  crop(bounds: ImagingBounds, angle?: number, width?: number, height?: number): Promise<void>;
  /**
   * Flatten all layers in the document. The remaining layer will become Background.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#flatten}
   *
   * @async
   * @minVersion 22.5
   */
  flatten(): Promise<void>;
  /**
   * Creates a duplicate of the document, making the duplicate active.
   *
   * The optional parameter `name` provides the name for the duplicated document.
   *
   * The optional parameter `mergeLayersOnly` indicates whether to only duplicate merged layers.
   *
   * @param name Name for the duplicated document.
   * @param mergeLayersOnly Whether to only duplicate merged layers.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#duplicate}
   *
   * @minVersion 23.0
   */
  duplicate(name?: string, mergeLayersOnly?: boolean): Promise<Document>;
  /**
   * Merges all visible layers in the document into a single layer.
   *
   * In contrast to flatten, `mergeVisibleLayers` will not convert the remaining layer
   * to Background if no Background already exists. If not Background, then the name of the
   * merged layer will be either that of the top of the selected layers or the top layer.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#mergevisiblelayers}
   *
   * @async
   * @minVersion 23.0
   */
  mergeVisibleLayers(): Promise<void>;
  /**
   * Splits the document channels into separate, single-channel
   * documents.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#splitchannels}
   *
   * @async
   * @minVersion 23.0
   */
  splitChannels(): Promise<Document[]>;
  /**
   * Expands the document to show clipped sections.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#revealall}
   *
   * @async
   * @minVersion 23.0
   */
  revealAll(): Promise<void>;
  /**
   * Converts all layers to pixel layers.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#rasterizealllayers}
   *
   * @async
   * @minVersion 23.0
   */
  rasterizeAllLayers(): Promise<void>;
  /**
   * Changes the color mode of the document.
   *
   * @param mode The color mode to change to.
   * @param options Optional conversion options.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#changemode}
   *
   * @async
   * @minVersion 23.0
   */
  changeMode(mode: Constants.ChangeMode, options?: BitmapConversionOptions | IndexedConversionOptions): Promise<void>;
  /**
   * Changes the color profile.
   *
   * `destinationProfile` must be either a string that names the color mode,
   * or one of these below, meaning of the working color spaces or Lab color.
   *
   * `"Working RGB", "Working CMYK", "Working Gray", "Lab Color"`
   *
   * @param destinationProfile The profile name or working space.
   * @param intent The rendering intent.
   * @param blackPointCompensation Whether to use black point compensation.
   * @param dither Whether to use dithering.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#convertprofile}
   *
   * @async
   * @minVersion 23.0
   */
  convertProfile(
    destinationProfile: string,
    intent: Constants.Intent,
    blackPointCompensation?: boolean,
    dither?: boolean,
  ): Promise<void>;
  /**
   * Applies trapping to a CMYK document.
   *
   * Valid only when Document.mode is `Constants.DocumentMode.CMYK`
   *
   * @param width The trap width.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#trap}
   *
   * @async
   * @minVersion 23.0
   */
  trap(width: number): Promise<void>;
  /**
   * Changes the size of the document, but does not scale the image.
   * To scale the image size, see resizeImage.
   *
   * @param width Numeric value of new width in pixels.
   * @param height Numeric value of new height in pixels.
   * @param anchor Anchor point for resizing, by default will resize an equal amount on all sides.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#resizecanvas}
   *
   * @example
   * ```js
   * // grow the canvas by 400px
   * const {width, height} = await app.activeDocument;
   * await document.resizeCanvas(width + 400, height + 400);
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  resizeCanvas(width: number, height: number, anchor?: Constants.AnchorPosition): Promise<void>;
  /**
   * Changes the size of the image by scaling the dimensions to meet the targeted number of pixels.
   *
   * @param width Numeric value of new width in pixels.
   * @param height Numeric value of new height in pixels.
   * @param resolution Image resolution in pixels per inch (ppi).
   * @param resampleMethod Method used during image interpolation.
   * @param amount Numeric value that controls the amount of noise value when using preserve details 0..100.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#resizeimage}
   *
   * @example
   * ```js
   * await document.resizeImage(800, 600)
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  resizeImage(
    width?: number,
    height?: number,
    resolution?: number,
    resampleMethod?: Constants.ResampleMethod,
    amount?: number,
  ): Promise<void>;
  /**
   * Trims the area around the image according to the type of pixels given.
   * All sides of the image are targeted by default.
   * Optionally, the sides may be individually specified for exclusion.
   *
   * @param trimType Defaults to the top left pixel color.
   * @param top Trim the top side (default: true).
   * @param left Trim the left side (default: true).
   * @param bottom Trim the bottom side (default: true).
   * @param right Trim the right side (default: true).
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#trim}
   *
   * @example
   * ```js
   * // trim transparent pixels from only the bottom of the image
   * app.activeDocument.trim(constants.TrimType.TRANSPARENT, false, false, true, false);
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  trim(trimType: Constants.TrimType, top?: boolean, left?: boolean, bottom?: boolean, right?: boolean): Promise<void>;
  /**
   * Rotates the image clockwise in given angle, expanding canvas if necessary. (Previously rotateCanvas)
   *
   * @param angles The angle in degrees to rotate.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#rotate}
   *
   * @async
   * @minVersion 23.0
   */
  rotate(angles: number): Promise<void>;
  /**
   * Pastes the contents of the clipboard into the document. If the optional argument is
   * set to true and a selection is active, the contents are pasted into the selection.
   *
   * @param intoSelection Whether to use an active selection as the target for the paste.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#paste}
   *
   * @async
   * @minVersion 23.0
   */
  paste(intoSelection?: boolean): Promise<Layer | null>;
  /**
   * Performs a save of the document. The user will be presented with
   * a Save dialog if the file has yet to be saved on disk.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#save}
   *
   * @example
   * ```js
   * // To save a document in the current location
   * document.save()
   * // Shows the save dialog
   * unsavedDocument.save()
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  save(): Promise<void>;
  /**
   * Save the document to a desired file type.
   *
   * For operations that require a UXP File token, use the
   * [UXP storage APIs](https://www.adobe.com/go/ps-api-uxp-filesystemprovider) to generate one.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#saveas}
   *
   * @example
   * ```js
   * let entry = await require('uxp').storage.localFileSystem.getFileForSaving("target.psd");
   * document.saveAs.psd(entry);
   * // Save as a Copy (High JPG quality)
   * document.saveAs.jpg(entryJpg, {quality: 12}, true);
   * // Save a PSB, with some options:
   * document.saveAs.psb(entryPsb, {embedColorProfile: true});
   * ```
   *
   * @minVersion 23.0
   */
  saveAs: {
    /**
     * Save the document as a PSD file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions PSD specific save options. See SaveOptions/PhotoshopSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    psd: (entry: File, saveOptions?: PhotoshopSaveOptions, asCopy?: boolean) => Promise<void>;
    /**
     * Save the document as a PSB file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions PSD/PSB specific save options. See SaveOptions/PhotoshopSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    psb: (entry: File, saveOptions?: PhotoshopSaveOptions, asCopy?: boolean) => Promise<void>;
    /**
     * @TODO reenable when we get the green-light to script PSDC
     * Save the document into Cloud Documents (PSDC).
     * @param path String title or path (separated by slash '/') location to save to.
     * @param saveOptions PSD/PSB specific save options. See SaveOptions/PhotoshopSaveOptions.
     * @minVersion ?
     */
    /**
     * Save the document as a JPG file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions JPEG specific save options. See SaveOptions/JPEGSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    jpg: (entry: File, saveOptions?: JPEGSaveOptions, asCopy?: boolean) => Promise<void>;
    /**
     * Save the document as a GIF file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions GIF specific save options. See SaveOptions/GIFSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    gif: (entry: File, saveOptions?: GIFSaveOptions, asCopy?: boolean) => Promise<void>;
    /**
     * Save the document as a PNG file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions PNG specific save options. See SaveOptions/PNGSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    png: (entry: File, saveOptions?: PNGSaveOptions, asCopy?: boolean) => Promise<void>;
    /**
     * Save the document as a BMP file.
     * @param entry UXP File token generated from the UXP Storage APIs.
     * @param saveOptions JPEG specific save options. See SaveOptions/BMPSaveOptions.
     * @param asCopy Whether to save as a copy.
     * @minVersion 23.0
     */
    bmp: (entry: File, saveOptions?: BMPSaveOptions, asCopy?: boolean) => Promise<void>;
  };
  /**
   * Duplicates given layer(s), creating all copies above the top most one in layer stack,
   * and returns the newly created layers.
   *
   * @param layers The array of layers to duplicate.
   * @param targetDocument If specified, send the duplicates to a different document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#duplicatelayers}
   *
   * @example
   * ```js
   * // duplicate some layers
   * const layerCopies = await document.duplicateLayers([layer1, layer3])
   * layerCopies.forEach((layer) => { layer.blendMode = 'multiply' })
   * ```
   *
   * @example
   * ```js
   * // ...to another document
   * const finalDoc = await photoshop.open('~/path/to/collated/image.psd')
   * await document.duplicateLayers([logo1, textLayer1], finalDoc)
   * await finalDoc.close(SaveOptions.SAVECHANGES)
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  duplicateLayers(layers: Layer[], targetDocument?: Document): Promise<Layer[]>;
  /**
   * Links layers together if possible, and returns a list of linked layers.
   *
   * @param layers Array of layers to link together.
   * @returns Array of successfully linked layers.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#linklayers}
   * @minVersion 23.0
   */
  linkLayers(layers: Layer[]): Layer[];
  /**
   * General form of the kind-specific methods below. See those methods for more information.
   * Create a new layer of the given kind. With no arguments, a pixel layer will be created.
   *
   * The options object will have properties specific to the kind,
   * though all layers share a basic set of properties common to all.
   *
   * The override signatures below are provided as type guardrails to
   * help ensure the options provided match the layer kind.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createlayer}
   *
   * @example
   * ```js
   * await doc.createLayer(); // defaults to pixel layer
   * await doc.createLayer(
   *   constants.LayerKind.NORMAL, // pixel layer
   *   {name: "myLayer", opacity: 80, blendMode: constants.BlendMode.COLORDODGE}
   * );
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  createLayer(): Promise<Layer | null>;
  /**
   * Create a new pixel layer.
   *
   * @param kind The kind of layer to create.
   * @param options The options for creation, including general layer options and those specific to the layer kind.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createlayer}
   *
   * @async
   * @minVersion 23.0
   */
  createLayer(kind: Constants.LayerKind.NORMAL, options?: PixelLayerCreateOptions): Promise<Layer | null>;
  /**
   * Create a new layer group.
   *
   * @param kind The kind of layer to create.
   * @param options The options for creation, including general layer options and those specific to the layer kind.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createlayer}
   *
   * @example
   * ```js
   * await doc.createLayer(constants.LayerKind.GROUP, {name: "myLayer", opacity: 80});
   * ```
   *
   * @async
   * @minVersion 24.1
   */
  createLayer(kind: Constants.LayerKind.GROUP, options?: GroupLayerCreateOptions): Promise<Layer | null>;
  /**
   * Create a pixel layer using options described by PixelLayerCreateOptions.
   *
   * @param options The options for creation.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createpixellayer}
   *
   * @example
   * ```js
   * await doc.createPixelLayer()
   * await doc.createPixelLayer({name: "myLayer", opacity: 80, fillNeutral: true})
   * ```
   *
   * @async
   * @minVersion 24.1
   */
  createPixelLayer(options?: PixelLayerCreateOptions): Promise<Layer | null>;
  /**
   * Create a text layer using options described by TextLayerCreateOptions.
   *
   * @param options The options for creation.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createtextlayer}
   *
   * @example
   * ```js
   * await doc.createTextLayer()
   * await doc.createTextLayer({name: "myTextLayer", contents: "Hello, World!", fontSize: 32})
   * ```
   *
   * @async
   * @minVersion 24.2
   */
  createTextLayer(options?: TextLayerCreateOptions): Promise<Layer | null>;
  /**
   * Create a layer group using options described by GroupLayerCreateOptions.
   *
   * @param options The options for creation.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#createlayergroup}
   *
   * @example
   * ```js
   * const myEmptyGroup = await doc.createLayerGroup()
   * const myGroup = await doc.createLayerGroup({name: "myLayer", opacity: 80, blendMode: "colorDodge"})
   * const nonEmptyGroup = await doc.createLayerGroup({name: "group", fromLayers: [layer1, layer2]})
   * const selectedGroup = await doc.createLayerGroup({name: "group", fromLayers: doc.activeLayers})
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  createLayerGroup(options?: GroupLayerCreateOptions): Promise<Layer | null>;
  /**
   * Create a layer group from existing layers.
   *
   * @param layers Array of layers to group.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#grouplayers}
   *
   * @example
   * ```js
   * const layers = doc.layers
   * const group = await doc.groupLayers([layers[1], layers[2], layers[4]])
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  groupLayers(layers: Layer[]): Promise<Layer | null>;
  /**
   * Creates a single history state encapsulating everything that is done
   * in the callback, only for this document. All changes to the document should
   * be done in this callback.
   *
   * Note: If you make changes to any other document, those changes will
   * not be suspended in the same history state.
   *
   * The callback is passed in a SuspendHistoryContext object,
   * which contains the current document in a variable `document`.
   *
   * For more info and advanced context, see `core.executeAsModal`
   * API, for which `suspendHistory` is a simple wrapper.
   *
   * @param callback The callback function.
   * @param historyStateName The name for the history state.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#suspendhistory}
   *
   * @example
   * ```js
   * app.activeDocument.suspendHistory(async (context) => {
   *   // context.document below is, in this case, `app.activeDocument`
   *   context.document.activeLayers[0].name = "Changed name";
   * });
   * ```
   *
   * @minVersion 23.0
   */
  suspendHistory(callback: (e: SuspendHistoryContext) => void, historyStateName: string): Promise<void>;
  /**
   * Returns a SolidColor object sampled from the document at the given position.
   *
   * @param position The point to sample `{x: number, y: number}`.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#samplecolor}
   *
   * @example
   * ```js
   * let col = await app.activeDocument.sampleColor({x: 100, y: 100});
   * console.log(col.rgb);
   * // {
   * //   red: 233,
   * //   green: 179,
   * //   blue: 135,
   * //   hexValue: "E9B387"
   * // }
   * ```
   *
   * @param position The point to sample `{x: number, y: number}`.
   * @param position.x The horizontal coordinate in pixels.
   * @param position.y The vertical coordinate in pixels.
   * @returns A SolidColor instance of the sampled pixel.
   *
   * @async
   * @minVersion 24.0
   */
  sampleColor(position: {
    x: number;
    y: number;
  }): Promise<NoColor | SolidColor>;
  /**
   * The Calculations command lets you blend two individual channels from one or more source images. You can then
   * apply the results to a new image or to a new channel or selection in the active image.
   *
   * Performs Image > Calculations on the document. See the CalculationsOptions
   * object for more info and examples.
   *
   * Known issue: currently calculations requires having exactly one unlocked pixel layer being selected otherwise
   * it won't work. In future there should not be any layer requirements since this cannot output into layer.
   *
   * @param calculationsOptions Option object for the calculations.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#calculations}
   *
   * @example
   * ```js
   * const doc = app.activeDocument;
   * const options = {
   *   source1: {
   *     document: doc,
   *     layer: doc.layers[0],
   *     channel: constants.CalculationsChannel.GRAY
   *     invert: true
   *   },
   *   source2: {
   *     document: doc,
   *     layer: constants.CalculationsLayer.MERGED,
   *     channel: doc.channels[2]
   *   },
   *   blending: constants.CalculationsBlendMode.DARKEN,
   *   opacity: 50,
   *   result: constants.CalculationsResult.NEWCHANNEL
   * };
   * doc.calculations(options);
   * ```
   *
   * @async
   * @minVersion 24.5
   */
  calculations(calculationsOptions: CalculationsOptions): Promise<Document | Channel | void>;
  /**
   * All channels in the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#channels}
   * @minVersion 23.0
   */
  get channels(): Channels;
  /**
   * Component channels in the document.
   *
   * Updates: [(24.6)](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/changelog/#246-bug-fixes)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#componentchannels}
   * @minVersion 24.5
   */
  get componentChannels(): Channel[];
  /**
   * Deprecated since these channels are component not composite.
   * Use `componentChannels` above.
   *
   * @deprecated
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#compositechannels}
   * @minVersion 23.0
   */
  get compositeChannels(): Channel[];
  /**
   * Currently active channels of the document.
   *
   * Updates: [(24.6)](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/changelog/#246-bug-fixes)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/document/#activechannels}
   * @minVersion 23.0
   */
  get activeChannels(): Channel[];
  set activeChannels(channels: Channel[]);

  /**
   * Applies generative upscaling to the currently selected layer(s) using AI-powered upscaling technology.
   * @example
   * ```js
   * // Upscale using Firefly model with default options (2x scale)
   * await document.generativeUpscale(constants.GenerativeUpscaleModel.FIREFLY);
   *
   * // Upscale using Firefly model with 4x scale
   * const doc4x = await document.generativeUpscale(constants.GenerativeUpscaleModel.FIREFLY, { scale: 4 });
   * ```
   * @minVersion 27.2
   * @param model The model to use for upscaling.
   * @param options The options for upscaling.
   */
  generativeUpscale(model: Constants.GenerativeUpscaleModel, options: GenerativeUpscaleOptions): Promise<void>;
}
