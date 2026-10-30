import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { db } from '../database/db.js';

export class SupabaseService {
  static async testConnection() {
    const supabase = getSupabase();
    if (!supabase) {
      return { connected: false, message: 'Supabase URL or keys not configured in environment' };
    }

    try {
      const { data, error } = await supabase.from('cameras').select('id').limit(1);
      if (error) throw error;
      return { connected: true, message: 'Supabase connection verified successfully', count: data?.length || 0 };
    } catch (err) {
      return { connected: false, message: err.message };
    }
  }

  // --- Cameras ---
  static async getCameras() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cameras').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            name: c.name,
            location: c.location,
            type: c.type,
            streamUrl: c.stream_url,
            status: c.status,
            fps: c.fps,
            resolution: c.resolution,
            fov: c.fov,
            roiZone: c.roi_zone,
            sensitivity: c.sensitivity,
            specs: c.specs,
            activeAnomalies: c.active_anomalies || 0,
            lastPing: c.last_ping
          }));
        }
      } catch (e) {
        console.warn('Supabase getCameras error, using local db:', e.message);
      }
    }
    return db.getCameras();
  }

  static async addCamera(camera) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          id: camera.id,
          name: camera.name,
          location: camera.location,
          type: camera.type,
          stream_url: camera.streamUrl,
          status: camera.status,
          fps: camera.fps,
          resolution: camera.resolution,
          fov: camera.fov,
          roi_zone: camera.roiZone,
          sensitivity: camera.sensitivity,
          specs: camera.specs,
          active_anomalies: camera.activeAnomalies || 0
        };
        await supabase.from('cameras').insert(payload);
      } catch (e) {
        console.warn('Supabase addCamera error:', e.message);
      }
    }
    return db.addCamera(camera);
  }

  static async updateCamera(id, updates) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {};
        if (updates.name) payload.name = updates.name;
        if (updates.location) payload.location = updates.location;
        if (updates.status) payload.status = updates.status;
        if (updates.activeAnomalies !== undefined) payload.active_anomalies = updates.activeAnomalies;
        await supabase.from('cameras').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateCamera error:', e.message);
      }
    }
    return db.updateCamera(id, updates);
  }

  static async deleteCamera(id) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('cameras').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCamera error:', e.message);
      }
    }
    return db.deleteCamera(id);
  }

  // --- Incidents ---
  static async getIncidents() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('incidents').select('*').order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(i => ({
            id: i.id,
            cameraId: i.camera_id,
            cameraName: i.camera_name,
            title: i.title,
            category: i.category,
            severity: i.severity,
            confidence: i.confidence,
            status: i.status,
            timestamp: i.timestamp,
            details: i.details,
            suggestedAction: i.suggested_action,
            operator: i.operator,
            resolvedAt: i.resolved_at,
            resolutionNotes: i.resolution_notes,
            resolvedBy: i.resolved_by,
            fileUrl: i.file_url,
            boundingBoxes: i.bounding_boxes || []
          }));
        }
      } catch (e) {
        console.warn('Supabase getIncidents error, using local db:', e.message);
      }
    }
    return db.getIncidents();
  }

  static async addIncident(incident) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          id: incident.id,
          camera_id: incident.cameraId,
          camera_name: incident.cameraName,
          title: incident.title,
          category: incident.category,
          severity: incident.severity,
          confidence: incident.confidence,
          status: incident.status,
          timestamp: incident.timestamp,
          details: incident.details,
          suggested_action: incident.suggestedAction,
          operator: incident.operator,
          file_url: incident.fileUrl,
          bounding_boxes: incident.boundingBoxes || []
        };
        await supabase.from('incidents').insert(payload);
      } catch (e) {
        console.warn('Supabase addIncident error:', e.message);
      }
    }
    return db.addIncident(incident);
  }

  static async updateIncident(id, updates) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {};
        if (updates.status) payload.status = updates.status;
        if (updates.resolvedAt) payload.resolved_at = updates.resolvedAt;
        if (updates.resolutionNotes) payload.resolution_notes = updates.resolutionNotes;
        if (updates.resolvedBy) payload.resolved_by = updates.resolvedBy;
        await supabase.from('incidents').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateIncident error:', e.message);
      }
    }
    return db.updateIncident(id, updates);
  }

  // --- Inspections ---
  static async getInspections(limit = 100) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('inspections').select('*').order('timestamp', { ascending: false }).limit(limit);
        if (!error && data && data.length > 0) {
          return data.map(ins => ({
            id: ins.id,
            timestamp: ins.timestamp,
            cameraId: ins.camera_id,
            cameraName: ins.camera_name,
            type: ins.type,
            filename: ins.filename,
            fileUrl: ins.file_url,
            status: ins.status,
            confidence: ins.confidence,
            latencyMs: ins.latency_ms,
            modelUsed: ins.model_used,
            summary: ins.summary,
            detectionsCount: ins.detections_count,
            detections: ins.detections || [],
            heatmapGrid: ins.heatmap_grid || []
          }));
        }
      } catch (e) {
        console.warn('Supabase getInspections error, using local db:', e.message);
      }
    }
    return db.getInspections(limit);
  }

  static async addInspection(inspection) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          id: inspection.id,
          camera_id: inspection.cameraId,
          camera_name: inspection.cameraName,
          type: inspection.type,
          filename: inspection.filename,
          file_url: inspection.fileUrl,
          status: inspection.status,
          confidence: inspection.confidence,
          latency_ms: inspection.latencyMs,
          model_used: inspection.modelUsed,
          summary: inspection.summary,
          detections_count: inspection.detectionsCount,
          detections: inspection.detections || [],
          heatmap_grid: inspection.heatmapGrid || [],
          linked_incident_id: inspection.linkedIncidentId || null,
          timestamp: inspection.timestamp
        };
        await supabase.from('inspections').insert(payload);
      } catch (e) {
        console.warn('Supabase addInspection error:', e.message);
      }
    }
    return db.addInspection(inspection);
  }

  // --- Settings ---
  static async getSettings() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'global-config').single();
        if (!error && data) {
          return {
            systemName: data.system_name,
            facilityCode: data.facility_code,
            activeModel: data.active_model,
            anomalyConfidenceThreshold: data.anomaly_confidence_threshold,
            autoEscalateCritical: data.auto_escalate_critical,
            audioAlerts: data.audio_alerts,
            webhookUrl: data.webhook_url
          };
        }
      } catch (e) {
        console.warn('Supabase getSettings error, using local db:', e.message);
      }
    }
    return db.getSettings();
  }

  static async updateSettings(updates) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          system_name: updates.systemName,
          active_model: updates.activeModel,
          anomaly_confidence_threshold: updates.anomalyConfidenceThreshold,
          auto_escalate_critical: updates.autoEscalateCritical,
          audio_alerts: updates.audioAlerts,
          webhook_url: updates.webhookUrl,
          updated_at: new Date().toISOString()
        };
        await supabase.from('settings').update(payload).eq('id', 'global-config');
      } catch (e) {
        console.warn('Supabase updateSettings error:', e.message);
      }
    }
    return db.updateSettings(updates);
  }
}

