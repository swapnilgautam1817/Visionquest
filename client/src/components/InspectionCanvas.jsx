import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Crosshair, Download, Flame, ShieldAlert, CheckCircle } from 'lucide-react';

export default function InspectionCanvas({
  imageUrl,
  detections = [],
  heatmapGrid = [],
  isAnomaly = false,
  selectedDetectionIndex = null,
  onSelectDetection = () => {}
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showBoxes, setShowBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [imageLoaded, setImageLoaded] = useState(false);
  const imageObjRef = useRef(null);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      resetView();
    };
  }, [imageUrl]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = imageObjRef.current;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Apply Transformations (Zoom & Pan)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw base image
    ctx.drawImage(img, 0, 0, w, h);

    // Optional: Draw AI Heatmap
    if (showHeatmap && heatmapGrid && heatmapGrid.length > 0) {
      ctx.save();
      const rows = heatmapGrid.length;
      const cols = heatmapGrid[0].length;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = heatmapGrid[r][c]; // 0.0 to 1.0
          if (val > 0.15) {
            // Turbo / Jet gradient mapping
            const alpha = Math.min(0.65, val * 0.7);
            let hue = (1.0 - val) * 240; // 240 (blue) -> 0 (red)
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1);
          }
        }
      }
      ctx.restore();
    }

    // Draw Bounding Boxes
    if (showBoxes && detections && detections.length > 0) {
      detections.forEach((det, idx) => {
        const box = det.box || {};
        const bx = box.xmin * w;
        const by = box.ymin * h;
        const bw = (box.xmax - box.xmin) * w;
        const bh = (box.ymax - box.ymin) * h;

        const isSelected = selectedDetectionIndex === idx;
        const isCrit = det.severity === 'CRITICAL';
        const strokeColor = isCrit ? '#ef4444' : det.severity === 'HIGH' ? '#f97316' : '#00f0ff';

        ctx.save();
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = isCrit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 240, 255, 0.12)';

        // Fill highlight & box outline
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        // Technical Corner Accents
        const cornerSize = Math.min(12, bw / 3, bh / 3);
        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor;
        // TL
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize, by);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cornerSize);
        ctx.stroke();

        // Label banner
        const labelText = `${det.label || 'DEFECT'} [${Math.round((det.confidence || 0.9) * 100)}%]`;
        ctx.font = 'bold 11px monospace';
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = strokeColor;
        ctx.fillRect(bx, Math.max(0, by - 22), textWidth + 12, 22);

        ctx.fillStyle = '#0a0e17';
        ctx.fillText(labelText, bx + 6, Math.max(14, by - 7));

        ctx.restore();
      });
    }

    // Crosshair overlay
    if (showCrosshairs) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      const curX = (mousePos.x - pan.x) / zoom;
      const curY = (mousePos.y - pan.y) / zoom;

      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, h);
      ctx.moveTo(0, curY);
      ctx.lineTo(w, curY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [imageUrl, detections, heatmapGrid, zoom, pan, showBoxes, showHeatmap, showCrosshairs, mousePos, selectedDetectionIndex]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const downloadAnnotated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `opticguard_inspection_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col">
      {/* Top Controls Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            INSPECTION VIEWER
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1 transition ${
              showBoxes ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            Boxes
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1 transition ${
              showHeatmap ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-500'
            }`}
          >
            <Flame className="w-3 h-3" />
            Heatmap
          </button>
          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1 transition ${
              showCrosshairs ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-500'
            }`}
          >
            <Crosshair className="w-3 h-3" />
          </button>
        </div>

        {/* Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadAnnotated}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium hover:bg-cyan-500/20 transition"
            title="Download Snapshot"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video overflow-hidden flex items-center justify-center cursor-crosshair bg-slate-950 cyber-grid"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="max-w-full max-h-full block shadow-2xl"
        />

        {/* Status Overlay Banner */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          {isAnomaly ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold shadow-xl backdrop-blur-md">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>ANOMALY DETECTED ({detections.length} DEFECTS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-xl backdrop-blur-md">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>CONFORMING COMPONENT (PASS)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

