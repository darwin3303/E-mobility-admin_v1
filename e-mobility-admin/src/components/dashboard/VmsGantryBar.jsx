import React, { useState } from 'react';
import { Tv, Sliders, Volume2, ShieldAlert, CheckCircle, Edit3 } from 'lucide-react';

export default function VmsGantryBar({
  currentMessage = 'EXPRESSWAY OPERATIONS CENTER: DRIVE WITHIN 100 KM/H SPEED LIMIT • MAINTAIN 50M SAFE DISTANCE • WEAR SEATBELTS',
  sector = 'E01 KM 14.2 - 68.4',
  onUpdateMessage,
  isDarkMode = true
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [msgInput, setMsgInput] = useState(currentMessage);

  return (
    <div className={`border rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-800 shadow-xl' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* VMS Gantry Simulator Badge */}
      <div className="flex items-center space-x-2.5 flex-shrink-0">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <Tv className="w-4 h-4" />
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Overhead Variable Message Signs (VMS)
          </span>
          <span className={`text-xs font-semibold ${
            isDarkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            Sector: <strong className={`font-mono ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{sector}</strong>
          </span>
        </div>
      </div>

      {/* Digital Amber Matrix LED Banner */}
      <div className="flex-1 w-full bg-black rounded-xl p-2.5 border-2 border-slate-800 shadow-inner overflow-hidden flex items-center">
        {!isEditing ? (
          <div className="w-full flex items-center justify-between">
            <span className="font-mono text-xs font-extrabold text-amber-400 tracking-widest uppercase truncate animate-pulse">
              ● {msgInput}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-[10px] text-slate-400 hover:text-cyan-400 px-2 py-0.5 rounded bg-slate-800 flex-shrink-0"
            >
              Edit Gantry
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center space-x-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-amber-500/60 rounded px-2 py-1 text-xs text-amber-300 font-mono focus:outline-none"
            />
            <button
              onClick={() => {
                setIsEditing(false);
                if (onUpdateMessage) onUpdateMessage(msgInput);
              }}
              className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400"
            >
              Broadcast
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
