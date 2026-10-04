import React from 'react';
import { Cpu, Activity, Zap, Radio, ShieldCheck, AlertOctagon, TrendingUp, RefreshCw } from 'lucide-react';

export default function AIDiagnosticsTab({ telemetry, onRefresh, isDarkMode = true }) {
  const data = telemetry || {
    status: 'ONLINE',
    model: 'YOLOv8 + Metric Homography (30 FPS)',
    activeTracks: 157,
    totalViolations: 0,
    activeIncidents: 23,
    averageSpeedKmh: 96.4,
    levelOfService: 'LOS A (Free Flow)',
    trafficDensity: 'Optimal',
    fps: 30.0,
    inferenceMs: 7.8,
    gpuLoad: 26.0,
    camerasOnline: 8,
    nodes: {}
  };

  const nodes = Object.entries(data.nodes || {});

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              AI Vision & Edge Diagnostics Engine
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                isDarkMode 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {data.status || 'ONLINE'}
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time hardware acceleration, YOLOv8 inference metrics, and multi-node CCTV health
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors border ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh Telemetry
        </button>
      </div>

      {/* Core AI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs uppercase font-semibold tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Inference Speed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.inferenceMs || 7.8}</span>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ms / frame</span>
          </div>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1 mt-2">
            <Zap className="w-3.5 h-3.5" /> High-Speed Subsampling (30 FPS)
          </span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs uppercase font-semibold tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Active Highway Tracks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{data.activeTracks || 157}</span>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>vehicles</span>
          </div>
          <span className={`text-[11px] flex items-center gap-1 mt-2 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
            <Radio className="w-3.5 h-3.5" /> 8 Surveillance Nodes Synced
          </span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs uppercase font-semibold tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Traffic Flow (LOS)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{data.levelOfService || 'LOS A (Free Flow)'}</span>
          </div>
          <span className={`text-[11px] flex items-center gap-1 mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Average Speed: <strong className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{data.averageSpeedKmh || 96.4} km/h</strong>
          </span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs uppercase font-semibold tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Road Safety Hazards</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{data.activeIncidents || 0}</span>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>incidents</span>
          </div>
          <span className={`text-[11px] flex items-center gap-1 mt-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
            <AlertOctagon className="w-3.5 h-3.5" /> Stopped Cars & Wrong-Way Alerted
          </span>
        </div>
      </div>

      {/* Node Status Matrix */}
      <div className={`rounded-2xl p-6 border space-y-4 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
          isDarkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          <Activity className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} /> Multi-Camera Node Health Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map(([cid, node]) => (
            <div key={cid} className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
              isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{cid}</span>
                <span className={`flex items-center gap-1 text-[11px] font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {node.status || 'Online'}
                </span>
              </div>
              <p className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{node.name || cid}</p>
              <div className={`flex items-center justify-between text-[11px] font-mono pt-1 border-t ${
                isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
              }`}>
                <span>FPS: <strong className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>{node.fps || 25.0}</strong></span>
                <span>Vehicles: <strong className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>{node.activeTracks || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
