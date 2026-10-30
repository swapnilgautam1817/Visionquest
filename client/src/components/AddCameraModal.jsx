import React, { useState } from 'react';
import { X, Camera, Plus, Check } from 'lucide-react';

export default function AddCameraModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('optical-industrial');
  const [streamUrl, setStreamUrl] = useState('');
  const [fps, setFps] = useState('30');
  const [resolution, setResolution] = useState('1920x1080');
  const [specs, setSpecs] = useState('Sony IMX Global Shutter / Telecentric Optics');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        name,
        location,
        type,
        streamUrl: streamUrl || `simulated://opticguard/${name.toLowerCase().replace(/\s+/g, '-')}`,
        fps: parseInt(fps, 10),
        resolution,
        specs
      });
      onClose();
    } catch (err) {
      alert(`Failed to add camera: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Register New Camera Feed
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Connect RTSP, USB/Webcam, or Simulated Stream
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Camera / Station Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="e.g. Injection Molding Cell 02"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Physical Location / Facility Bay *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="e.g. Facility Alpha - Line 3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Sensor Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="optical-industrial">Optical Industrial (CMOS)</option>
                <option value="optical-high-res">High-Resolution Macro</option>
                <option value="optical-thermal-hybrid">Thermal & IR Hybrid</option>
                <option value="optical-wide">Wide-Angle Surveillance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Target Frame Rate
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="15">15 FPS</option>
                <option value="24">24 FPS (Industrial)</option>
                <option value="30">30 FPS (Standard)</option>
                <option value="60">60 FPS (High Speed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Stream Source URL (RTSP / WebRTC / USB / Simulated)
            </label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="rtsp://192.168.1.100:554/live or leave blank for Simulated Feed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Optics Specifications & Lens Model
            </label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="e.g. Basler ace 2 Pro / 12mm Focal Length"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

