-- ==============================================================================
-- OPTICGUARD AI - SUPABASE DATABASE SCHEMA SPECIFICATION
-- Platform: Automated Visual Intelligence & Anomaly Detection System
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cameras Table (Optical streams, sensors, ROI masks)
CREATE TABLE IF NOT EXISTS public.cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'optical-industrial',
    stream_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    fps INTEGER NOT NULL DEFAULT 24,
    resolution TEXT NOT NULL DEFAULT '1920x1080',
    fov TEXT DEFAULT 'Macro 45°',
    roi_zone JSONB DEFAULT '{"x": 10, "y": 10, "width": 80, "height": 80}',
    sensitivity NUMERIC(3,2) DEFAULT 0.85,
    specs TEXT DEFAULT 'Industrial CMOS Machine Vision Sensor',
    active_anomalies INTEGER DEFAULT 0,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Incidents & Alarms Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    camera_id TEXT REFERENCES public.cameras(id) ON DELETE SET NULL,
    camera_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.850,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVESTIGATING', 'RESOLVED')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    details TEXT,
    suggested_action TEXT,
    operator TEXT DEFAULT 'OpticGuard Automated AI',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    resolved_by TEXT,
    file_url TEXT,
    bounding_boxes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inspections Table (Historical audit log of all evaluated frames)
CREATE TABLE IF NOT EXISTS public.inspections (
    id TEXT PRIMARY KEY,
    camera_id TEXT,
    camera_name TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    filename TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'PASSED' CHECK (status IN ('PASSED', 'ANOMALY_DETECTED')),
    confidence NUMERIC(4,3) DEFAULT 0.950,
    latency_ms INTEGER DEFAULT 140,
    model_used TEXT DEFAULT 'gemini-2.5-flash',
    summary TEXT,
    detections_count INTEGER DEFAULT 0,
    detections JSONB DEFAULT '[]'::jsonb,
    heatmap_grid JSONB DEFAULT '[]'::jsonb,
    linked_incident_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Platform Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global-config',
    system_name TEXT DEFAULT 'OpticGuard AI - Autonomous Visual Intelligence',
    facility_code TEXT DEFAULT 'FAC-ALPHA-902',
    active_model TEXT DEFAULT 'gemini-2.5-flash',
    anomaly_confidence_threshold NUMERIC(3,2) DEFAULT 0.65,
    auto_escalate_critical BOOLEAN DEFAULT TRUE,
    audio_alerts BOOLEAN DEFAULT TRUE,
    webhook_url TEXT DEFAULT 'https://webhook.site/opticguard-demo-endpoint',
    retention_days INTEGER DEFAULT 90,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for High-Velocity Querying
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_timestamp ON public.inspections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cameras_status ON public.cameras(status);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read for Dashboard Displays
CREATE POLICY "Allow public read access to cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Allow public read access to incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to inspections" ON public.inspections FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);

-- Allow Service Role and authenticated writes
CREATE POLICY "Allow full access for service role on cameras" ON public.cameras FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow full access for service role on incidents" ON public.incidents FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow full access for service role on inspections" ON public.inspections FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow full access for service role on settings" ON public.settings FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

-- 8. Seed Initial Data
INSERT INTO public.cameras (id, name, location, type, stream_url, status, fps, resolution, fov, sensitivity, specs, active_anomalies)
VALUES 
  ('cam-01', 'Assembly Line 04 - Micro-Welding', 'Building A - Sector 2', 'optical-industrial', 'simulated://opticguard/stream-welding', 'active', 24, '1920x1080', 'Macro 45°', 0.85, 'Sony IMX485 CMOS / 4K / Global Shutter', 1),
  ('cam-02', 'PCB Surface Defect Inspection', 'Cleanroom Alpha - Bay 7', 'optical-high-res', 'simulated://opticguard/stream-pcb', 'active', 30, '2560x1440', 'Coaxial 60°', 0.90, 'Basler ace 2 Pro / Telecentric Optics', 0),
  ('cam-03', 'High-Bay Logistics Overhead Track', 'Warehouse Central - Gate 12', 'optical-wide', 'simulated://opticguard/stream-logistics', 'active', 15, '1920x1080', 'Wide-Angle 110°', 0.70, 'Axis P3245-LVE / IR Night Vision', 0),
  ('cam-04', 'Perimeter Security & Hazard Zone', 'Exterior Perimeter South - Gate 03', 'optical-thermal-hybrid', 'simulated://opticguard/stream-perimeter', 'active', 20, '1920x1080', 'PTZ 90°', 0.80, 'FLIR Dual Thermal-Optical Fusion IP67', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings (id, system_name, facility_code, active_model, anomaly_confidence_threshold, auto_escalate_critical, audio_alerts)
VALUES ('global-config', 'OpticGuard AI - Autonomous Visual Intelligence', 'FAC-ALPHA-902', 'gemini-2.5-flash', 0.65, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 9. Enable Realtime Publications for Live UI streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras;

