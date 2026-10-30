import { WebSocketServer, WebSocket } from 'ws';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      // Send initial welcome & heartbeat state
      ws.send(JSON.stringify({
        type: 'SYSTEM_CONNECTED',
        timestamp: new Date().toISOString(),
        message: 'Connected to OpticGuard Visual Intelligence Live Stream'
      }));

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch (e) {
          // ignore invalid json
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.warn('WebSocket client error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log('OpticGuard WebSocket Server initialized on /ws');
  }

  broadcast(type, payload) {
    if (!this.wss) return;
    const data = JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  broadcastAlert(incident) {
    this.broadcast('NEW_ANOMALY_INCIDENT', incident);
  }

  broadcastTelemetry(telemetry) {
    this.broadcast('STREAM_TELEMETRY', telemetry);
  }
}

export const wsService = new WebSocketService();

