import { wsService } from './websocketService.js';
import { db } from '../database/db.js';
import { config } from '../config/env.js';

export class StreamSimulatorService {
  constructor() {
    this.intervalId = null;
    this.frameCount = 0;
  }

  start() {
    if (!config.streams.enableSimulated) return;

    // Periodically pulse camera feeds and simulate live frame analysis
    this.intervalId = setInterval(() => {
      this.frameCount++;
      const cameras = db.getCameras();
      
      const streamStates = cameras.map(cam => {
        // Subtle simulated latency and jitter
        const jitter = Math.floor(Math.sin(this.frameCount + cam.id.charCodeAt(cam.id.length - 1)) * 12);
        const fpsJitter = (Math.sin(this.frameCount * 0.2) * 1.5).toFixed(1);
        const activeFps = Math.max(10, cam.fps + parseFloat(fpsJitter));

        return {
          id: cam.id,
          name: cam.name,
          status: cam.status,
          currentFps: activeFps,
          latencyMs: 38 + jitter,
          bitrateKbps: 4200 + jitter * 20,
          packetsDropped: 0,
          activeAnomalies: cam.activeAnomalies || 0,
          timestamp: new Date().toISOString()
        };
      });

      wsService.broadcastTelemetry({
        streams: streamStates,
        totalActiveCameras: cameras.filter(c => c.status === 'active').length,
        globalInferenceRate: '124 fps',
        edgeGpuLoad: `${42 + (this.frameCount % 15)}%`
      });

    }, 2000);

    console.log('OpticGuard Stream Simulator active (2000ms heartbeat)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const streamSimulator = new StreamSimulatorService();

