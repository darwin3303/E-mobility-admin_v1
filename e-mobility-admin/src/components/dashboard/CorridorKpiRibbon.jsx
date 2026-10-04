import React from 'react';
import {
  TrendingUp,
  Activity,
  Zap,
  Radio,
  ShieldCheck,
  AlertOctagon,
  Car,
  Gauge
} from 'lucide-react';

export default function CorridorKpiRibbon({
  telemetry = null,
  totalRegistryCount = 7000,
  violationsCount = 4,
  activeHazardsCount = 0,
  isDarkMode = true
}) {
  const avgSpeed = telemetry?.averageSpeedKmh || 98.4;
  const activeTracks = telemetry?.activeTracks || 157;
  const los = telemetry?.levelOfService || 'LOS A (Free Flow)';
  const density = telemetry?.trafficDensity || 'Optimal';
  const camerasCount = telemetry?.camerasOnline || 8;

  const cardBaseStyle = isDarkMode
    ? 'bg-slate-900/90 border-slate-800/90 text-slate-100 shadow-lg'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';

  const labelStyle = `text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const subtextStyle = `text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const numberStyle = `text-xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
      {/* KPI 1: Level of Service & Flow */}
      <div className={`border p-3 rounded-xl relative overflow-hidden flex flex-col justify-between transition-colors ${cardBaseStyle}`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>Level of Service</span>
          <span className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
        </div>
        <div className="mt-1">
          <div className={`text-sm font-extrabold truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{los}</div>
          <span className={subtextStyle}>Status: {density}</span>
        </div>
      </div>

      {/* KPI 2: Network Average Speed */}
      <div className={`border p-3 rounded-xl flex flex-col justify-between transition-colors ${cardBaseStyle}`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>Corridor Avg Speed</span>
          <Gauge className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={numberStyle}>{avgSpeed}</span>
          <span className={subtextStyle}>km/h</span>
        </div>
      </div>

      {/* KPI 3: Real-Time Active Vehicles */}
      <div className={`border p-3 rounded-xl flex flex-col justify-between transition-colors ${cardBaseStyle}`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>Vehicles in Sector</span>
          <Car className={`w-3.5 h-3.5 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-black font-mono ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>{activeTracks}</span>
          <span className={subtextStyle}>detected</span>
        </div>
      </div>

      {/* KPI 4: CCTV Surveillance Nodes */}
      <div className={`border p-3 rounded-xl flex flex-col justify-between transition-colors ${cardBaseStyle}`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>CCTV Node Grid</span>
          <Radio className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={numberStyle}>{camerasCount} / 8</span>
          <span className={`text-[10px] font-mono font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>100% ONLINE</span>
        </div>
      </div>

      {/* KPI 5: Active Safety Hazards */}
      <div className={`border p-3 rounded-xl flex flex-col justify-between transition-all ${
        activeHazardsCount > 0 
          ? isDarkMode 
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-lg' 
            : 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
          : cardBaseStyle
      }`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>Hazard Queue</span>
          <AlertOctagon className={`w-3.5 h-3.5 ${
            activeHazardsCount > 0 
              ? isDarkMode ? 'text-rose-400 animate-pulse' : 'text-rose-600 animate-pulse'
              : isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-black font-mono ${
            activeHazardsCount > 0 
              ? isDarkMode ? 'text-rose-400' : 'text-rose-600'
              : isDarkMode ? 'text-slate-200' : 'text-slate-900'
          }`}>
            {activeHazardsCount}
          </span>
          <span className={subtextStyle}>
            {activeHazardsCount > 0 ? 'Action Needed' : 'Corridor Clear'}
          </span>
        </div>
      </div>

      {/* KPI 6: Speed Enforcement & Fines */}
      <div className={`border p-3 rounded-xl flex flex-col justify-between transition-colors ${cardBaseStyle}`}>
        <div className="flex items-center justify-between">
          <span className={labelStyle}>e-Challan Ready</span>
          <ShieldCheck className={`w-3.5 h-3.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-black font-mono ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{violationsCount}</span>
          <span className={subtextStyle}>e-tickets</span>
        </div>
      </div>
    </div>
  );
}
