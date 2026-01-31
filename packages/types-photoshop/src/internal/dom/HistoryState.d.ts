import type { Document } from './Document';
/**
 * Represents a single history state in the History panel.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/}
 *
 * @example
 * ```javascript
 * // Access current history state
 * const doc = app.activeDocument;
 * const currentState = doc.activeHistoryState;
 * console.log(`Current state: ${currentState.name}`);
 * ```
 *
 * @example
 * ```javascript
 * // List all history states
 * const doc = app.activeDocument;
 * doc.historyStates.forEach((state, index) => {
 *   console.log(`${index}: ${state.name} (snapshot: ${state.snapshot})`);
 * });
 * ```
 *
 * @minVersion 22.5
 */
export class HistoryState {
  /**
   * @ignore
   */
  constructor(id: number, docId: number);
  /**
   * The class name of the referenced object: *"HistoryState"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#typename}
   * @minVersion 23.0
   */
  get typename(): 'HistoryState';
  /**
   * For use with batchPlay operations. This history ID, along with its document ID
   * can be used to represent this history state for the lifetime of this document.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#id}
   * @minVersion 22.5
   */
  get id(): number;
  /**
   * The ID of the document of this history state.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#docid}
   * @minVersion 22.5
   */
  get docId(): number;
  /**
   * The name of this history state as it appears on history panel.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#name}
   * @minVersion 22.5
   */
  get name(): string;
  /**
   * Owner document of this history state.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#parent}
   * @minVersion 22.5
   */
  get parent(): Document;
  /**
   * Whether this history state is a snapshot or an automatically generated history state.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/historystate/#snapshot}
   * @minVersion 22.5
   */
  get snapshot(): boolean;
}
