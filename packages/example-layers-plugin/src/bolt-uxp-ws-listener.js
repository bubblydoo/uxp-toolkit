/* eslint-disable no-undef */
/* eslint-disable no-console */
const prefix = '[⚡ Bolt Hot Reload]';

const log = console.log.bind(console, prefix);

function listenForHotReload() {
  const reconnect = (reason) => {
    log(
      `Disconnected from hot reload server (${reason}). Attempting to reconnect in 3 seconds...`,
    );
    setTimeout(listenForHotReload, 3000);
  };
  const ws = new WebSocket(`ws://localhost:${BOLT_UXP_HOT_RELOAD_PORT}`);
  ws.onclose = () => reconnect('closed');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === BOLT_UXP_MANIFEST_ID && data.status === 'updated') {
      log('Hot reloading...');
      location.reload();
    }
  };
  ws.onopen = () => {
    log('Connected to server');
  };
}

listenForHotReload();
