import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Siren,
  Send,
  Radio,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function IncidentQueuePanel({
  incidents = [],
  onInspectCamera,
  onDispatchPatrol,
  onAcknowledge,
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
          <Siren className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Active Incident Triage Queue
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
          incidents.length > 0 
            ? (isDarkMode 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-rose-50 text-rose-700 border border-rose-300')
            : (isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
        }`}>
          {incidents.length > 0 ? `${incidents.length} ACTION REQUIRED` : 'ALL CLEAR'}
        </span>
      </div>

      {/* Incident List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 max-h-[380px]">
        {incidents.length === 0 ? (
          <div className="py-10 text-center text-xs">
            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-emerald-400/60' : 'text-emerald-500'}`} />
            <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Corridor Safe & Free Flowing</p>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No stationary hazards or wrong-way vehicles detected</p>
          </div>
        ) : (
          incidents.map((inc, idx) => {
            const isEmergency = inc.severity === 'EMERGENCY' || inc.type === 'WRONG_WAY_DRIVING';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all space-y-2 ${
                  isEmergency
                    ? (isDarkMode
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-100'
                        : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm')
                    : (isDarkMode
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-100'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm')
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`p-1.5 rounded-lg ${isEmergency ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                      {isEmergency ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span>{inc.type === 'STOPPED_VEHICLE' ? 'Stationary Vehicle in Lane' : inc.type === 'WRONG_WAY_DRIVING' ? 'Wrong-Way Driver Detected' : inc.type}</span>
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Node: <strong className={`uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inc.camera_id}</strong> • {inc.lane || 'Lane 2'}
                      </div>
                    </div>
                  </div>

                  {inc.plate && (
                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-amber-400/20 shadow-sm">
                      {inc.plate}
                    </span>
                  )}
                </div>

                {/* Operator Actions */}
                <div className={`flex items-center justify-between pt-1 border-t text-xs ${
                  isDarkMode ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Duration: {inc.duration_s || '4.0'}s</span>
                  <div className="flex items-center space-x-1.5">
                    {onInspectCamera && (
                      <button
                        onClick={() => onInspectCamera(inc.camera_id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isDarkMode 
                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                            : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                        }`}
                      >
                        Camera <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onDispatchPatrol && onDispatchPatrol(inc)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shadow transition-colors flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3" /> Patrol
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
