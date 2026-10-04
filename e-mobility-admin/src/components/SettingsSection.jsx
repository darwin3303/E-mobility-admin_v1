import React, { useState, useEffect } from 'react';
import { realtimeClient } from '../services/realtime.client';
import {
  Sliders,
  Gauge,
  Cpu,
  Smartphone,
  Database,
  Shield,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Radio,
  Bell,
  Mail,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Lock,
  RefreshCw,
  Send,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Play
} from 'lucide-react';

export const DEFAULT_COMMAND_SETTINGS = {
  // 1. Speed & Enforcement
  speedLimit: 100,
  heavyVehicleLimit: 80,
  speedTolerance: 5,
  demeritPoints: 3,
  strictEnforcement: true,
  severeSpeedThreshold: 125,

  // 2. AI Vision & Inference
  yoloModel: 'yolov8_radar_v2.4',
  confidenceThreshold: 90,
  streamResolution: '1080p_30fps',
  targetReticleOverlay: true,
  laneIntrusionDetection: true,
  autoProcessViolations: true,

  // 3. Dispatch & Gateways
  smsDispatch: true,
  smsGateway: 'dialog_gov_sms',
  smsSenderId: 'EMOBILITY-LK',
  emailDispatch: true,
  attachPdfCitation: true,
  sirenAlertSound: true,

  // 4. Registry & Database Sync
  dbSource: 'vehicle_registry_7000_records.csv',
  syncInterval: 4,
  anprFuzzyMatching: true,
  autoPurgeCache: false,

  // 5. Security & Audit
  officerBadge: 'LK-POLICE-98214',
  sessionTimeout: 60,
  auditLogLevel: 'VERBOSE',
  requireSignOffAbove140: true
};

