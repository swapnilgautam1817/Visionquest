import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function AnomalyCharts({ hourlyTrend, categoriesBreakdown, severityBreakdown }) {
  const trendData = hourlyTrend && hourlyTrend.length > 0 ? hourlyTrend : [
    { time: '02:00', inspections: 240, anomalies: 3 },
    { time: '04:00', inspections: 290, anomalies: 1 },
    { time: '06:00', inspections: 310, anomalies: 4 },
    { time: '08:00', inspections: 420, anomalies: 6 },
    { time: '10:00', inspections: 480, anomalies: 2 },
    { time: '12:00', inspections: 460, anomalies: 5 },
    { time: '14:00', inspections: 390, anomalies: 2 },
  ];

  const categoryData = Object.entries(categoriesBreakdown || {
    'Structural Defect': 18,
    'Surface Flaw': 12,
    'Thermal Anomaly': 7,
    'Foreign Contaminant': 5,
    'Perimeter Intrusion': 3
  }).map(([name, value]) => ({ name, value }));

  const COLORS = ['#00f0ff', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-400 font-semibold mb-1">{label}</div>
          <div className="text-cyan-400">Inspections: {payload[0]?.value}</div>
          <div className="text-rose-400">Anomalies: {payload[1]?.value}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2-Column: Hourly Trend Area Chart */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Hourly Visual Inspection & Anomaly Velocity
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Live stream frames evaluated per hour
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              Inspections
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Anomalies
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inspectGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="inspections"
                stroke="#00f0ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#inspectGrad)"
              />
              <Area
                type="monotone"
                dataKey="anomalies"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#anomGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 1-Column: Defect Taxonomy Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Defect Taxonomy Classification
          </h3>
          <p className="text-xs font-mono text-slate-400 mb-4">
            Distribution across anomaly categories
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={110} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono text-cyan-400">
                          {payload[0].payload.name}: {payload[0].value} incidents
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity counts pill row */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
          <div className="p-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300">
            <div className="font-bold text-xs">{severityBreakdown?.CRITICAL || 1}</div>
            CRIT
          </div>
          <div className="p-1.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
            <div className="font-bold text-xs">{severityBreakdown?.HIGH || 2}</div>
            HIGH
          </div>
          <div className="p-1.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300">
            <div className="font-bold text-xs">{severityBreakdown?.MEDIUM || 4}</div>
            MED
          </div>
          <div className="p-1.5 rounded bg-slate-800/60 border border-slate-700/40 text-slate-400">
            <div className="font-bold text-xs">{severityBreakdown?.LOW || 5}</div>
            LOW
          </div>
        </div>
      </div>
    </div>
  );
}

