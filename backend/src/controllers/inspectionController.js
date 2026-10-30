import { SupabaseService } from '../services/supabaseService.js';
import { GeminiVisionService } from '../services/geminiVisionService.js';
import { wsService } from '../services/websocketService.js';
import { AlertService } from '../services/alertService.js';

export const getInspections = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const list = await SupabaseService.getInspections(limit);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

export const runInspection = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image or video file uploaded' });
    }

    const { cameraId, customApiKey, customModel } = req.body;
    const filePath = req.file.path;
    const originalFilename = req.file.originalname;
    const fileUrl = `/uploads/${req.file.filename}`;

    const cameras = await SupabaseService.getCameras();
    const cam = cameraId ? cameras.find(c => c.id === cameraId) : null;
    const cameraName = cam ? cam.name : 'Ad-hoc Optical Station';

    // Execute Visual Intelligence Engine (Gemini API with local fallback)
    const analysis = await GeminiVisionService.analyzeImage(
      filePath,
      originalFilename,
      customApiKey,
      customModel
    );

    const inspectionRecord = {
      id: `insp-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      cameraId: cameraId || 'adhoc-01',
      cameraName,
      type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      filename: originalFilename,
      fileUrl,
      status: analysis.status,
      confidence: analysis.overallConfidence,
      latencyMs: analysis.processingLatencyMs,
      modelUsed: analysis.engine,
      summary: analysis.summary,
      detectionsCount: (analysis.detections || []).length,
      detections: analysis.detections || [],
      heatmapGrid: analysis.heatmapGrid || []
    };

    // If an anomaly was detected, automatically log an incident and trigger alerts
    if (analysis.isAnomaly && analysis.detections && analysis.detections.length > 0) {
      const topDefect = analysis.detections[0];
      const newIncident = {
        id: `inc-${Date.now().toString().slice(-6)}`,
        cameraId: cameraId || 'adhoc-01',
        cameraName,
        title: topDefect.label,
        category: topDefect.category || 'Surface Flaw',
        severity: topDefect.severity || 'MEDIUM',
        confidence: topDefect.confidence || 0.85,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        details: topDefect.description || analysis.summary,
        suggestedAction: topDefect.remediation || 'Conduct secondary inspection.',
        operator: 'OpticGuard Automated AI',
        fileUrl,
        boundingBoxes: analysis.detections.map(d => ({
          ...d.box,
          label: d.label,
          confidence: d.confidence,
          severity: d.severity
        }))
      };

      await SupabaseService.addIncident(newIncident);
      wsService.broadcastAlert(newIncident);
      await AlertService.dispatchWebhook(newIncident);

      inspectionRecord.linkedIncidentId = newIncident.id;
    }

    await SupabaseService.addInspection(inspectionRecord);
    wsService.broadcast('NEW_INSPECTION', inspectionRecord);

    res.json({
      success: true,
      data: inspectionRecord
    });
  } catch (err) {
    next(err);
  }
};
