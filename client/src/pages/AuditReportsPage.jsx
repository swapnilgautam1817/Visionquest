import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldAlert, Calendar, Printer, Filter } from 'lucide-react';
import ReportExportModal from '../components/ReportExportModal.jsx';

export default function AuditReportsPage({ inspections, incidents, summary }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = statusFilter === 'ALL'
    ? inspections
    : inspections.filter(i => i.status === statusFilter);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              AUDIT TRAIL
            </span>
            <span className="text-xs font-mono text-slate-400">
              ISO-9001 / INDUSTRIAL COMPLIANCE LOGS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Inspection History & Compliance Audit
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Immutable log of all automated machine vision inferences, confidence metrics, and defects
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Download className="w-4 h-4" />
          <span>Export Compliance Report</span>
        </button>
      </div>

      {/* Summary KPI Mini-Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block mb-1">TOTAL AUDITED FRAMES</span>
          <span className="text-xl font-bold text-white font-mono">{inspections.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block mb-1">CONFORMING (PASS)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            {inspections.filter(i => i.status === 'PASSED').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block mb-1">ANOMALIES FLAGGED</span>
          <span className="text-xl font-bold text-rose-400 font-mono">
            {inspections.filter(i => i.status !== 'PASSED').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block mb-1">MEAN LATENCY</span>
          <span className="text-xl font-bold text-cyan-400 font-mono">148 ms</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-mono border-b border-slate-800 pb-2">
        <span className="text-slate-500 mr-2">FILTER:</span>
        {['ALL', 'PASSED', 'ANOMALY_DETECTED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === st
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'ALL' ? 'All Logs' : st === 'PASSED' ? 'Passed (Conforming)' : 'Anomalies Only'}
          </button>
        ))}
      </div>

      {/* Table of Inferences */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Camera / Station</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Inference Latency</th>
                <th className="py-2.5 px-3">Vision Engine Model</th>
                <th className="py-2.5 px-3">Defects Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(insp => {
                const isPassed = insp.status === 'PASSED';
                return (
                  <tr key={insp.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(insp.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {insp.cameraName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                      }`}>
                        {insp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">
                      {Math.round((insp.confidence || 0.95) * 100)}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {insp.latencyMs || 135} ms
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {insp.modelUsed}
                    </td>
                    <td className="py-3 px-3 text-white">
                      {insp.detectionsCount || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showExportModal && (
        <ReportExportModal
          inspections={inspections}
          incidents={incidents}
          summary={summary}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

