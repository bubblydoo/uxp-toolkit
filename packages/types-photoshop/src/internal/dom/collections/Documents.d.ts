import type { Document } from '../Document';
import type { Photoshop } from '../Photoshop';
import type { DocumentCreateOptions } from '../types/DocumentTypes';
/**
 * A collections class allowing for array access into the application's
 * list of documents that are currently open,
 * while also providing familiar methods from ExtendScript, like `getByName`.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/}
 *
 * @example
 * ```javascript
 * // Iterate through all the documents
 * app.documents.forEach(h => console.log(h.title));
 * ```
 */
export class Documents extends Array<Document> {
  /** @ignore */
  private proxy;
  /** @ignore */
  constructor();
  /**
   * Used to access the documents in the collection.
   * @minVersion 22.5
   */
  [index: number]: Document;
  /** @ignore */
  handler(): {
    get: (obj: any, key: any) => any;
  };
  /**
   * Find the first document with the matching name.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/#getbyname}
   * @minVersion 22.5
   */
  getByName(name: string): Document;
  /**
   * Number of {@link Document} elements in this collection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/#length}
   * @minVersion 22.5
   */
  get length(): number;
  /**
   * The owner application of this Documents collection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/#parent}
   * @minVersion 22.5
   */
  get parent(): Photoshop;
  /**
   * The name for this object collection: Documents.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/#typename}
   * @minVersion 22.5
   */
  get typename(): 'Documents';
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
   * resolution 300 pixels per inch, mode: @RGBColorMode and a fill of white with
   * no transparency.
   *
   * @param options @DocumentCreateOptions
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/documents/#add}
   *
   * @example
   * ```javascript
   * // "Default Photoshop Size" 7x5 inches at 300ppi
   * let newDoc1 = await app.documents.add();
   * let newDoc2 = await app.documents.add({
   *    width: 800,
   *    height: 600,
   *    resolution: 300,
   *    mode: "RGBColorMode",
   *    fill: "transparent"
   * });
   * let newDoc3 = await app.documents.add({preset: "My Default Size 1"});
   * ```
   *
   * @async
   * @minVersion 22.5
   */
  add(options?: DocumentCreateOptions): Promise<Document | null>;
}
