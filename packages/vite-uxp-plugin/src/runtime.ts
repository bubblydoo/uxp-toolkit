/* eslint-disable no-console */
import { entrypoints } from 'adobe:uxp';

const manifestId = entrypoints._pluginInfo.id;

declare global {
  // eslint-disable-next-line vars-on-top
  var UXP_HOT_RELOAD_PORT: number;
}

const prefix = '[⚡ Uxp Vite Hot Reload]';

const log = console.log.bind(console, prefix);

function listenForHotReload() {
  if (typeof UXP_HOT_RELOAD_PORT === 'undefined') {
    log('UXP_HOT_RELOAD_PORT is not defined');
    return;
  }
  const reconnect = (reason: string) => {
    log(
      `Disconnected from hot reload server (${reason}). Attempting to reconnect in 3 seconds...`,
    );
    setTimeout(listenForHotReload, 3000);
  };
  const ws = new WebSocket(`ws://localhost:${UXP_HOT_RELOAD_PORT}`);
  ws.onclose = () => reconnect('closed');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === manifestId && data.status === 'updated') {
      log('Hot reloading...');
      location.reload();
    }
  };
  ws.onopen = () => {
    log('Connected to server');
  };
}

listenForHotReload();
