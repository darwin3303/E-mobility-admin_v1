import React, { useState } from 'react';
import { X, Sliders, CheckCircle, Save, Info, RefreshCw } from 'lucide-react';

export default function CalibrationModal({
  camId,
  currentConfig,
  onClose,
  onSave,
  isDarkMode = true
}) {
  if (!camId) return null;

  const [widthMeters, setWidthMeters] = useState(currentConfig?.width_m || 10.5);
  const [lengthMeters, setLengthMeters] = useState(currentConfig?.length_m || 45.0);
  const [speedLimit, setSpeedLimit] = useState(currentConfig?.speed_limit_kmh || 100);
  const [flowDirection, setFlowDirection] = useState(currentConfig?.flow_direction || 'towards');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (onSave) {
        onSave(camId, {
          width_m: Number(widthMeters),
          length_m: Number(lengthMeters),
          speed_limit_kmh: Number(speedLimit),
          flow_direction: flowDirection
        });
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Camera Geometry & Speed Calibration
              </h2>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Node: <strong className={`uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{camId}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4">
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
            isDarkMode 
              ? 'bg-cyan-950/40 border-cyan-800/40 text-cyan-200' 
              : 'bg-cyan-50 border-cyan-200 text-cyan-800'
          }`}>
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <span>
              Metric homography calculates ground coordinates $(X, Y)$ in meters based on physical road markers. Adjust lane widths and stretch length below for sub-millimeter speed accuracy.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Road Width Across Lanes (Metres)
              </label>
              <input
                type="number"
                step="0.5"
                value={widthMeters}
                onChange={(e) => setWidthMeters(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-cyan-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              />
              <span className={`text-[11px] mt-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Standard 3-lane expressway = 10.5m</span>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Road Stretch Length (Metres)
              </label>
              <input
                type="number"
                step="1.0"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-cyan-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              />
              <span className={`text-[11px] mt-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Visible corridor length = 45m - 60m</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Speed Limit (km/h)
              </label>
              <select
                value={speedLimit}
                onChange={(e) => setSpeedLimit(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-cyan-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <option value="80">80 km/h (Ramp / Exit)</option>
                <option value="100">100 km/h (Expressway Standard)</option>
                <option value="120">120 km/h (High-Speed Corridor)</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Traffic Flow Direction
              </label>
              <select
                value={flowDirection}
                onChange={(e) => setFlowDirection(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-cyan-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <option value="towards">Approaching Camera (Southbound/Inbound)</option>
                <option value="away">Receding from Camera (Northbound/Outbound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving || savedSuccess}
            className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" /> Calibration Applied!
              </>
            ) : saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Matrix...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Apply Calibration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
