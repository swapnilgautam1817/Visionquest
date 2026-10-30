import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root and local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(s => s.trim()),

  // Supabase Backend & Database Config
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Google Gemini Visual Intelligence Engine
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },

  // Visual Intelligence Inference & Anomaly Thresholds
  thresholds: {
    anomalyConfidence: parseFloat(process.env.ANOMALY_CONFIDENCE_THRESHOLD || '0.65'),
    heatmapResolution: parseInt(process.env.HEATMAP_RESOLUTION || '32', 10),
    maxDetectionsPerFrame: parseInt(process.env.MAX_DETECTIONS_PER_FRAME || '8', 10),
    enableGpuSimulation: process.env.ENABLE_GPU_ACCELERATION_SIMULATION !== 'false',
  },

  // Stream & Telemetry Settings
  streams: {
    enableSimulated: process.env.ENABLE_SIMULATED_STREAMS !== 'false',
    fps: parseInt(process.env.STREAM_FPS || '15', 10),
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '10000', 10),
  },

  // Incident Escalation & Notification Dispatch
  alerts: {
    soundEnabled: process.env.ALERT_SOUND_ENABLED !== 'false',
    autoNotifySeverity: process.env.INCIDENT_AUTO_NOTIFY_SEVERITY || 'HIGH',
    webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
  },

  // Storage & Persistence
  storage: {
    uploadsDir: path.resolve(__dirname, '../../uploads'),
    dbFile: path.resolve(__dirname, '../database/opticguard.db.json'),
    maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10),
  }
};
