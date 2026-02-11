import { Logger } from '@adobe-fixed-uxp/uxp-devtools-core/core/common/Logger';

/* eslint-disable vars-on-top */
declare global {
  var UxpLogger: Logger;
}

export function setGlobalUxpLogger() {
  const logger = new Logger();
  logger.level = 2; // warn
  globalThis.UxpLogger = logger;
}

export function setGlobalUxpLoggerLevel(level: 'error' | 'warn' | 'info' | 'debug') {
  const logger = globalThis.UxpLogger;
  if (!logger) {
    throw new Error('UxpLogger is not set');
  }
  const levelNumber = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  }[level];
  if (!levelNumber) {
    throw new Error(`Invalid level: ${level}`);
  }
  logger.level = levelNumber;
}
