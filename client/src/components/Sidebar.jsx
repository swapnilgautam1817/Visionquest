import React from 'react';
import { LayoutDashboard, Video, Scan, AlertTriangle, FileText, Settings, Radio } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeIncidentsCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'cameras', label: 'Visual Stream Grid', icon: Video, badge: '4 LIVE' },
    { id: 'inspector', label: 'Anomaly Inspector', icon: Scan, glow: true },
    { id: 'incidents', label: 'Incident Alarms', icon: AlertTriangle, count: activeIncidentsCount },
    { id: 'reports', label: 'Audit & Reports', icon: FileText },
    { id: 'settings', label: 'Engine & Config', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070a10] flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-mono tracking-wider uppercase text-slate-500 mb-2">
            Navigation Hub
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800 rounded-full animate-pulse">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Real-time System Telemetry Box */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              INFERENCE
            </span>
            <span className="text-cyan-400 font-bold">124 FPS</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[78%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>TPU LOAD: 48%</span>
            <span>MEM: 1.4 GB</span>
          </div>
        </div>
      </div>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>FACILITY: ALPHA-09</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          SYNCED
        </span>
      </div>
    </aside>
  );
}

