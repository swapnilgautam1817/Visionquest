import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ShieldAlert, Wrench, User, Calendar, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function IncidentLogModal({ incident, onClose, onResolve }) {
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('QA Engineer 01');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!incident) return null;

  const handleResolve = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onResolve(incident.id, {
        resolutionNotes: notes || 'Verified with secondary optical inspection and signed off.',
        operator
      });
      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      alert(`Error resolving incident: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCritical = incident.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Incident #{incident.id}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isCritical ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {incident.severity}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {incident.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Camera: {incident.cameraName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Defect Title & Forensic finding */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
              AI VISUAL ANOMALY DIAGNOSIS
            </div>
            <h4 className="text-lg font-bold text-white">
              {incident.title}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {incident.details}
            </p>
          </div>

          {/* Corrective Action recommendation */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            <Wrench className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold mb-1">
                PRESCRIBED REMEDIATION
              </div>
              <p className="text-sm text-slate-300">
                {incident.suggestedAction || 'Halt cell and calibrate optical alignment.'}
              </p>
            </div>
          </div>

          {/* Telemetry specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">CATEGORY</span>
              <span className="text-white font-semibold">{incident.category}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">CONFIDENCE</span>
              <span className="text-cyan-400 font-semibold">
                {Math.round((incident.confidence || 0.9) * 100)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">TIMESTAMP</span>
              <span className="text-slate-300">
                {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">OPERATOR</span>
              <span className="text-slate-300 truncate block">{incident.operator}</span>
            </div>
          </div>

          {/* Resolution section or display */}
          {incident.status === 'RESOLVED' ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>RESOLVED AT {new Date(incident.resolvedAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-300">
                Notes: {incident.resolutionNotes || 'Verified & signed off.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleResolve} className="space-y-4 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
                Incident Triage & Resolution Sign-off
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Operator Signature / ID
                </label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. Lead Tech #4"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Remediation & Sign-off Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  placeholder="Describe corrective actions taken (e.g. Component replaced, laser recalibrated, line restarted)."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 transition shadow-lg shadow-emerald-900/30"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

