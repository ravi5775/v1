import { WebSocketServer } from 'ws';

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', ws => {
      console.log('[WebSocket] Client connected for real-time sync.');
      ws.on('close', () => {
          console.log('[WebSocket] Client disconnected.');
      });
  });
};

/**
 * Broadcasts a message to all connected clients.
 * @param {Object} payload - { type: string, data?: any }
 */
export const broadcast = (payload) => {
  if (!wss) {
      console.warn("[WebSocket] Server not initialized.");
      return;
  }
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
      }
  });
};