import React, { useState } from 'react';
import { Upload, Scan, Flame, AlertOctagon, CheckCircle, ShieldAlert, Cpu, Sparkles, RefreshCw, FileImage, Layers } from 'lucide-react';
import InspectionCanvas from '../components/InspectionCanvas.jsx';
import { api } from '../services/api.js';

// Pre-built base64 SVGs / sample images for 1-click testing
const SAMPLE_PRESETS = [
  {
    name: 'Micro-Weld Fracture (Critical)',
    category: 'Structural Defect',
    desc: 'Titanium weld with stress crack along heat-affected boundary',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%230c1017"/><path d="M50 250 Q200 240 400 250 T750 250" stroke="%23334155" stroke-width="60" stroke-linecap="round"/><path d="M50 250 Q200 240 400 250 T750 250" stroke="%2364748b" stroke-width="30" stroke-linecap="round"/><circle cx="430" cy="245" r="15" fill="%23ef4444" opacity="0.3"/><path d="M410 235 L425 248 L418 255 L445 260" stroke="%23ef4444" stroke-width="3" fill="none"/><text x="40" y="50" fill="%2300f0ff" font-family="monospace" font-size="16">OPTICGUARD MACHINE VISION // SAMPLE WELD #04</text></svg>'
  },
  {
    name: 'PCB Solder Bridge (High)',
    category: 'Surface Flaw',
    desc: 'Excess solder bridging pins 14 and 15 on IC footprint',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23062817"/><g stroke="%2300ff88" stroke-width="2" opacity="0.3"><line x1="100" y1="100" x2="300" y2="100"/><line x1="300" y1="100" x2="300" y2="400"/><line x1="300" y1="400" x2="700" y2="400"/></g><rect x="350" y="180" width="120" height="140" fill="%231e293b" stroke="%23475569" stroke-width="4"/><rect x="330" y="220" width="25" height="12" fill="%2394a3b8"/><rect x="330" y="240" width="25" height="12" fill="%2394a3b8"/><rect x="325" y="218" width="18" height="36" fill="%23f97316" opacity="0.85"/><text x="40" y="50" fill="%2300ff88" font-family="monospace" font-size="16">CLEANROOM BAY 7 // PCB TRACE INSPECTION</text></svg>'
  },
  {
    name: 'Conforming Reference Unit (Pass)',
    category: 'Conforming Baseline',
    desc: 'Golden sample meeting 100% geometric and surface tolerances',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%230c121e"/><circle cx="400" cy="250" r="120" fill="%231e293b" stroke="%2300f0ff" stroke-width="3"/><circle cx="400" cy="250" r="60" fill="%230f172a" stroke="%2338bdf8" stroke-width="2"/><text x="40" y="50" fill="%2338bdf8" font-family="monospace" font-size="16">GOLDEN COMPONENT REFERENCE // ZERO DEFECT</text></svg>'
  }
];

