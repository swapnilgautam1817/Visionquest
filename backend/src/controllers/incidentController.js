import { SupabaseService } from '../services/supabaseService.js';
import { wsService } from '../services/websocketService.js';
import { AlertService } from '../services/alertService.js';

export const getIncidents = async (req, res, next) => {
  try {
    const { status, severity, category } = req.query;
    let list = await SupabaseService.getIncidents();

    if (status) {
      list = list.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }
    if (severity) {
      list = list.filter(i => i.severity.toUpperCase() === severity.toUpperCase());
    }
    if (category) {
      list = list.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incidents = await SupabaseService.getIncidents();
    const incident = incidents.find(i => i.id === req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
};

export const createIncident = async (req, res, next) => {
  try {
    const { cameraId, title, category, severity, confidence, details, suggestedAction, operator, boundingBoxes } = req.body;
    
    const cameras = await SupabaseService.getCameras();
    const cam = cameras.find(c => c.id === cameraId);

    const newIncident = {
      id: `inc-${Date.now().toString().slice(-6)}`,
      cameraId: cameraId || 'manual-entry',
      cameraName: cam ? cam.name : (req.body.cameraName || 'Manual Inspection Station'),
      title: title || 'Visual Anomaly Flagged',
      category: category || 'Structural Defect',
      severity: severity || 'MEDIUM',
      confidence: parseFloat(confidence || '0.85'),
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      details: details || 'Anomaly identified by inspection operator.',
      suggestedAction: suggestedAction || 'Verify with secondary optical sensor.',
      operator: operator || 'System Visual AI',
      resolvedAt: null,
      resolutionNotes: null,
      boundingBoxes: boundingBoxes || []
    };

    await SupabaseService.addIncident(newIncident);
    wsService.broadcastAlert(newIncident);
    await AlertService.dispatchWebhook(newIncident);

    res.status(201).json({ success: true, data: newIncident });
  } catch (err) {
    next(err);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const updated = await SupabaseService.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    wsService.broadcast('INCIDENT_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const resolveIncident = async (req, res, next) => {
  try {
    const { resolutionNotes, operator } = req.body;
    const updated = await SupabaseService.updateIncident(req.params.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: resolutionNotes || 'Resolved and verified by operator.',
      resolvedBy: operator || 'QA Supervisor'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    wsService.broadcast('INCIDENT_RESOLVED', updated);
    res.json({ success: true, message: 'Incident resolved', data: updated });
  } catch (err) {
    next(err);
  }
};
