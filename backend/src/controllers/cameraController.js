import { SupabaseService } from '../services/supabaseService.js';
import { v4 as uuidv4 } from 'uuid';
import { wsService } from '../services/websocketService.js';

export const getCameras = async (req, res, next) => {
  try {
    const cameras = await SupabaseService.getCameras();
    res.json({ success: true, count: cameras.length, data: cameras });
  } catch (err) {
    next(err);
  }
};

export const getCameraById = async (req, res, next) => {
  try {
    const cameras = await SupabaseService.getCameras();
    const camera = cameras.find(c => c.id === req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera stream not found' });
    }
    res.json({ success: true, data: camera });
  } catch (err) {
    next(err);
  }
};

export const createCamera = async (req, res, next) => {
  try {
    const { name, location, type, streamUrl, fps, resolution, fov, sensitivity, roiZone, specs } = req.body;
    if (!name || !location) {
      return res.status(400).json({ success: false, error: 'Name and location are required' });
    }

    const newCamera = {
      id: `cam-${uuidv4().slice(0, 6)}`,
      name,
      location,
      type: type || 'optical-industrial',
      streamUrl: streamUrl || `simulated://opticguard/${name.toLowerCase().replace(/\s+/g, '-')}`,
      status: 'active',
      fps: parseInt(fps || '24', 10),
      resolution: resolution || '1920x1080',
      fov: fov || 'Standard 75°',
      sensitivity: parseFloat(sensitivity || '0.80'),
      roiZone: roiZone || { x: 10, y: 10, width: 80, height: 80 },
      specs: specs || 'Industrial CMOS Machine Vision Sensor',
      lastPing: new Date().toISOString(),
      activeAnomalies: 0
    };

    await SupabaseService.addCamera(newCamera);
    wsService.broadcast('CAMERA_ADDED', newCamera);

    res.status(201).json({ success: true, data: newCamera });
  } catch (err) {
    next(err);
  }
};

export const updateCamera = async (req, res, next) => {
  try {
    const updated = await SupabaseService.updateCamera(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    wsService.broadcast('CAMERA_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCamera = async (req, res, next) => {
  try {
    const ok = await SupabaseService.deleteCamera(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    wsService.broadcast('CAMERA_DELETED', { id: req.params.id });
    res.json({ success: true, message: 'Camera removed successfully' });
  } catch (err) {
    next(err);
  }
};
