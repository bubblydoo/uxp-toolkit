import { uxpEntrypointsSchema } from "@bubblydoo/uxp-toolkit";
import { entrypoints } from "uxp";

const manifestId = uxpEntrypointsSchema.parse(entrypoints)._pluginInfo.id;

declare global {
  var BOLT_UXP_HOT_RELOAD_PORT: number;
}

const prefix = "[⚡ Bolt Hot Reload]";

const log = console.log.bind(console, prefix);

const listenForHotReload = () => {
  if (typeof BOLT_UXP_HOT_RELOAD_PORT === "undefined") {
    log("BOLT_UXP_HOT_RELOAD_PORT is not defined");
    return;
  }
  const reconnect = (reason: string) => {
    log(
      `Disconnected from hot reload server (${reason}). Attempting to reconnect in 3 seconds...`,
    );
    setTimeout(listenForHotReload, 3000);
  };
  const ws = new WebSocket(`ws://localhost:${BOLT_UXP_HOT_RELOAD_PORT}`);
  ws.onclose = () => reconnect("closed");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === manifestId && data.status === "updated") {
      log("Hot reloading...");
      location.reload();
    }
  };
  ws.onopen = () => {
    log("Connected to server");
  };
};

listenForHotReload();
