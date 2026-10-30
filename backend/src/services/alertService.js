import http from 'http';
import https from 'https';
import { config } from '../config/env.js';

export class AlertService {
  static async dispatchWebhook(incident) {
    const webhookUrl = config.alerts.webhookUrl;
    if (!webhookUrl || webhookUrl.trim() === '' || webhookUrl.includes('demo-endpoint')) {
      console.log(`[AlertService] Demo webhook simulated for Incident #${incident.id} (${incident.severity})`);
      return { success: true, simulated: true };
    }

    try {
      const payload = JSON.stringify({
        source: "OpticGuard AI - Automated Visual Intelligence Platform",
        event: "ANOMALY_INCIDENT_FLAGGED",
        incidentId: incident.id,
        camera: incident.cameraName,
        category: incident.category,
        severity: incident.severity,
        confidence: incident.confidence,
        timestamp: incident.timestamp,
        details: incident.details,
        suggestedAction: incident.suggestedAction,
        dashboardUrl: `http://localhost:${config.port}/incidents`
      });

      const parsedUrl = new URL(webhookUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      return new Promise((resolve) => {
        const req = client.request(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 5000
        }, (res) => {
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode });
        });

        req.on('error', (err) => {
          console.warn('[AlertService] Webhook dispatch error:', err.message);
          resolve({ success: false, error: err.message });
        });

        req.write(payload);
        req.end();
      });
    } catch (err) {
      console.warn('[AlertService] Failed to dispatch webhook:', err.message);
      return { success: false, error: err.message };
    }
  }
}

