import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:5000';

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Gateway Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'OpticGuard Edge Gateway & Stream Server',
    backendServiceUrl: BACKEND_SERVICE_URL,
    timestamp: new Date().toISOString()
  });
});

// Proxy route info for frontend clients
app.get('/api/gateway/info', (req, res) => {
  res.json({
    gatewayPort: PORT,
    connectedBackend: BACKEND_SERVICE_URL,
    supabaseConfigured: !!process.env.SUPABASE_URL,
    websocketPath: '/ws'
  });
});

// Real-Time WebSocket Relay
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.send(JSON.stringify({
    type: 'GATEWAY_CONNECTED',
    server: 'OpticGuard Edge Stream Relay',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (msg) => {
    // Broadcast message to other connected clients
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    }
  });

  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

// Broadcast periodic stream telemetry
let tick = 0;
setInterval(() => {
  tick++;
  const payload = JSON.stringify({
    type: 'STREAM_TELEMETRY',
    payload: {
      gatewayTick: tick,
      connectedClients: clients.size,
      globalBandwidthMbps: (42.5 + Math.sin(tick) * 3).toFixed(1),
      timestamp: new Date().toISOString()
    }
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}, 2000);

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` OPTICGUARD AI - EDGE GATEWAY & STREAM SERVER        `);
  console.log(` Port: ${PORT} | Target Backend: ${BACKEND_SERVICE_URL}`);
  console.log(` WebSocket Stream: ws://${HOST}:${PORT}/ws           `);
  console.log(`=======================================================`);
});

