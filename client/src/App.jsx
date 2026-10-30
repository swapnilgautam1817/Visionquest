import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LiveStreamsPage from './pages/LiveStreamsPage.jsx';
import AnomalyInspectorPage from './pages/AnomalyInspectorPage.jsx';
import IncidentsPage from './pages/IncidentsPage.jsx';
import AuditReportsPage from './pages/AuditReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import IncidentLogModal from './components/IncidentLogModal.jsx';
import AddCameraModal from './components/AddCameraModal.jsx';
import { AudioAlertSynthesizer } from './components/AudioAlertPlayer.jsx';

import { api } from './services/api.js';
import { socket } from './services/socket.js';
import { ShieldAlert, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cameras, setCameras] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);

  // Live Toast Notification
  const [liveToast, setLiveToast] = useState(null);

  // Load Initial Data
  const loadData = async () => {
    try {
      const [cRes, iRes, inspRes, aRes, sRes] = await Promise.all([
        api.getCameras().catch(() => ({ data: [] })),
        api.getIncidents().catch(() => ({ data: [] })),
        api.getInspections(100).catch(() => ({ data: [] })),
        api.getAnalytics().catch(() => ({ data: null })),
        api.getSettings().catch(() => ({ data: null })),
      ]);

      if (cRes.data) setCameras(cRes.data);
      if (iRes.data) setIncidents(iRes.data);
      if (inspRes.data) setInspections(inspRes.data);
      if (aRes.data) setAnalytics(aRes.data);
      if (sRes.data) setSettings(sRes.data);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  useEffect(() => {
    loadData();
    socket.connect();

    // Listen for incoming anomalies
    const unbindAlert = socket.on('NEW_ANOMALY_INCIDENT', (newInc) => {
      setIncidents((prev) => [newInc, ...prev]);
      setLiveToast({
        title: `Anomaly Flagged: ${newInc.title}`,
        severity: newInc.severity,
        details: newInc.details,
        camera: newInc.cameraName
      });

      if (soundEnabled && (newInc.severity === 'CRITICAL' || newInc.severity === 'HIGH')) {
        AudioAlertSynthesizer.playAlert(newInc.severity);
      }
    });

    const unbindInspection = socket.on('NEW_INSPECTION', (insp) => {
      setInspections((prev) => [insp, ...prev]);
    });

    const unbindIncidentUpdate = socket.on('INCIDENT_RESOLVED', (resolved) => {
      setIncidents((prev) => prev.map((i) => (i.id === resolved.id ? resolved : i)));
    });

    return () => {
      unbindAlert();
      unbindInspection();
      unbindIncidentUpdate();
    };
  }, [soundEnabled]);

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;

  const handleInspectCamera = (cam) => {
    setActiveTab('inspector');
  };

  const handleAddCamera = async (camData) => {
    const resp = await api.createCamera(camData);
    if (resp.success) {
      setCameras((prev) => [...prev, resp.data]);
    }
  };

  const handleDeleteCamera = async (id) => {
    if (!confirm('Are you sure you want to disconnect this optical stream?')) return;
    const resp = await api.deleteCamera(id);
    if (resp.success) {
      setCameras((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleResolveIncident = async (id, data) => {
    const resp = await api.resolveIncident(id, data);
    if (resp.success) {
      setIncidents((prev) => prev.map((i) => (i.id === id ? resp.data : i)));
    }
  };

  const handleUpdateSettings = async (data) => {
    const resp = await api.updateSettings(data);
    if (resp.success) {
      setSettings((prev) => ({ ...prev, ...resp.data }));
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeIncidentsCount={activeIncidents.length}
        criticalCount={criticalCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onQuickScanClick={() => setActiveTab('inspector')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeIncidentsCount={activeIncidents.length}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={analytics?.summary}
              analytics={analytics}
              cameras={cameras}
              incidents={incidents}
              onNavigateTab={setActiveTab}
              onInspectCamera={handleInspectCamera}
              onOpenIncident={setSelectedIncident}
              onAddCamera={() => setShowAddCameraModal(true)}
            />
          )}

          {activeTab === 'cameras' && (
            <LiveStreamsPage
              cameras={cameras}
              onInspectCamera={handleInspectCamera}
              onAddCamera={() => setShowAddCameraModal(true)}
              onDeleteCamera={handleDeleteCamera}
            />
          )}

          {activeTab === 'inspector' && (
            <AnomalyInspectorPage
              cameras={cameras}
              onInspectionDone={(newInsp) => {
                setInspections((prev) => [newInsp, ...prev]);
                if (newInsp.status === 'ANOMALY_DETECTED') {
                  loadData(); // reload incidents
                }
              }}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsPage
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
              onResolveIncident={handleResolveIncident}
            />
          )}

          {activeTab === 'reports' && (
            <AuditReportsPage
              inspections={inspections}
              incidents={incidents}
              summary={analytics?.summary}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>

      {/* Live Toast Alert Banner */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-rose-500/80 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400">
                CRITICAL ANOMALY ALERT
              </span>
              <button
                onClick={() => setLiveToast(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {liveToast.title}
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {liveToast.details}
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-2">
              <span>Source: {liveToast.camera}</span>
              <button
                onClick={() => {
                  setActiveTab('incidents');
                  setLiveToast(null);
                }}
                className="text-cyan-400 hover:underline font-bold ml-auto"
              >
                Triage Incident →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail / Resolution Modal */}
      {selectedIncident && (
        <IncidentLogModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolve={handleResolveIncident}
        />
      )}

      {/* Add Camera Modal */}
      {showAddCameraModal && (
        <AddCameraModal
          onClose={() => setShowAddCameraModal(false)}
          onAdd={handleAddCamera}
        />
      )}
    </div>
  );
}