export default function AnomalyInspectorPage({ cameras, onInspectionDone }) {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_PRESETS[0].url);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetCameraId, setTargetCameraId] = useState(cameras[0]?.id || 'cam-01');
  const [modelChoice, setModelChoice] = useState('gemini-2.5-flash');
  const [customKey, setCustomKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [inspectionResult, setInspectionResult] = useState({
    status: 'ANOMALY_DETECTED',
    isAnomaly: true,
    overallConfidence: 0.94,
    latencyMs: 148,
    modelUsed: 'Google Gemini (gemini-2.5-flash)',
    summary: 'High-precision micro-fissure detected along titanium welded joint. Structural discontinuity exceeds 1.2mm tolerance.',
    detections: [
      {
        label: 'Micro-Fissure / Stress Crack',
        category: 'Structural Defect',
        severity: 'CRITICAL',
        confidence: 0.94,
        box: { ymin: 0.42, xmin: 0.48, ymax: 0.58, xmax: 0.60 },
        description: 'Linear fatigue fracture penetrating nominal weld bead envelope.',
        remediation: 'Immediately halt conveyor pallet indexing and trigger ultrasonic verification.'
      }
    ],
    heatmapGrid: []
  });

  const [selectedDetectionIdx, setSelectedDetectionIdx] = useState(0);

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
  };

  // Run AI Inspection
  const handleRunScan = async () => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        // Convert current SVG/data URL to a Blob
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        formData.append('file', blob, 'sample_inspection_frame.png');
      }

      formData.append('cameraId', targetCameraId);
      if (customKey) formData.append('customApiKey', customKey);
      if (modelChoice) formData.append('customModel', modelChoice);

      const resp = await api.analyzeInspection(formData);
      if (resp.success) {
        setInspectionResult(resp.data);
        if (resp.data.fileUrl) {
          setSelectedImage(resp.data.fileUrl);
        }
        if (onInspectionDone) onInspectionDone(resp.data);
      }
    } catch (err) {
      alert(`Visual Intelligence Scan error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isAnomaly = inspectionResult?.isAnomaly || inspectionResult?.status === 'ANOMALY_DETECTED';

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              DEEP VISUAL INSPECTION
            </span>
            <span className="text-xs font-mono text-slate-400">
              MULTIMODAL ANOMALY LOCALIZATION & SEGMENTATION
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Automated Anomaly Inspector & Diagnostics
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Powered by Google Gemini 2.5 Vision with autonomous local edge fallback
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono hover:from-cyan-400 hover:to-blue-500 transition shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>INFERENCING PIXELS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>RUN VISUAL SCAN</span>
            </>
          )}
        </button>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Interactive Canvas Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <InspectionCanvas
            imageUrl={selectedImage}
            detections={inspectionResult?.detections || []}
            heatmapGrid={inspectionResult?.heatmapGrid || []}
            isAnomaly={isAnomaly}
            selectedDetectionIndex={selectedDetectionIdx}
            onSelectDetection={setSelectedDetectionIdx}
          />

          {/* Preset Sample Gallery */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>ONE-CLICK INDUSTRIAL SAMPLES:</span>
              <span className="text-cyan-400 text-[10px]">Instant Local Testing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PRESETS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(sample.url);
                    setSelectedFile(null);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition font-mono text-xs ${
                    selectedImage === sample.url
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{sample.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sample.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1-Col: Configuration & Forensic Findings Panel */}
        <div className="space-y-4">
          {/* Scan Config Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Inspection Configuration
            </h3>

            {/* Upload File Input */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Upload Custom Image or Video
              </label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 cursor-pointer text-xs font-mono text-slate-400 transition">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className="truncate">
                  {selectedFile ? selectedFile.name : 'Choose JPG, PNG, WEBP, MP4'}
                </span>
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Target Camera Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Assign to Optical Camera Feed
              </label>
              <select
                value={targetCameraId}
                onChange={(e) => setTargetCameraId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {cameras.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.resolution})
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Inference Model
              </label>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Fast)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          {/* AI Forensic Diagnostic Findings */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Forensic Findings
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {inspectionResult?.latencyMs ? `${inspectionResult.latencyMs} ms` : '142 ms'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isAnomaly ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                <span className="text-sm font-bold text-white">
                  {inspectionResult?.status || 'ANOMALY_DETECTED'}
                </span>
                <span className="ml-auto text-xs font-mono text-cyan-400 font-bold">
                  {Math.round((inspectionResult?.confidence || inspectionResult?.overallConfidence || 0.94) * 100)}% CONF
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {inspectionResult?.summary || 'Defect identified. Surface crack exceeds structural safety margin.'}
              </p>
            </div>

            {/* Detections List */}
            {inspectionResult?.detections && inspectionResult.detections.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Flagged Bounding Regions ({inspectionResult.detections.length}):
                </div>
                <div className="space-y-2">
                  {inspectionResult.detections.map((det, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedDetectionIdx(i)}
                      className={`p-3 rounded-lg border cursor-pointer transition text-xs font-mono ${
                        selectedDetectionIdx === i
                          ? 'bg-rose-950/40 border-rose-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{det.label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800">
                          {det.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Category: {det.category}
                      </div>
                      {det.remediation && (
                        <div className="text-[11px] text-amber-400/90 mt-1.5 bg-amber-950/20 p-2 rounded border border-amber-900/40">
                          Remediation: {det.remediation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
              Engine: {inspectionResult?.modelUsed || 'Google Gemini 2.5 Flash'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

