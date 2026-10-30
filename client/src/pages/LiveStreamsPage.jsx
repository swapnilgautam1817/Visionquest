import React, { useState } from 'react';
import { Video, Camera, Plus, Trash2, Edit3, Settings, Play, Pause, RefreshCw, Radio } from 'lucide-react';
import LiveCameraGrid from '../components/LiveCameraGrid.jsx';

export default function LiveStreamsPage({ cameras, onInspectCamera, onAddCamera, onDeleteCamera }) {
  const [filterType, setFilterType] = useState('all');

  const filteredCameras = filterType === 'all'
    ? cameras
    : cameras.filter(c => c.type === filterType);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              LIVE TELEMETRY
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {cameras.length} CHANNELS ONLINE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Visual Stream Array & Machine Vision Matrix
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Real-time optical inspection streams, ROI masking, and frame-rate telemetry
          </p>
        </div>

        <button
          onClick={onAddCamera}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stream Source</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Feeds ({cameras.length})
        </button>
        <button
          onClick={() => setFilterType('optical-industrial')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'optical-industrial' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Industrial Optical
        </button>
        <button
          onClick={() => setFilterType('optical-high-res')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'optical-high-res' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          High-Resolution Macro
        </button>
        <button
          onClick={() => setFilterType('optical-thermal-hybrid')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'optical-thermal-hybrid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Thermal / IR Fusion
        </button>
      </div>

      {/* Camera Grid Component */}
      <LiveCameraGrid
        cameras={filteredCameras}
        onInspectClick={onInspectCamera}
        onAddCameraClick={onAddCamera}
      />

      {/* Camera Specs & Hardware Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Camera Hardware Configuration & Sensor Diagnostics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Camera Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Resolution & Sensor</th>
                <th className="py-2.5 px-3">Target FPS</th>
                <th className="py-2.5 px-3">Sensitivity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cameras.map(cam => (
                <tr key={cam.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 text-white font-medium flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cam.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{cam.location}</td>
                  <td className="py-3 px-3 text-slate-300">
                    <div>{cam.resolution}</div>
                    <div className="text-[10px] text-slate-500">{cam.specs}</div>
                  </td>
                  <td className="py-3 px-3 text-cyan-400">{cam.fps} FPS</td>
                  <td className="py-3 px-3 text-slate-300">{Math.round((cam.sensitivity || 0.8) * 100)}%</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                      {cam.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onInspectCamera(cam)}
                      className="px-2.5 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10 rounded mr-2"
                    >
                      Inspect
                    </button>
                    {cameras.length > 1 && (
                      <button
                        onClick={() => onDeleteCamera(cam.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Remove camera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

