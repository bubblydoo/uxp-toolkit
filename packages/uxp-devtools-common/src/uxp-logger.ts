import { Logger } from '@adobe-fixed-uxp/uxp-devtools-core/core/common/Logger';

/* eslint-disable vars-on-top */
declare global {
  var UxpLogger: Logger;
}

export function setGlobalUxpLogger() {
  globalThis.UxpLogger = new Logger();
}
