import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize2, ShieldAlert, CheckCircle, Radio, Settings, Eye } from 'lucide-react';

function CameraStreamCanvas({ camera, onInspectClick }) {
  const canvasRef = useRef(null);
  const [activeDetections, setActiveDetections] = useState(camera.activeAnomalies > 0 ? 1 : 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background gradient simulating machine vision camera feed
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (camera.type.includes('thermal')) {
        grad.addColorStop(0, '#1a0026');
        grad.addColorStop(0.5, '#400040');
        grad.addColorStop(1, '#001a33');
      } else {
        grad.addColorStop(0, '#0a1018');
        grad.addColorStop(1, '#05080c');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Industrial Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Simulated moving inspection object (conveyor item or perimeter silhouette)
      const objX = (Math.sin(t * 0.5) * 0.35 + 0.5) * w;
      const objY = h * 0.55;

      ctx.fillStyle = camera.type.includes('thermal') ? '#ffaa00' : '#1e293b';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(objX - 60, objY - 40, 120, 80, 8);
      ctx.fill();
      ctx.stroke();

      // Laser scanner line
      const scanY = (Math.sin(t * 1.5) * 0.5 + 0.5) * h;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw bounding box if camera has anomaly
      if (camera.activeAnomalies > 0) {
        const boxX = objX - 45;
        const boxY = objY - 30;
        const boxW = 90;
        const boxH = 60;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner accents
        const cornerLen = 10;
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        // top-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();
        // bottom-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.stroke();

        // Tag label
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(boxX, boxY - 20, 120, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('ANOMALY: 94.2%', boxX + 6, boxY - 6);
      }

      // Crosshair center
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 15, h / 2);
      ctx.lineTo(w / 2 + 15, h / 2);
      ctx.moveTo(w / 2, h / 2 - 15);
      ctx.lineTo(w / 2, h / 2 + 15);
      ctx.stroke();

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [camera]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 group hover:border-cyan-500/50 transition-all flex flex-col justify-between">
      {/* Top Stream Header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold text-white tracking-wider truncate max-w-[170px]">
            {camera.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>{camera.fps} FPS</span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative aspect-video w-full">
        <canvas
          ref={canvasRef}
          width={360}
          height={202}
          className="w-full h-full block object-cover"
        />

        {/* Anomaly Badge Overlay */}
        {camera.activeAnomalies > 0 ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-mono font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>CRITICAL DEFECT FLAGGED</span>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded bg-black/60 text-emerald-400 text-[10px] font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>NORMAL CONFORMANCE</span>
          </div>
        )}

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={() => onInspectClick(camera)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-mono font-bold hover:bg-cyan-400 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            DEEP SCAN
          </button>
        </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="truncate">{camera.location}</span>
        <span className="text-slate-500">{camera.resolution}</span>
      </div>
    </div>
  );
}

export default function LiveCameraGrid({ cameras, onInspectClick, onAddCameraClick }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            Active Visual Telemetry Feeds
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Real-time multi-angle edge inference & anomaly localization
          </p>
        </div>

        <button
          onClick={onAddCameraClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition"
        >
          <span>+ Add Camera Stream</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cameras.map((cam) => (
          <CameraStreamCanvas
            key={cam.id}
            camera={cam}
            onInspectClick={onInspectClick}
          />
        ))}
      </div>
    </div>
  );
}

