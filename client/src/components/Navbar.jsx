import React, { useState, useEffect } from 'react';
import { Shield, Eye, Bell, Volume2, VolumeX, Radio, Cpu, RefreshCw } from 'lucide-react';
import { socket } from '../services/socket.js';
import { AudioAlertSynthesizer } from './AudioAlertPlayer.jsx';

export default function Navbar({ activeIncidentsCount, criticalCount, soundEnabled, setSoundEnabled, onQuickScanClick }) {
  const [connected, setConnected] = useState(socket.isConnected);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const unbind = socket.on('connection_change', ({ connected }) => {
      setConnected(connected);
    });

    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => {
      unbind();
      clearInterval(timer);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      AudioAlertSynthesizer.playAlert('LOW');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0e17]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Platform title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Shield className="w-5 h-5 text-cyan-400" />
          <Eye className="w-2.5 h-2.5 text-white absolute" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-base bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              OPTICGUARD AI
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded">
              v1.0-PROD
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Visual Intelligence & Anomaly Platform
          </p>
        </div>
      </div>

      {/* Center live telemetry indicators */}
      <div className="hidden md:flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
          <span className="text-slate-300">{connected ? 'CORE ONLINE' : 'DISCONNECTED'}</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>EDGE TPU: ACTIVE</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="text-slate-400">{timeStr}</div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-3">
        {/* Quick Scan CTA */}
        <button
          onClick={onQuickScanClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:from-cyan-400 hover:to-blue-500 transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Inspection</span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute audio alarms' : 'Enable audio alarms'}
          className={`p-2 rounded-lg border transition ${
            soundEnabled
              ? 'bg-slate-800/80 border-slate-700 text-cyan-400 hover:bg-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Critical Alerts Badge */}
        <div className="relative">
          <div className={`p-2 rounded-lg border flex items-center justify-center ${
            criticalCount > 0 
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <Bell className="w-4 h-4" />
          </div>
          {activeIncidentsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-600 text-white rounded-full shadow-lg">
              {activeIncidentsCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

