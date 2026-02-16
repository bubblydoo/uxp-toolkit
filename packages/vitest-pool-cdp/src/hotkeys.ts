import type { Buffer } from 'node:buffer';
import type { CdpConnection, RawCdpPoolOptions } from './types';
import readline from 'node:readline';
import { openDevtoolsSessionInChrome } from './open-devtools-session';

interface KeypressEvent { name?: string; ctrl?: boolean; meta?: boolean; shift?: boolean }

export function setupCdpPoolHotkeys(options: {
  hotkeys: RawCdpPoolOptions['hotkeys'];
  getConnection: () => CdpConnection | null;
  log: (...args: unknown[]) => void;
}): (() => void) | null {
  const { hotkeys, getConnection, log } = options;
  if (hotkeys?.enabled === false) {
    return null;
  }
  if (!process.stdin.isTTY) {
    log('Hotkeys enabled, but stdin is not a TTY');
    return null;
  }

  const stdin = process.stdin;
  readline.emitKeypressEvents(stdin);
  const resumedStdin = stdin.isPaused();
  if (resumedStdin) {
    stdin.resume();
  }

  const hadRawMode = !!stdin.isRaw;
  if (!hadRawMode && typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
  }

  log('Hotkeys enabled: press "d" to open Chrome devtools');

  let isOpeningDevtools = false;

  const triggerOpenDevtools = () => {
    if (isOpeningDevtools) {
      return;
    }
    const connection = getConnection();
    if (!connection) {
      console.warn('[vitest-pool-cdp] Could not open devtools: missing CDP URL');
      return;
    }

    const openDevtools = hotkeys?.openDevtools
      ?? ((cdpConnection: CdpConnection) => openDevtoolsSessionInChrome(cdpConnection.url).then(() => {}));

    isOpeningDevtools = true;
    openDevtools(connection).catch((error) => {
      console.error('[vitest-pool-cdp] Failed to open devtools:', error);
    }).finally(() => {
      isOpeningDevtools = false;
    });
  };

  const onKeypress = (_str: string, key: KeypressEvent) => {
    if (!key || key.name !== 'd') {
      return;
    }
    if (key.ctrl || key.meta || key.shift) {
      return;
    }
    triggerOpenDevtools();
  };

  const onData = (chunk: Buffer | string) => {
    const value = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    const trimmed = value.trim();
    // Fallback for environments where keypress listeners are swallowed by readline layers.
    if (trimmed === 'd') {
      triggerOpenDevtools();
    }
  };

  stdin.on('keypress', onKeypress);
  stdin.on('data', onData);

  return () => {
    stdin.off('keypress', onKeypress);
    stdin.off('data', onData);
    if (resumedStdin) {
      stdin.pause();
    }
    if (!hadRawMode && stdin.isTTY && typeof stdin.setRawMode === 'function') {
      stdin.setRawMode(false);
    }
  };
}
