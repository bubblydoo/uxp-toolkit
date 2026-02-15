import type { Layer } from '../Layer';
/**
 * A collections class allowing for array access into the applications
 * list of layers on a document,
 * while also providing familiar methods from ExtendScript, like `getByName`
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layers/}
 *
 * @example
 * ```javascript
 * // Iterate through all the top layers of frontmost document
 * app.activeDocument.layers.forEach(h => console.log(h.name));
 * ```
 */
export class Layers extends Array<Layer> {
  /** @ignore */
  private proxy;
  /** @ignore */
  private parentDocID;
  /** @ignore */
  private layerIDs;
  /**
   * Used to access the layers in the collection.
   * @minVersion 22.5
   */
  [index: number]: Layer;
  /** @ignore */
  constructor(parentDoc: number, layerIDs: number[]);
  /** @ignore */
  handler(): {
    get: (obj: any, key: any) => any;
  };
  /**
   * Find the first layer with the matching name.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layers/#getbyname}
   * @minVersion 22.5
   */
  getByName(name: string): Layer;
  /**
   * Number of {@link Layer} elements in this collection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layers/#length}
   * @minVersion 22.5
   */
  get length(): number;
  /**
   * The name for this object collection: Layers.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layers/#typename}
   * @minVersion 22.5
   */
  get typename(): 'Layers';
  /**
   * Create a new layer.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/layers/#add}
   *
   * @example
   * ```javascript
   * let newDoc1 = await app.activeDocument.layers.add();
   * ```
   *
   * @async
   * @minVersion 22.5
   */
  add(): Promise<Layer | null>;
}