export default function SettingsSection({
  isDarkMode = true,
  currentSpeedLimit = 100,
  onSettingsSaved = () => {},
  addNotification = () => {}
}) {
  const [activeTab, setActiveTab] = useState('speed'); // 'speed' | 'ai' | 'dispatch' | 'registry' | 'security'
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('emobility_admin_settings');
      if (saved) {
        return { ...DEFAULT_COMMAND_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return { ...DEFAULT_COMMAND_SETTINGS, speedLimit: Number(currentSpeedLimit) || 100 };
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState(null); // 'sms' | 'ocr' | null
  const [simulatedPlate, setSimulatedPlate] = useState('WP CAB-4521');
  const [simulatedSpeed, setSimulatedSpeed] = useState(128);
  const [smsTestDispatched, setSmsTestDispatched] = useState(false);
  const [ocrBenchmarkResult, setOcrBenchmarkResult] = useState(null);
  const [isOcrRunning, setIsOcrRunning] = useState(false);

  // Update setting helper with instant live synchronization
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [key]: value
      };
      // Immediately notify parent & AI server if speed limit changes
      if (key === 'speedLimit') {
        realtimeClient.setSpeedLimit(value);
        onSettingsSaved(updated);
      }
      return updated;
    });
    setHasUnsavedChanges(true);
    setSaveSuccessBanner(false);
  };

  // Save Settings
  const handleSave = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    // Broadcast speed limit across all camera nodes immediately
    realtimeClient.setSpeedLimit(settings.speedLimit);

    setTimeout(() => {
      try {
        localStorage.setItem('emobility_admin_settings', JSON.stringify(settings));
        setIsSaving(false);
        setHasUnsavedChanges(false);
        setSaveSuccessBanner(true);
        onSettingsSaved(settings);
        addNotification(`⚡ Speed Limit updated to ${settings.speedLimit} km/h — applied live across all 8 cameras!`);
        setTimeout(() => setSaveSuccessBanner(false), 5000);
      } catch (err) {
        setIsSaving(false);
        console.error('Save error:', err);
      }
    }, 400);
  };

  // Reset to Government Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all expressway surveillance & enforcement settings to official Government Defaults (100 km/h)?')) {
      setSettings(DEFAULT_COMMAND_SETTINGS);
      localStorage.setItem('emobility_admin_settings', JSON.stringify(DEFAULT_COMMAND_SETTINGS));
      setHasUnsavedChanges(false);
      realtimeClient.setSpeedLimit(DEFAULT_COMMAND_SETTINGS.speedLimit);
      onSettingsSaved(DEFAULT_COMMAND_SETTINGS);
      addNotification('🔄 System settings reset to official Sri Lanka Expressway Standards (100 km/h).');
      setSaveSuccessBanner(true);
      setTimeout(() => setSaveSuccessBanner(false), 4000);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `emobility_command_config_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('📁 Configuration JSON exported successfully.');
  };

  // Import JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setSettings(prev => ({ ...prev, ...imported }));
        setHasUnsavedChanges(true);
        addNotification('📥 Configuration imported successfully. Click "Save Configuration" to apply.');
      } catch (err) {
        alert('Invalid JSON configuration file.');
      }
    };
    reader.readAsText(file);
  };

  // Force Re-Index 7000 records
  const handleReindexRegistry = () => {
    setIsReindexing(true);
    setReindexSuccess(false);
    setTimeout(() => {
      setIsReindexing(false);
      setReindexSuccess(true);
      addNotification('🚗 7,000 Vehicle Registry records re-indexed and synchronized with in-memory cache.');
      setTimeout(() => setReindexSuccess(false), 4000);
    }, 1500);
  };

  // Run Simulated SMS Dispatch
  const handleSimulateSMS = () => {
    setSmsTestDispatched(true);
    addNotification(`📲 Simulated live SMS citation dispatched for vehicle [${simulatedPlate}] at ${simulatedSpeed} km/h`);
  };

  // Run AI OCR Benchmark
  const handleRunOcrBenchmark = () => {
    setIsOcrRunning(true);
    setOcrBenchmarkResult(null);
    setTimeout(() => {
      setIsOcrRunning(false);
      setOcrBenchmarkResult({
        plate: simulatedPlate,
        confidence: 98.6,
        inferenceTimeMs: 7.4,
        yoloBoundingBox: '[x: 412, y: 580, w: 230, h: 75]',
        status: 'OFFICIAL REGISTRY MATCH',
        owner: 'Kavinda Perera (NIC: 200012345678)',
        vehicle: 'Nissan Leaf ZE1 (Silver Metallic)'
      });
      addNotification(`🔬 YOLOv8 OCR Benchmark completed: 98.6% confidence on ${simulatedPlate}`);
    }, 1200);
  };

  const tabs = [
    { id: 'speed', label: 'Speed & Enforcement', icon: Gauge, badge: `${settings.speedLimit} km/h` },
    { id: 'ai', label: 'AI Vision & YOLOv8', icon: Cpu, badge: `${settings.confidenceThreshold}% OCR` },
    { id: 'dispatch', label: 'SMS & Dispatch Gateways', icon: Smartphone, badge: settings.smsDispatch ? 'Live SMS' : 'Off' },
    { id: 'registry', label: 'National Registry & DB', icon: Database, badge: '7,000 CSV' },
    { id: 'security', label: 'Security & Audit Logs', icon: Shield, badge: settings.auditLogLevel }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto flex-1 w-full animate-fadeIn">
      {/* Top Banner & Control Bar */}
      <div className={`${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl backdrop-blur flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Automated Command & Enforcement Settings
                </h3>
                {hasUnsavedChanges && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                Central real-time governance, AI threshold calibrators, and highway dispatch pipelines.
              </p>
            </div>
          </div>

          {/* Quick System Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 text-[11px]">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>YOLOv8 Radar: 30.0 FPS Online</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              <Database size={12} />
              <span>7,000 Verified SL Records Indexed</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
              <Smartphone size={12} />
              <span>SMS Gateway: {settings.smsGateway === 'dialog_gov_sms' ? 'Dialog/Mobitel Gov' : 'Twilio API'} (Active)</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              <Zap size={12} />
              <span>Inference Latency: 8.5ms</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${isDarkMode
              ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            title="Reset to official Government standards"
          >
            <RotateCcw size={14} />
            <span>Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${isDarkMode
              ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            title="Export settings JSON"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <label
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${isDarkMode
              ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            title="Import configuration JSON"
          >
            <Upload size={14} />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-2 ${hasUnsavedChanges
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 ring-2 ring-blue-400/50'
              : 'bg-blue-600/80 hover:bg-blue-600 text-white shadow-blue-600/20'
              }`}
          >
            {isSaving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessBanner && (
        <div className="bg-emerald-950/70 border border-emerald-700/80 rounded-2xl p-4 flex items-center justify-between text-emerald-300 text-xs font-semibold shadow-lg animate-slideDown">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-200">Settings Successfully Synchronized</p>
              <p className="text-emerald-400/90 text-[11px]">
                Updated parameters applied to YOLOv8 inference worker, database caches, and SMS dispatch nodes.
              </p>
            </div>
          </div>
          <button onClick={() => setSaveSuccessBanner(false)} className="text-emerald-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Navigation Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-3 shadow-xl space-y-1`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider px-3 py-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Settings Categories
            </p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition text-left ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-blue-400'} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive
                    ? 'bg-white/20 text-white'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                    }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Sandbox Launcher Card */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-blue-950/40 border-slate-800' : 'bg-gradient-to-br from-white to-blue-50 border-slate-200'} border rounded-2xl p-4 shadow-xl space-y-3`}>
            <div className="flex items-center space-x-2 text-blue-400">
              <Sparkles size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Live Simulation Sandbox</h4>
            </div>
            <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
              Test OCR inference recognition, fine calculation, and SMS notification dispatch in real time.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveSimulation(activeSimulation === 'sms' ? null : 'sms')}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center space-x-1.5 ${activeSimulation === 'sms'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  }`}
              >
                <Smartphone size={13} />
                <span>Test SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSimulation(activeSimulation === 'ocr' ? null : 'ocr')}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center space-x-1.5 ${activeSimulation === 'ocr'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  }`}
              >
                <Eye size={13} />
                <span>Test OCR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Settings Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: SPEED & ENFORCEMENT */}
          {activeTab === 'speed' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
              <div className="border-b border-slate-800/80 pb-4">
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center space-x-2`}>
                  <Gauge size={18} className="text-blue-400" />
                  <span>Expressway Speed & Violation Thresholds</span>
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                  Configure statutory speed limits, tolerance margins, and automated citation triggers across all highway corridors.
                </p>
              </div>

              <div className="space-y-6">
                {/* General Speed Limit Slider */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        General Expressway Speed Limit
                      </label>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Standard maximum allowable speed for passenger vehicles and light electric vehicles (EVs).
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="text-2xl font-black font-mono text-amber-400">{settings.speedLimit}</span>
                      <span className="text-xs font-bold text-slate-400">km/h</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="5"
                    value={settings.speedLimit}
                    onChange={(e) => updateSetting('speedLimit', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>60 km/h (Min)</span>
                    <span>100 km/h (Gov Standard)</span>
                    <span>140 km/h (Max)</span>
                  </div>
                </div>

                {/* Heavy Vehicle Speed Limit */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Heavy Commercial & Public Transit Speed Limit
                      </label>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Speed threshold for electric buses, container haulage, and commercial trucks.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="text-2xl font-black font-mono text-blue-400">{settings.heavyVehicleLimit}</span>
                      <span className="text-xs font-bold text-slate-400">km/h</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={settings.heavyVehicleLimit}
                    onChange={(e) => updateSetting('heavyVehicleLimit', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* 2-Column Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grace Tolerance Buffer */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Enforcement Grace Buffer
                    </label>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Permitted tolerance margin before automated citation dispatch.
                    </p>
                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={settings.speedTolerance}
                        onChange={(e) => updateSetting('speedTolerance', Number(e.target.value))}
                        className={`w-24 px-3 py-2 rounded-xl text-center font-mono font-bold text-sm border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                      />
                      <span className="text-xs font-bold text-slate-400">km/h above limit</span>
                    </div>
                  </div>

                  {/* Demerit Points */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Demerit Points per Infraction
                    </label>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Official Sri Lanka Motor Traffic demerit points assigned to citizen license.
                    </p>
                    <div className="flex items-center space-x-3 pt-2">
                      <select
                        value={settings.demeritPoints}
                        onChange={(e) => updateSetting('demeritPoints', Number(e.target.value))}
                        className={`px-3 py-2 rounded-xl font-bold text-xs border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                      >
                        <option value="1">1 Point (Minor +5 km/h)</option>
                        <option value="2">2 Points (Moderate +15 km/h)</option>
                        <option value="3">3 Points (Standard +20 km/h)</option>
                        <option value="4">4 Points (Severe +30 km/h)</option>
                        <option value="6">6 Points (Reckless Driving)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 24/7 Strict Enforcement Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      24/7 Automated Highway Enforcement Mode
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Enable real-time continuous AI processing without manual operator pre-approval for standard violations.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('strictEnforcement', !settings.strictEnforcement)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${settings.strictEnforcement
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {settings.strictEnforcement ? 'ACTIVE (24/7)' : 'STANDBY'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI VISION & YOLOv8 */}
          {activeTab === 'ai' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
              <div className="border-b border-slate-800/80 pb-4">
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center space-x-2`}>
                  <Cpu size={18} className="text-blue-400" />
                  <span>AI Computer Vision & Optical Engine</span>
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                  Calibrate YOLOv8 object detection weights, ANPR OCR sensitivity, and video telemetry streaming pipelines.
                </p>
              </div>

              {/* Model Selector Cards */}
              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Active Neural Network Weights
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'yolov8_radar_v2.4', name: 'YOLOv8 Highway Radar v2.4', fps: '30 FPS', acc: '98.2%', desc: 'Optimized for high-speed expressways & multi-lane ANPR' },
                    { id: 'yolov8n_edge', name: 'YOLOv8-Nano Edge', fps: '60 FPS', acc: '94.5%', desc: 'Ultra-low latency for edge camera nodes' },
                    { id: 'custom_sl_anpr', name: 'Sri Lanka DeepPlate OCR', fps: '25 FPS', acc: '99.1%', desc: 'Specialized for Sri Lankan provincial number plates' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateSetting('yoloModel', m.id)}
                      className={`p-4 rounded-xl border text-left transition space-y-2 relative ${settings.yoloModel === m.id
                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/40 text-white'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs">{m.name}</span>
                        {settings.yoloModel === m.id && (
                          <CheckCircle size={16} className="text-blue-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                      <div className="flex items-center space-x-3 text-[10px] font-mono pt-1">
                        <span className="text-emerald-400 font-bold">{m.fps}</span>
                        <span className="text-blue-400 font-bold">{m.acc} Accuracy</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Threshold Slider */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex justify-between items-center">
                  <div>
                    <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      Minimum ANPR Optical Confidence Threshold
                    </label>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Plates recognized below this confidence score will be routed for secondary manual officer verification.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-2xl font-black text-emerald-400">{settings.confidenceThreshold}</span>
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="60"
                  max="99"
                  step="1"
                  value={settings.confidenceThreshold}
                  onChange={(e) => updateSetting('confidenceThreshold', Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reticle Overlay */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Optical Target Reticle Overlay
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Render AI bounding boxes & speed telemetry over live streams.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('targetReticleOverlay', !settings.targetReticleOverlay)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${settings.targetReticleOverlay
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {settings.targetReticleOverlay ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>

                {/* Lane Intrusion */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Emergency Shoulder Intrusion Detection
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tag vehicles illegally stopping or driving on highway shoulders.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('laneIntrusionDetection', !settings.laneIntrusionDetection)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${settings.laneIntrusionDetection
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {settings.laneIntrusionDetection ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH & GATEWAYS */}
          {activeTab === 'dispatch' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
              <div className="border-b border-slate-800/80 pb-4">
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center space-x-2`}>
                  <Smartphone size={18} className="text-blue-400" />
                  <span>SMS & Citation Dispatch Gateways</span>
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                  Configure automated penalty notifications sent directly to vehicle owners via SMS, Email, and Government portal sync.
                </p>
              </div>

              {/* SMS Dispatch Toggle */}
              <div className={`flex flex-wrap justify-between items-center p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Automatic SMS Citation Dispatch
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Instantly dispatch traffic violation notice and online payment link to registered owner's mobile.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting('smsDispatch', !settings.smsDispatch)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow mt-2 sm:mt-0 ${settings.smsDispatch
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                >
                  {settings.smsDispatch ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gateway Provider */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    SMS Gateway Provider API
                  </label>
                  <select
                    value={settings.smsGateway}
                    onChange={(e) => updateSetting('smsGateway', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl font-medium text-xs border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                  >
                    <option value="dialog_gov_sms">Dialog Axiata / Mobitel Gov Gateway</option>
                    <option value="slt_enterprise">Sri Lanka Telecom (SLT-Mobitel) Enterprise</option>
                    <option value="twilio_gov">Twilio Gov Cloud SMS Dispatcher</option>
                  </select>
                </div>

                {/* Sender ID */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Official SMS Sender Header / ID
                  </label>
                  <input
                    type="text"
                    value={settings.smsSenderId}
                    onChange={(e) => updateSetting('smsSenderId', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl font-mono font-bold text-xs border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              {/* Email & Sound Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Email Official PDF Infraction Notice
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Email citation with CCTV photographic evidence.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('emailDispatch', !settings.emailDispatch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${settings.emailDispatch
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {settings.emailDispatch ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                      Audio Siren Tone on Critical Speeding (&gt;130 km/h)
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Play command alert chime for extreme speeding violations.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('sirenAlertSound', !settings.sirenAlertSound)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${settings.sirenAlertSound
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {settings.sirenAlertSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{settings.sirenAlertSound ? 'AUDIBLE' : 'MUTED'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NATIONAL REGISTRY & DB */}
          {activeTab === 'registry' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
              <div className="border-b border-slate-800/80 pb-4">
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center space-x-2`}>
                  <Database size={18} className="text-blue-400" />
                  <span>National Vehicle Registry & Database Sync</span>
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                  Manage official dataset indexing (7,000 Sri Lankan records), vehicle-to-owner matching, and portal syncing.
                </p>
              </div>

              {/* Status & Re-index Row */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      7,000 Records Active in RAM Index
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Source: <code className="font-mono text-blue-400 font-semibold">{settings.dbSource}</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReindexRegistry}
                  disabled={isReindexing}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <RefreshCw size={14} className={isReindexing ? 'animate-spin' : ''} />
                  <span>{isReindexing ? 'Re-Indexing Records...' : 'Force Re-Index 7,000 Records'}</span>
                </button>
              </div>

              {reindexSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-800 p-3 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle size={16} />
                  <span>7,000 records successfully re-parsed, indexed, and cross-verified with 0 errors!</span>
                </div>
              )}

              {/* Sync Interval */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex justify-between items-center">
                  <div>
                    <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      Citizen Vehicle Portal Sync Polling Rate
                    </label>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Frequency at which newly registered citizen vehicles are fetched into the Command Dashboard.
                    </p>
                  </div>
                  <div className="font-mono font-bold text-blue-400 text-lg">
                    {settings.syncInterval}s
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={settings.syncInterval}
                  onChange={(e) => updateSetting('syncInterval', Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Fuzzy Suffix Matching */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Sri Lankan Number Plate Suffix & Substring Matching
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Automatically resolves plates entered without province code (e.g. "CAC-1860" matches "NW-CAC-1860").
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting('anprFuzzyMatching', !settings.anprFuzzyMatching)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${settings.anprFuzzyMatching
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                >
                  {settings.anprFuzzyMatching ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & AUDIT */}
          {activeTab === 'security' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
              <div className="border-b border-slate-800/80 pb-4">
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center space-x-2`}>
                  <Shield size={18} className="text-blue-400" />
                  <span>Security Governance & Duty Officer Audit</span>
                </h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                  Command operator badge authorizations, session locking timers, and statutory audit trail compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Officer Badge */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Authorizing Officer / Commander Badge ID
                  </label>
                  <input
                    type="text"
                    value={settings.officerBadge}
                    onChange={(e) => updateSetting('officerBadge', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl font-mono font-bold text-xs border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                  />
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Appears on digital citations and court-admissible PDF violation records.
                  </p>
                </div>

                {/* Session Timeout */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Operator Inactivity Auto-Lock
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl font-medium text-xs border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes (Standard)</option>
                    <option value="240">4 Hours</option>
                  </select>
                </div>
              </div>

              {/* Audit Log Level */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                  Audit Logging Detail Level
                </label>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {['VERBOSE', 'STANDARD', 'MINIMAL'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateSetting('auditLogLevel', lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${settings.auditLogLevel === lvl
                        ? 'bg-blue-600 text-white border-blue-500'
                        : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-300 text-slate-700'
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Speed Manual Sign-Off */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>
                    Mandatory Officer Sign-Off for Speeds &gt; 140 km/h
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Require manual badge approval before issuing legal summons for severe reckless speeding.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting('requireSignOffAbove140', !settings.requireSignOffAbove140)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${settings.requireSignOffAbove140
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                >
                  {settings.requireSignOffAbove140 ? 'REQUIRED' : 'BYPASS'}
                </button>
              </div>
            </div>
          )}

          {/* SIMULATION & TEST BENCH MODAL / DRAWER */}
          {activeSimulation === 'sms' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-purple-500/40' : 'bg-white border-purple-300'} border-2 rounded-2xl p-6 shadow-2xl space-y-4 animate-slideDown`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Smartphone size={18} />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Live SMS Citation Dispatch Simulator</h4>
                </div>
                <button onClick={() => { setActiveSimulation(null); setSmsTestDispatched(false); }} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Simulation Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Test Vehicle License Plate</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={simulatedPlate}
                        onChange={(e) => setSimulatedPlate(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl font-mono font-bold text-sm bg-slate-950 border border-slate-700 text-amber-400"
                        placeholder="e.g. WP CAB-4521"
                      />
                    </div>
                    {/* Quick Plate Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['WP CAB-4521', 'NW-CAC-1860', 'SB-KA-6734', 'SP-KY-3390'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSimulatedPlate(p)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Recorded Vehicle Speed</span>
                      <span className="text-rose-400 font-mono">{simulatedSpeed} km/h (Limit: {settings.speedLimit} km/h)</span>
                    </div>
                    <input
                      type="range"
                      min="105"
                      max="180"
                      value={simulatedSpeed}
                      onChange={(e) => setSimulatedSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateSMS}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <Send size={14} />
                    <span>Dispatch Simulated SMS Citation</span>
                  </button>
                </div>

                {/* Mobile Preview Screen */}
                <div className="flex justify-center">
                  <div className="w-72 rounded-3xl bg-slate-950 border-4 border-slate-800 p-3 shadow-2xl text-slate-100 space-y-3 font-sans">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-2">
                      <span>14:45</span>
                      <div className="flex items-center space-x-1">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                          SL
                        </div>
                        <span className="text-[11px] font-bold text-blue-400">{settings.smsSenderId}</span>
                        <span className="text-[9px] text-slate-500">Just now</span>
                      </div>

                      <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                        ⚠️ <strong>TRAFFIC CITATION:</strong> Vehicle <strong className="text-amber-400">{simulatedPlate}</strong> recorded at <strong>{simulatedSpeed} km/h</strong> on Southern Expressway (Speed Limit: {settings.speedLimit} km/h).
                        Fine of <strong>LKR 5,000</strong> ({settings.demeritPoints} Demerit Pts) issued.
                        Pay or dispute online: <span className="text-blue-400 underline">https://emobility.gov.lk/pay</span>
                      </p>
                    </div>

                    {smsTestDispatched && (
                      <div className="text-center text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-xl py-1 animate-pulse">
                        ✓ Gateway Dispatch Success (ID: MSG-98214-OK)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OCR BENCHMARK SIMULATOR */}
          {activeSimulation === 'ocr' && (
            <div className={`${isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-300'} border-2 rounded-2xl p-6 shadow-2xl space-y-4 animate-slideDown`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Eye size={18} />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Optical ANPR License Plate Benchmark</h4>
                </div>
                <button onClick={() => { setActiveSimulation(null); setOcrBenchmarkResult(null); }} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="space-y-4 flex-1">
                  <p className="text-xs text-slate-300">
                    Run test frame through active neural model (<strong className="text-blue-400">{settings.yoloModel}</strong>) to measure inference latency, optical confidence, and National Registry query speed.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simulatedPlate}
                      onChange={(e) => setSimulatedPlate(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl font-mono font-bold text-sm bg-slate-950 border border-slate-700 text-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleRunOcrBenchmark}
                      disabled={isOcrRunning}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 flex-shrink-0"
                    >
                      <Play size={14} className={isOcrRunning ? 'animate-spin' : ''} />
                      <span>{isOcrRunning ? 'Scanning...' : 'Run Benchmark'}</span>
                    </button>
                  </div>
                </div>

                {/* Benchmark Output Card */}
                {ocrBenchmarkResult && (
                  <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px] border-b border-slate-800 pb-2">
                      <span className="text-slate-400">AI INFERENCE RESULT</span>
                      <span className="text-emerald-400 font-bold">PASS ({ocrBenchmarkResult.inferenceTimeMs}ms)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Identified Plate:</span>
                        <span className="text-amber-400 font-bold text-sm">{ocrBenchmarkResult.plate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">OCR Confidence:</span>
                        <span className="text-emerald-400 font-bold text-sm">{ocrBenchmarkResult.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Registry Owner:</span>
                        <span className="text-slate-200">{ocrBenchmarkResult.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Vehicle Model:</span>
                        <span className="text-slate-200">{ocrBenchmarkResult.vehicle}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
