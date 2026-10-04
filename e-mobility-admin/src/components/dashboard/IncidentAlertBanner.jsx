import React from 'react';
import { AlertTriangle, AlertOctagon, X, ShieldAlert, ArrowRight } from 'lucide-react';

export default function IncidentAlertBanner({ incidents = [], onDismiss, onInspectCamera }) {
  if (!incidents || incidents.length === 0) return null;

  const active = incidents[0]; // Most recent high-priority hazard
  const isEmergency = active.severity === 'EMERGENCY' || active.type === 'WRONG_WAY_DRIVING';

  return (
    <div className={`w-full mb-4 px-4 py-3 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-pulse ${
      isEmergency 
        ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-500/80 dark:text-rose-100' 
        : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-500/80 dark:text-amber-100'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isEmergency ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
          {isEmergency ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-xs px-2 py-0.5 rounded bg-black/10 dark:bg-black/40 uppercase">
              {active.severity || 'ALERT'}
            </span>
            <span className="font-bold text-sm">
              {active.type === 'WRONG_WAY_DRIVING' && '🚨 CRITICAL: Wrong-Way Driver Detected on Expressway!'}
              {active.type === 'STOPPED_VEHICLE' && `🛑 HAZARD: Vehicle Stationary in Active Lane (${active.duration_s || 4}s)`}
              {!['WRONG_WAY_DRIVING', 'STOPPED_VEHICLE'].includes(active.type) && (active.type || 'Road Safety Incident')}
            </span>
          </div>
          <div className="text-xs opacity-90 mt-0.5 flex items-center gap-3">
            <span>Camera: <strong className="underline uppercase">{active.camera_id}</strong></span>
            {active.lane && <span>Lane: <strong>{active.lane}</strong></span>}
            {active.plate && <span>Plate: <strong className="font-mono bg-black/10 dark:bg-black/30 px-1 py-0.5 rounded">{active.plate}</strong></span>}
            <span>Time: {active.timestamp || 'Just now'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onInspectCamera && (
          <button
            onClick={() => onInspectCamera(active.camera_id)}
            className="px-3 py-1.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-slate-300 dark:border-white/20"
          >
            Inspect Node <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {onDismiss && (
          <button 
            onClick={() => onDismiss(active)}
            className="p-1 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded-lg text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
