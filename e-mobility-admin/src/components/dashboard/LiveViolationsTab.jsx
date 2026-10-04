import React, { useState } from 'react';
import CameraCard from './CameraCard';
import { Camera, Filter, Sliders, ShieldCheck, Radio } from 'lucide-react';
import { AI_SERVER_URL } from '../../config/env';

export default function LiveViolationsTab({
  cameras = [],
  onInspectCamera,
  onCalibrateCamera,
  activeFilter = 'All',
  onFilterChange,
  aiServerUrl = AI_SERVER_URL,
  isDarkMode = true
}) {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredCameras = cameras.filter((cam) => {
    if (filterStatus === 'Online' && cam.status !== 'Online') return false;
    if (filterStatus === 'Offline' && cam.status === 'Online') return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-header Filter Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 shadow-xl' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Expressway CCTV Surveillance Grid
              <span className={`text-[11px] font-normal px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                8 Calibrated Nodes Active
              </span>
            </h2>
            <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Zero-lag 30 FPS YOLOv8 stream with metric homography speed tracking and automated ANPR callouts
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {['All', 'Online', 'Offline'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status} {status === 'All' ? `(${cameras.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 8-Camera Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCameras.map((cam) => (
          <CameraCard
            key={cam.camId || cam.id}
            camId={cam.camId || `cam_${String(cam.id).padStart(2, '0')}`}
            name={cam.name}
            location={cam.location}
            speedLimit={cam.speedLimit || 100}
            accuracy={cam.accuracy || 98.6}
            status={cam.status || 'Online'}
            activeTracks={cam.activeTracks || 12}
            isDarkMode={isDarkMode}
            onInspect={onInspectCamera}
            onCalibrate={onCalibrateCamera}
            aiServerUrl={aiServerUrl}
          />
        ))}
      </div>
    </div>
  );
}
