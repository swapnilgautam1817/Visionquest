import React from 'react';
import { Eye, ShieldAlert, Video, Scan, AlertTriangle, ArrowRight, Zap, Radio } from 'lucide-react';
import AnomalyMetrics from '../components/AnomalyMetrics.jsx';
import AnomalyCharts from '../components/AnomalyCharts.jsx';
import LiveCameraGrid from '../components/LiveCameraGrid.jsx';

export default function DashboardPage({
  summary,
  analytics,
  cameras,
  incidents,
  onNavigateTab,
  onInspectCamera,
  onOpenIncident,
  onAddCamera
}) {
  const recentIncidents = (incidents || []).slice(0, 4);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              MISSION CONTROL
            </span>
            <span className="text-xs font-mono text-slate-400">
              FACILITY: ALPHA-09 INDUSTRIAL CORE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            OpticGuard Visual Intelligence Operations
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Autonomous spatial-temporal anomaly localization, sub-frame defect classification, and real-time incident mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('inspector')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono hover:from-cyan-400 hover:to-blue-500 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Scan className="w-4 h-4" />
            <span>DEEP ANOMALY SCAN</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Metrics */}
      <AnomalyMetrics summary={summary || analytics?.summary} />

      {/* Hourly Velocity & Taxonomy Charts */}
      <AnomalyCharts
        hourlyTrend={analytics?.hourlyTrend}
        categoriesBreakdown={analytics?.summary?.categoriesBreakdown}
        severityBreakdown={analytics?.summary?.severityBreakdown}
      />

      {/* Live Stream Camera Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <LiveCameraGrid
          cameras={cameras}
          onInspectClick={onInspectCamera}
          onAddCameraClick={onAddCamera}
        />
      </div>

      {/* Recent High-Priority Incidents Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Active Incident Queue & Anomaly Feed
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Real-time events awaiting operator sign-off or mitigation
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('incidents')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentIncidents.map((inc) => {
            const isCrit = inc.severity === 'CRITICAL';
            return (
              <div
                key={inc.id}
                onClick={() => onOpenIncident(inc)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/30 px-3 rounded-lg transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    isCrit ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {inc.title}
                      </span>
                      <span className={`px-2 py-0.2 text-[10px] font-mono font-bold rounded ${
                        isCrit ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {inc.details}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                      <span>CAM: {inc.cameraName}</span>
                      <span>•</span>
                      <span>CONFIDENCE: {Math.round((inc.confidence || 0.9) * 100)}%</span>
                      <span>•</span>
                      <span>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full ${
                    inc.status === 'RESOLVED' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                  }`}>
                    {inc.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

