import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Search, Filter, ArrowUpRight, Wrench, Clock } from 'lucide-react';

export default function IncidentsPage({ incidents, onSelectIncident, onResolveIncident }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = (incidents || []).filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.cameraName.toLowerCase().includes(search.toLowerCase()) ||
      inc.category.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">
              ALARM MANAGEMENT
            </span>
            <span className="text-xs font-mono text-slate-400">
              SAFETY, STRUCTURAL & QUALITY ESCALATIONS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Visual Anomaly Incident Queue
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Audit trail of flagged deviations, operator triage, and corrective actions
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anomaly title, camera, category..."
            className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded transition ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">STATUS:</span>
          {['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards / List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 font-mono text-sm">
            No incidents found matching current filters.
          </div>
        ) : (
          filtered.map(inc => {
            const isCrit = inc.severity === 'CRITICAL';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                    isCrit 
                      ? 'bg-rose-500/20 text-rose-400' 
                      : inc.severity === 'HIGH' 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {isResolved ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition">
                        {inc.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCrit ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        isResolved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-3xl line-clamp-2">
                      {inc.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                      <span>ID: #{inc.id}</span>
                      <span>•</span>
                      <span>CAMERA: {inc.cameraName}</span>
                      <span>•</span>
                      <span>CATEGORY: {inc.category}</span>
                      <span>•</span>
                      <span>CONFIDENCE: {Math.round((inc.confidence || 0.9) * 100)}%</span>
                      <span>•</span>
                      <span>{new Date(inc.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono group-hover:bg-cyan-500 group-hover:text-slate-950 transition font-bold">
                    <span>{isResolved ? 'View Log' : 'Triage & Resolve'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

