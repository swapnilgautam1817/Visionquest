export const initialSeedData = {
  cameras: [
    {
      id: "cam-01",
      name: "Assembly Line 04 - Micro-Welding",
      location: "Building A - Sector 2",
      type: "optical-industrial",
      streamUrl: "simulated://opticguard/stream-welding",
      status: "active",
      fps: 24,
      resolution: "1920x1080",
      fov: "Macro 45°",
      roiZone: { x: 15, y: 20, width: 70, height: 60 },
      sensitivity: 0.85,
      lastPing: new Date().toISOString(),
      activeAnomalies: 1,
      specs: "Sony IMX485 CMOS / 4K / Global Shutter"
    },
    {
      id: "cam-02",
      name: "PCB Surface Defect Inspection",
      location: "Cleanroom Alpha - Bay 7",
      type: "optical-high-res",
      streamUrl: "simulated://opticguard/stream-pcb",
      status: "active",
      fps: 30,
      resolution: "2560x1440",
      fov: "Coaxial 60°",
      roiZone: { x: 10, y: 10, width: 80, height: 80 },
      sensitivity: 0.90,
      lastPing: new Date().toISOString(),
      activeAnomalies: 0,
      specs: "Basler ace 2 Pro / Telecentric Optics"
    },
    {
      id: "cam-03",
      name: "High-Bay Logistics Overhead Track",
      location: "Warehouse Central - Gate 12",
      type: "optical-wide",
      streamUrl: "simulated://opticguard/stream-logistics",
      status: "active",
      fps: 15,
      resolution: "1920x1080",
      fov: "Wide-Angle 110°",
      roiZone: { x: 5, y: 15, width: 90, height: 75 },
      sensitivity: 0.70,
      lastPing: new Date().toISOString(),
      activeAnomalies: 0,
      specs: "Axis P3245-LVE / IR Night Vision / Pan-Tilt"
    },
    {
      id: "cam-04",
      name: "Perimeter Security & Hazard Zone",
      location: "Exterior Perimeter South - Gate 03",
      type: "optical-thermal-hybrid",
      streamUrl: "simulated://opticguard/stream-perimeter",
      status: "active",
      fps: 20,
      resolution: "1920x1080",
      fov: "PTZ 90°",
      roiZone: { x: 0, y: 30, width: 100, height: 70 },
      sensitivity: 0.80,
      lastPing: new Date().toISOString(),
      activeAnomalies: 2,
      specs: "FLIR Dual Thermal-Optical Fusion IP67"
    }
  ],
  incidents: [
    {
      id: "inc-101",
      cameraId: "cam-01",
      cameraName: "Assembly Line 04 - Micro-Welding",
      title: "Micro-Crack & Incomplete Joint Fusion",
      category: "Structural Defect",
      severity: "CRITICAL",
      confidence: 0.94,
      status: "INVESTIGATING",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      details: "Detected irregular stress fracture exceeding 1.2mm tolerance in secondary titanium weld joint. Potential micro-fissure propagation under cyclic load.",
      suggestedAction: "Pause Robotic Cell #4 and trigger laser re-inspection before pallet indexing.",
      operator: "Operator J. Vance",
      resolvedAt: null,
      boundingBoxes: [
        { ymin: 0.35, xmin: 0.42, ymax: 0.58, xmax: 0.62, label: "Fissure Void", confidence: 0.94 }
      ]
    },
    {
      id: "inc-102",
      cameraId: "cam-04",
      cameraName: "Perimeter Security & Hazard Zone",
      title: "Unauthorized Perimeter Crossing & Safety Breach",
      category: "Perimeter Intrusion",
      severity: "HIGH",
      confidence: 0.88,
      status: "ACTIVE",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      details: "Object detected within 5-meter exclusion boundary of automated robotic transfer aisle without RFID transponder or safety tether.",
      suggestedAction: "Sound audible safety klaxon and deploy automated area lockout.",
      operator: "Security Guard Station 2",
      resolvedAt: null,
      boundingBoxes: [
        { ymin: 0.22, xmin: 0.68, ymax: 0.72, xmax: 0.89, label: "Unregistered Entity", confidence: 0.88 }
      ]
    },
    {
      id: "inc-103",
      cameraId: "cam-02",
      cameraName: "PCB Surface Defect Inspection",
      title: "Solder Bridge & Trace Short-Circuit",
      category: "Surface Flaw",
      severity: "MEDIUM",
      confidence: 0.82,
      status: "RESOLVED",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      details: "Excess solder paste deposition bridging pins 14 and 15 on IC footprint U-402.",
      suggestedAction: "Divert board to rework station for optical desoldering touch-up.",
      operator: "QA Tech M. Chen",
      resolvedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      resolutionNotes: "Reworked by manual hot-air touchup; verified with secondary probe.",
      boundingBoxes: [
        { ymin: 0.44, xmin: 0.31, ymax: 0.53, xmax: 0.45, label: "Solder Bridge", confidence: 0.82 }
      ]
    },
    {
      id: "inc-104",
      cameraId: "cam-01",
      cameraName: "Assembly Line 04 - Micro-Welding",
      title: "Gas Pore Contamination & Porosity Void",
      category: "Material Porosity",
      severity: "LOW",
      confidence: 0.71,
      status: "RESOLVED",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      details: "Small argon shielding bubble trapped on weld bead surface. Dimensions under 0.3mm tolerance limit.",
      suggestedAction: "Log for statistical process control (SPC); within non-destructive tolerance.",
      operator: "Automated Rule",
      resolvedAt: new Date(Date.now() - 1000 * 60 * 230).toISOString(),
      resolutionNotes: "Classified as non-critical aesthetic blemish.",
      boundingBoxes: [
        { ymin: 0.61, xmin: 0.52, ymax: 0.68, xmax: 0.59, label: "Porosity Pore", confidence: 0.71 }
      ]
    }
  ],
  inspections: [
    {
      id: "insp-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      cameraId: "cam-01",
      cameraName: "Assembly Line 04 - Micro-Welding",
      type: "image",
      filename: "sample_welding_pass.jpg",
      status: "PASSED",
      confidence: 0.98,
      latencyMs: 142,
      modelUsed: "gemini-2.5-flash",
      detectionsCount: 0,
      detections: [],
      notes: "Clean bead geometry, uniform penetration profile, no voids or undercut."
    },
    {
      id: "insp-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      cameraId: "cam-01",
      cameraName: "Assembly Line 04 - Micro-Welding",
      type: "image",
      filename: "sample_welding_defect.jpg",
      status: "ANOMALY_DETECTED",
      confidence: 0.94,
      latencyMs: 168,
      modelUsed: "gemini-2.5-flash",
      detectionsCount: 1,
      detections: [
        {
          label: "Micro-Crack / Lack of Fusion",
          confidence: 0.94,
          severity: "CRITICAL",
          box: { ymin: 0.35, xmin: 0.42, ymax: 0.58, xmax: 0.62 },
          remediation: "Halt line; recalibrate electrode standoff distance."
        }
      ],
      notes: "Severe longitudinal micro-crack along heat-affected zone (HAZ)."
    },
    {
      id: "insp-003",
      timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      cameraId: "cam-02",
      cameraName: "PCB Surface Defect Inspection",
      type: "image",
      filename: "sample_pcb_pass.jpg",
      status: "PASSED",
      confidence: 0.99,
      latencyMs: 125,
      modelUsed: "gemini-2.5-flash",
      detectionsCount: 0,
      detections: [],
      notes: "100% component orientation match, all solder fillets meet IPC-A-610 Class 3."
    }
  ],
  settings: {
    systemName: "OpticGuard AI - Autonomous Visual Intelligence",
    facilityCode: "FAC-ALPHA-902",
    geminiApiKeyConfigured: false,
    activeModel: "gemini-2.5-flash",
    anomalyConfidenceThreshold: 0.65,
    autoEscalateCritical: true,
    audioAlerts: true,
    emailAlerts: true,
    webhookUrl: "https://webhook.site/opticguard-demo-endpoint",
    retentionDays: 90,
    maintenanceMode: false
  }
};

