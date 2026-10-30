import React, { useState } from 'react';
import { X, FileText, Download, Check, Printer } from 'lucide-react';

export default function ReportExportModal({ inspections, incidents, summary, onClose }) {
  const [format, setFormat] = useState('csv');

  const exportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Camera', 'Status', 'Confidence', 'Latency(ms)', 'Model', 'DefectsCount'];
    const rows = inspections.map(i => [
      i.timestamp,
      i.type,
      `"${i.cameraName}"`,
      i.status,
      i.confidence,
      i.latencyMs,
      `"${i.modelUsed}"`,
      i.detectionsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opticguard_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const report = {
      platform: "OpticGuard AI - Automated Visual Intelligence Platform",
      generatedAt: new Date().toISOString(),
      summary,
      incidents,
      inspections
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opticguard_system_dump_${Date.now()}.json`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Export QA Compliance Report
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Visual Inspection Audit & Incident Logs
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">TOTAL AUDITED</span>
              <span className="text-lg font-bold text-white">{inspections.length} frames</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">INCIDENTS INCLUDED</span>
              <span className="text-lg font-bold text-cyan-400">{incidents.length} events</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-400">
              Select Export Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                  format === 'csv'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                CSV Data
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                  format === 'json'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                JSON Payload
              </button>
              <button
                onClick={() => setFormat('print')}
                className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                  format === 'print'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Print / PDF
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={format === 'csv' ? exportCSV : format === 'json' ? exportJSON : handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            >
              {format === 'print' ? <Printer className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{format === 'print' ? 'Print / Save PDF' : 'Download File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

