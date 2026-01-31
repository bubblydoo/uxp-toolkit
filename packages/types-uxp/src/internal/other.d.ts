/**
 * Event interface received when handling a 'uxpcommand' event.
 * @see https://developer.adobe.com/photoshop/uxp/2022/guides/how-to/#how-to-get-notified-that-your-panel-is-opening-or-closing
 */
export interface UxpCommandEvent extends Event {
  commandId: string;
}
