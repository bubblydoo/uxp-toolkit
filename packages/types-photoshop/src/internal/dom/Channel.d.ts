import type * as Constants from './Constants';
import type { Document } from './Document';
import type { SolidColor } from './objects/SolidColor';
/**
 * Represents a channel in a Photoshop document.
 * You can access instances of channels using one of these methods:
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/}
 *
 * @example
 * ```javascript
 * // An array of component channels in the document
 * const componentChannels = app.activeDocument.componentChannels
 *
 * // An array of active (selected) channels in the document
 * const activeChannels = app.activeDocument.activeChannels
 *
 * // Reference a document's Red channel
 * const redChannel = app.activeDocument.channels[0]
 * ```
 * @minVersion 23.0
 */
export abstract class Channel {
  /**
   * The containing document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#parent}
   * @minVersion 23.0
   */
  get parent(): Document;
  /**
   * The type or kind of the channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#kind}
   * @minVersion 23.0
   */
  get kind(): Constants.ChannelType;
  set kind(kind: Constants.ChannelType);
  /**
   * The visibility of the channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#visible}
   * @minVersion 23.0
   */
  get visible(): boolean;
  set visible(visible: boolean);
  /**
   * Duplicates the channel to the parent document, or a target document
   * if specified.
   *
   * @param targetDocument if specified, duplicate to a different document target.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#duplicate}
   *
   * @example
   * ```javascript
   * // duplicate the channel
   * await channel.duplicate()
   *
   * // duplicate to a different, compatible document
   * const newDoc = psApp.documents[1]
   * await channel.duplicate(newDoc)
   * ```
   *
   * @async
   * @minVersion 23.0
   */
  duplicate(targetDocument?: Document): Promise<void>;
  /**
   * The name of the channel. For component channels this name can be localized.
   *
   * ***Fixes in Photoshop 24.6***
   * - *For component channel it is no longer converted into lowercase and is same as in UI*
   * - *For component channel it will throw an error if channel no longer exist in document*
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#name}
   * @minVersion 23.0
   */
  abstract get name(): string;
  abstract set name(name: string);
  /**
   * A histogram containing the number of pixels at each color
   * intensity level for this channel. The array contains 256
   * members. The target channel must be visible.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#histogram}
   * @minVersion 23.0
   */
  abstract get histogram(): number[];
  /**
   * The color of the channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#color}
   * @minVersion 23.0
   */
  abstract get color(): SolidColor;
  abstract set color(color: SolidColor);
  /**
   * The opacity or solidity of the channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#opacity}
   * @minVersion 23.0
   */
  abstract get opacity(): number;
  abstract set opacity(opacity: number);
  /**
   * Deletes the channel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#remove}
   * @minVersion 23.0
   */
  abstract remove(): Promise<void>;
  /**
   * Merges a Spot Color channel into the component channels.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/channel/#merge}
   * @minVersion 23.0
   */
  abstract merge(): Promise<void>;
}
