import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { config } from './config/env.js';
import { wsService } from './services/websocketService.js';
import { streamSimulator } from './services/streamSimulatorService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import cameraRoutes from './routes/cameraRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
if (!fs.existsSync(config.storage.uploadsDir)) {
  fs.mkdirSync(config.storage.uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(config.storage.uploadsDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'OpticGuard AI - Automated Visual Intelligence Platform',
    version: '1.0.0-PROD',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    geminiConfigured: !!(config.gemini.apiKey && config.gemini.apiKey.length > 5)
  });
});

// Register API Routes
app.use('/api/cameras', cameraRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// In production or local monolithic mode, serve built client if present
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Initialize WebSocket Service & Stream Simulator
wsService.init(server);
streamSimulator.start();

// Start Server
const PORT = config.port;
server.listen(PORT, config.host, () => {
  console.log(`=======================================================`);
  console.log(` OPTICGUARD AI - Visual Intelligence & Anomaly Platform `);
  console.log(` Mode: ${config.nodeEnv.toUpperCase()} | Host: ${config.host}:${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/health`);
  console.log(` WebSocket: ws://localhost:${PORT}/ws`);
  console.log(` Gemini Model: ${config.gemini.model}`);
  console.log(` Gemini Key: ${config.gemini.apiKey ? 'Configured (Active)' : 'Local Fallback Engine (Active)'}`);
  console.log(`=======================================================`);
});

export { app, server };

