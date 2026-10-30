import { db } from '../database/db.js';

export const getAnalytics = (req, res) => {
  const summary = db.getAnalyticsSummary();

  // Hourly timeline distribution for charts
  const now = new Date();
  const hourlyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hourLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const inspected = 280 + Math.floor(Math.sin(i * 1.3) * 60) + (i % 3) * 15;
    const anomalies = Math.max(0, Math.floor(Math.sin(i * 0.8 + 2) * 5) + (i % 2 === 0 ? 2 : 1));
    hourlyTrend.push({
      time: hourLabel,
      inspections: inspected,
      anomalies: anomalies,
      defectRate: parseFloat(((anomalies / inspected) * 100).toFixed(2))
    });
  }

  // Camera health and throughput metrics
  const cameras = db.getCameras();
  const cameraMetrics = cameras.map(cam => ({
    id: cam.id,
    name: cam.name,
    fps: cam.fps,
    status: cam.status,
    anomalies24h: cam.activeAnomalies * 3 + 2,
    uptimePercent: 99.8
  }));

  res.json({
    success: true,
    data: {
      summary,
      hourlyTrend,
      cameraMetrics
    }
  });
};

