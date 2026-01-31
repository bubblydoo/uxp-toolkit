import type { Channel } from '../Channel';
import type { Document } from '../Document';

/**
 * A collections class allowing for array access into a document's channels,
 * while also providing familiar methods from ExtendScript, like `getByName`
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/}
 *
 * @example
 * ```javascript
 * // Iterate through all channels in the document
 * app.activeDocument.channels.forEach(h => console.log(h.name));
 * ```
 *
 * ***Fixes in Photoshop 24.6***
 * - *Component channels should work now correctly in non-English localizations*
 * - *Channel should be now returned correctly in Bitmap and Indexed Color modes*
 * @minVersion 23.0
 */
export class Channels extends Array<Channel> {
  /** @ignore */
  readonly _docId: number;
  /** @ignore */
  private proxy;
  /**
   * Used to access the channels in the collection
   */
  [index: number]: Channel;
  /** @ignore */
  constructor(docId: number);
  /** @ignore */
  handler(): {
    get: (obj: Channels, key: string | symbol) => any;
  };
  /**
   * Create a new alpha channel in this document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#add}
   * @minVersion 23.0
   */
  add(): Channel;
  /**
   * Find the first channel with the matching name.
   *
   * ***Fixes in Photoshop 24.6***
   * - *Non-English locales return correctly for component channels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#getbyname}
   * @minVersion 23.0
   */
  getByName(name: string): Channel;
  /**
   * Remove all Alpha channels in the parent document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#removeall}
   * @minVersion 23.0
   */
  removeAll(): void;
  /**
   * Number of Channel elements in this collection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#length}
   * @minVersion 23.0
   */
  get length(): number;
  /**
   * The owner document of this Channel collection.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#parent}
   * @minVersion 23.0
   */
  get parent(): Document;
  /**
   * The name for this object collection: Channels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channels/#typename}
   * @minVersion 23.0
   */
  get typename(): 'Channels';
}
