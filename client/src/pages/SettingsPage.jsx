import React, { useState } from 'react';
import { Settings, Key, Cpu, Bell, Sliders, CheckCircle, AlertTriangle, RefreshCw, Send, ShieldCheck, Database } from 'lucide-react';
import { api } from '../services/api.js';

export default function SettingsPage({ settings, onUpdateSettings }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [model, setModel] = useState(settings?.activeModel || 'gemini-2.5-flash');
  const [threshold, setThreshold] = useState(settings?.anomalyConfidenceThreshold || 0.65);
  const [webhookUrl, setWebhookUrl] = useState(settings?.webhookUrl || 'https://webhook.site/opticguard-demo-endpoint');
  const [autoEscalate, setAutoEscalate] = useState(settings?.autoEscalateCritical !== false);
  const [audioAlerts, setAudioAlerts] = useState(settings?.audioAlerts !== false);

  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const resp = await api.testGemini(geminiKey, model);
      setTestResult({ success: true, message: resp.message || 'Connection successful!' });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const resp = await api.testSupabase();
      setSupabaseTestResult({ success: true, message: resp.message || 'Supabase connected!' });
    } catch (err) {
      setSupabaseTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        activeModel: model,
        anomalyConfidenceThreshold: parseFloat(threshold),
        webhookUrl,
        autoEscalateCritical: autoEscalate,
        audioAlerts
      };
      if (geminiKey) {
        payload.geminiApiKey = geminiKey;
      }

      await onUpdateSettings(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            CONFIGURATION
          </span>
          <span className="text-xs font-mono text-slate-400">
            SUPABASE, RENDER, GEMINI AI & WEBHOOK DISPATCH
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          OpticGuard Engine Settings
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Manage Supabase connection, multimodal vision models, confidence thresholds, and alerts
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Supabase Connection Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Supabase Cloud Backend
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Postgres database, real-time sync, and storage bucket integration
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition flex items-center gap-1.5"
            >
              {isTestingSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Test Supabase Link</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">DATABASE STATUS:</span>
              <span className={settings?.supabaseConfigured ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                {settings?.supabaseConfigured ? 'SUPABASE CLOUD ACTIVE' : 'LOCAL PERSISTENT FALLBACK'}
              </span>
            </div>
            {settings?.supabaseUrl && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SUPABASE ENDPOINT:</span>
                <span className="text-slate-300">{settings.supabaseUrl}</span>
              </div>
            )}
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
              Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` for cloud persistence.
            </div>
          </div>

          {supabaseTestResult && (
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              supabaseTestResult.success
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
            }`}>
              {supabaseTestResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{supabaseTestResult.message}</span>
            </div>
          )}
        </div>

        {/* Gemini Vision API Section */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Google Gemini Multimodal Vision API
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Powers high-throughput anomaly detection, localization, and technical diagnosis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${
                settings?.geminiApiKeyConfigured ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400'
              }`} />
              <span className="text-slate-300">
                {settings?.geminiApiKeyConfigured ? 'KEY ACTIVE IN .ENV' : 'LOCAL EDGE ENGINE ACTIVE'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Gemini API Key (Optional Override)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={settings?.geminiApiKeyConfigured ? '••••••••••••••••••••••••••••• (Stored in .env)' : 'Paste AI Studio Key here or configure in .env'}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey}
                  className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition flex items-center gap-1.5"
                >
                  {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Test Key</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Leave blank to use the autonomous local computer vision fallback engine without external network dependencies.
              </p>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Vision Model Selection
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fastest latency, modern model)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (High speed edge streaming)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard multimodal vision)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Deep structural reasoning)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Anomaly Detection Sensitivity */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Anomaly Confidence & Sensitivity Threshold
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Minimum classification confidence required to trigger high-priority alarms
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Confidence Threshold:</span>
              <span className="text-cyan-400 font-bold">{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>30% (High Recall / Catch All)</span>
              <span>65% (Balanced)</span>
              <span>95% (High Precision / Zero False Positives)</span>
            </div>
          </div>
        </div>

        {/* Notification Webhook & Audio Alarms */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Alert Escalation & Webhook Integrations
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Dispatch critical anomalies to Slack, Discord, PagerDuty, or custom Webhook
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Webhook Dispatch Endpoint (POST)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://webhook.site/your-id or https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-mono text-white block">Audible Sound Alarms</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Synthesize alarm tones on browser when critical defects occur
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-mono text-white block">Auto-Escalate Critical Incidents</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Immediately flag incident queue when defect confidence &gt; 90%
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEscalate}
                onChange={(e) => setAutoEscalate(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Settings saved and active!
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.25)]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
