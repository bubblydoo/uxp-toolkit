import type { Document } from './Document';
import type { Layer } from './Layer';
import type { LayerCompRecaptureOptions } from './types/LayerCompTypes';
/**
 * Represents a single layer comp in the document.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/}
 *
 * @example
 * ```javascript
 * // Access layer comps
 * const doc = app.activeDocument;
 * const layerComp = doc.layerComps[0];
 * console.log(`Layer comp: ${layerComp.name}`);
 * ```
 *
 * @example
 * ```javascript
 * // Create and apply a layer comp
 * const doc = app.activeDocument;
 * const comp = await doc.layerComps.add("My Design", "A great design", true, true, true);
 * await comp.apply();
 * ```
 *
 * @minVersion 24.0
 */
export class LayerComp {
  /**
   * @ignore
   */
  constructor(id: number, docId: number);
  /**
   * @ignore
   */
  private get _directRef();
  /**
   * The class name of the referenced LayerComp object
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#typename}
   * @minVersion 24.0
   */
  get typename(): 'LayerComp';
  /**
   * For use with batchPlay operations. This layer comp ID, along with its document ID
   * can be used to represent this layer comp for the lifetime of this document or the layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#id}
   * @minVersion 24.0
   */
  get id(): number;
  /**
   * The ID of the document of this layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#docid}
   * @minVersion 24.0
   */
  get docId(): number;
  /**
   * Owner document of this layer comp
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#parent}
   * @minVersion 24.0
   */
  get parent(): Document;
  /**
   * The name of the layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#name}
   * @minVersion 24.0
   */
  get name(): string;
  set name(name: string);
  /**
   * The description of the layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#comment}
   * @minVersion 24.0
   */
  get comment(): string | null;
  set comment(comment: string | null);
  /**
   * If true, the layer comp is currently selected in the Layer Comps panel.
   *
   * Note: selected does not mean that this layer comp is applied to document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#selected}
   * @minVersion 24.0
   */
  get selected(): boolean;
  /**
   * If true, the layer comp will remember the layers' appearance (layer style) settings.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#appearance}
   * @minVersion 24.0
   */
  get appearance(): boolean;
  set appearance(value: boolean);
  /**
   * If true, the layer comp will remember layers' positions.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#position}
   * @minVersion 24.0
   */
  get position(): boolean;
  set position(value: boolean);
  /**
   * If true, the layer comp will remember layers' visibilities.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#visibility}
   * @minVersion 24.0
   */
  get visibility(): boolean;
  set visibility(value: boolean);
  /**
   * If true, the layer comp will remember which of the Smart Object's layer comps are set in the Properties panel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#childcomp}
   * @minVersion 24.0
   */
  get childComp(): boolean;
  set childComp(value: boolean);
  /**
   * Applies the layer comp to the document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#apply}
   *
   * @example
   * ```javascript
   * // Apply the first layer comp
   * await app.activeDocument.layerComps[0].apply();
   * ```
   *
   * @async
   * @minVersion 24.0
   */
  apply(): Promise<void>;
  /**
   * Updates the recorded states of the layers for this layer comp.
   *
   * Applies to all layers and all properties supported by this layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#recapture}
   *
   * @example
   * ```javascript
   * // Recapture all properties for all layers
   * await app.activeDocument.layerComps[0].recapture();
   * ```
   *
   * @async
   * @minVersion 24.0
   */
  recapture(): Promise<void>;
  /**
   * Updates the recorded states of the layers for this layer comp.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#recapture}
   *
   * @example
   * ```javascript
   * // Recapture only visibility for specific layers
   * const layers = [app.activeDocument.layers[0], app.activeDocument.layers[1]];
   * await app.activeDocument.layerComps[0].recapture({ visibility: true }, layers);
   * ```
   *
   * @async
   * @param argument what properties to recapture.
   * @param layers if this argument is passed then only specified layers will be recaptured.
   */
  recapture(arg: LayerCompRecaptureOptions, layers?: Layer[]): Promise<void>;
  /**
   * Deletes this object from document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#remove}
   *
   * @example
   * ```javascript
   * // Delete a layer comp
   * await app.activeDocument.layerComps[0].remove();
   * ```
   *
   * @async
   * @minVersion 24.0
   */
  remove(): Promise<void>;
  /**
   * Resets the layer comp state to the document state.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#resetlayercomp}
   *
   * @example
   * ```javascript
   * // Reset layer comp to current document state
   * await app.activeDocument.layerComps[0].resetLayerComp();
   * ```
   *
   * @async
   * @minVersion 24.0
   */
  resetLayerComp(): Promise<void>;
  /**
   * Duplicates this layer comp
   *
   * @returns newly created layer comp
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layercomp/#duplicate}
   *
   * @example
   * ```javascript
   * // Duplicate a layer comp
   * const newComp = await app.activeDocument.layerComps[0].duplicate();
   * newComp.name = "Copy of " + app.activeDocument.layerComps[0].name;
   * ```
   *
   * @async
   * @minVersion 24.0
   */
  duplicate(): Promise<LayerComp>;
}
