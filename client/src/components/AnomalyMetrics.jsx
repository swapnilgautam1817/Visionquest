import React from 'react';
import { Eye, AlertOctagon, Activity, Zap, ShieldCheck } from 'lucide-react';

export default function AnomalyMetrics({ summary }) {
  const s = summary || {
    totalInspections: 3845,
    anomaliesFound: 45,
    activeIncidents: 2,
    criticalCount: 1,
    defectRate: 1.17,
    averageLatencyMs: 135
  };

  const cards = [
    {
      title: 'TOTAL INSPECTIONS',
      value: s.totalInspections.toLocaleString(),
      change: '+184 / hour',
      icon: Eye,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      title: 'ANOMALY DEFECT RATE',
      value: `${s.defectRate}%`,
      change: '-0.3% vs yesterday',
      icon: Activity,
      color: s.defectRate > 2.0 ? 'text-rose-400' : 'text-emerald-400',
      bgColor: s.defectRate > 2.0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      borderColor: s.defectRate > 2.0 ? 'border-rose-500/20' : 'border-emerald-500/20'
    },
    {
      title: 'ACTIVE INCIDENTS',
      value: s.activeIncidents,
      change: `${s.criticalCount} Critical Severity`,
      icon: AlertOctagon,
      color: s.activeIncidents > 0 ? 'text-amber-400' : 'text-slate-400',
      bgColor: s.activeIncidents > 0 ? 'bg-amber-500/10' : 'bg-slate-800/20',
      borderColor: s.activeIncidents > 0 ? 'border-amber-500/20' : 'border-slate-800'
    },
    {
      title: 'AVG INFERENCE LATENCY',
      value: `${s.averageLatencyMs} ms`,
      change: 'Sub-frame edge speed',
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl bg-slate-900/60 border ${card.borderColor} backdrop-blur-sm relative overflow-hidden flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
                {card.change}
              </div>
            </div>

            {/* Subtle glow bar at top */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.bgColor}`} />
          </div>
        );
      })}
    </div>
  );
}

