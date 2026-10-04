import React from 'react';
import { ShieldCheck, AlertTriangle, Car, Clock, ChevronRight } from 'lucide-react';

export default function LiveAnprStream({
  violations = [],
  onSelectViolation,
  maxItems = 8,
  isDarkMode = true
}) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col h-full transition-colors ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-800 shadow-xl text-slate-100' 
        : 'bg-white border-slate-200 shadow-sm text-slate-800'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Live ANPR License Plate Radar
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
          isDarkMode 
            ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' 
            : 'text-cyan-700 bg-cyan-50 border-cyan-200'
        }`}>
          7,000 DB Verified
        </span>
      </div>

      {/* Plate Stream Items */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[380px]">
        {violations.slice(0, maxItems).map((v, idx) => {
          const isSpeeding = v.speed > (v.limit || 100);
          return (
            <div
              key={v.id || idx}
              onClick={() => onSelectViolation && onSelectViolation(v)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                isDarkMode 
                  ? 'bg-slate-950/70 border-slate-800/80 hover:border-cyan-500/50' 
                  : 'bg-slate-50 border-slate-200 hover:border-cyan-500/60 hover:bg-slate-100/60 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {/* Sri Lankan Plate Badge (high contrast black & yellow) */}
                <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md font-mono font-black text-xs text-amber-300 shadow-inner tracking-wider">
                  {v.plate}
                </div>

                <div>
                  <div className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    <span>{v.makeModel || 'Toyota Corolla'}</span>
                  </div>
                  <div className={`text-[10px] flex items-center gap-1 mt-0.5 font-mono ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>{v.cam || 'Cam-01'}</span>
                    <span>•</span>
                    <span>{v.time || 'Just now'}</span>
                  </div>
                </div>
              </div>

              {/* Speed & Tag */}
              <div className="text-right">
                <div className={`text-xs font-mono font-bold ${
                  isSpeeding 
                    ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') 
                    : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                }`}>
                  {v.speed} <span className={`text-[10px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>km/h</span>
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                  isSpeeding 
                    ? (isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700 border border-rose-200')
                    : (isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                }`}>
                  {isSpeeding ? 'SPEEDING' : 'NORMAL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
