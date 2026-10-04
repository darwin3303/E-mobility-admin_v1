import React, { useState, useEffect } from 'react';
import { X, Sliders, ShieldCheck, Camera, Activity, AlertOctagon, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { AI_SERVER_URL } from '../../config/env';

export default function SingleCameraModal({
  camId,
  cameraInfo,
  onClose,
  onOpenCalibration,
  aiServerUrl = AI_SERVER_URL,
  isDarkMode = true
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState('telemetry');
  const streamUrl = `${aiServerUrl}/video_feed/${camId}`;

  if (!camId) return null;

  const info = cameraInfo || {
    name: `Camera ${camId.toUpperCase()}`,
    location: 'Expressway Sector',
    speedLimit: 100,
    fps: 30.0,
    activeTracks: 14,
    status: 'Online',
    accuracy: 98.8
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              LIVE SURVEILLANCE
            </div>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {info.name || camId.toUpperCase()}
                <span className={`text-xs font-normal px-2 py-0.5 rounded border ${
                  isDarkMode ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-200 border-slate-300'
                }`}>
                  {info.location || 'Expressway Corridor'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCalibration && onOpenCalibration(camId)}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-500 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" /> Calibrate Geometry
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-950'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 flex-1 overflow-hidden">
          {/* Main Video Screen (2 Cols) */}
          <div className="lg:col-span-2 bg-black relative flex items-center justify-center overflow-hidden min-h-[380px]">
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={streamUrl}
                alt={`${camId} HD Stream`}
                className="w-full h-full object-contain select-none"
              />
            </div>

            {/* Video Floating Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
                <span>Zoom: <strong>{zoomLevel.toFixed(1)}x</strong></span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1 hover:text-sky-400"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  className="p-1 hover:text-sky-400"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pointer-events-auto bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-emerald-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>30.0 FPS • Metric Homography Active</span>
              </div>
            </div>
          </div>

          {/* Side Telemetry Panel (1 Col) */}
          <div className={`border-l p-5 flex flex-col justify-between overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Activity className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} /> Node Telemetry & Speed Analysis
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border shadow-sm ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Speed Limit</span>
                  <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {info.speedLimit || 100} <span className="text-xs text-slate-400 font-normal">km/h</span>
                  </span>
                </div>
                <div className={`p-3 rounded-xl border shadow-sm ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Vehicles</span>
                  <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{info.activeTracks || 16}</span>
                </div>
                <div className={`p-3 rounded-xl border shadow-sm ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Node Accuracy</span>
                  <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{info.accuracy || 98.6}%</span>
                </div>
                <div className={`p-3 rounded-xl border shadow-sm ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI Latency</span>
                  <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {info.inferenceLatencyMs || 7.5} <span className="text-xs text-slate-400 font-normal">ms</span>
                  </span>
                </div>
              </div>

              {/* Lane Distribution Breakdown */}
              <div className={`p-4 rounded-xl border shadow-sm space-y-2.5 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  Lane Occupancy & Discipline
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Lane 1 (Overtaking)</span>
                      <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{info.lane1Avg || 112} km/h avg</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="bg-cyan-500 h-full w-[35%] rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Lane 2 (Cruising)</span>
                      <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{info.lane2Avg || 94} km/h avg</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="bg-emerald-500 h-full w-[52%] rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Lane 3 (Slow / Heavy)</span>
                      <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{info.lane3Avg || 82} km/h avg</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="bg-amber-500 h-full w-[24%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className={`pt-4 border-t flex items-center justify-between text-xs ${
              isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stream Synchronized
              </span>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
