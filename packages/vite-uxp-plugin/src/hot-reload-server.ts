/* eslint-disable no-console */
import * as http from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';

const prefix = '[⚡ Uxp Vite Hot Reload]';

export interface HotReloadServer {
  triggerReload: (id: string) => void;
}

export function createHotReloadServer(hotReloadPort: number): HotReloadServer {
  const server = http.createServer((req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Vite Uxp Plugin Hot Reload Server: Not Found');
  });

  const wss = new WebSocketServer({ server });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log(`${prefix} Client connected`);
    clients.add(ws);
    ws.on('message', message => console.log('Received:', message));
    ws.on('close', () => {
      console.log(`${prefix} Client disconnected`);
      clients.delete(ws);
    });
  });

  server.listen(hotReloadPort, () => {
    console.log(`${prefix} Hot reload server started on port ${hotReloadPort}`);
  });

  return {
    triggerReload: (id: string) => {
      const message = JSON.stringify({
        id,
        status: 'updated',
      });
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
      console.log(`${prefix} Triggered reload for ${clients.size} ${clients.size === 1 ? 'client' : 'clients'}`);
    },
  };
}
