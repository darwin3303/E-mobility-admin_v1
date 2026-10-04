import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Radio,
  Bell,
  Sun,
  Moon,
  Search,
  MapPin,
  ChevronDown,
  CloudSun,
  Wifi,
  Clock,
  AlertTriangle,
  Siren,
  Maximize,
  AlertOctagon,
  FileCheck,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  ExternalLink,
  X
} from 'lucide-react';

export default function TacticalTopBar({
  selectedCorridor = 'E01 Southern Expressway',
  onSelectCorridor,
  realtimeStatus = 'CONNECTED_WS',
  activeIncidentsCount = 0,
  isDarkMode = true,
  onToggleDarkMode,
  searchQuery = '',
  onSearchChange,
  notifications = [],
  onMarkAllAsRead,
  onNotificationClick,
  onViewAll,
  onOpenIncidentQueue
}) {
  const [timeStr, setTimeStr] = useState('');
  const [isCorridorDropdownOpen, setIsCorridorDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryConfig = (type) => {
    switch (type) {
      case 'violation':
      case 'speed':
        return {
          icon: AlertOctagon,
          badgeText: 'Speed Violation',
          iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-500',
          dotBg: 'bg-rose-500',
          pillStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          defaultTab: 'Reports'
        };
      case 'warning':
      case 'cctv':
      case 'ai':
        return {
          icon: AlertTriangle,
          badgeText: 'CCTV / AI Warning',
          iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-500',
          dotBg: 'bg-amber-500',
          pillStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          defaultTab: 'AI Diagnostics'
        };
      case 'system':
      case 'traffic':
        return {
          icon: Radio,
          badgeText: 'Traffic / System Alert',
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
          dotBg: 'bg-cyan-400',
          pillStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          defaultTab: 'Dashboard'
        };
      case 'success':
      case 'report':
      case 'pdf':
      case 'csv':
        return {
          icon: FileCheck,
          badgeText: 'Report Ready',
          iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dotBg: 'bg-emerald-500',
          pillStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          defaultTab: 'Reports'
        };
      default:
        return {
          icon: Info,
          badgeText: 'System Alert',
          iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          dotBg: 'bg-blue-400',
          pillStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          defaultTab: 'Dashboard'
        };
    }
  };

  // Live Precision Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 100));
      setTimeStr(`${hours}:${mins}:${secs}.${ms} GMT+5:30`);
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const corridors = [
    { id: 'E01', name: 'E01 Southern Expressway (Kottawa - Hambantota)', length: '222 km', cams: 8, status: 'Normal' },
    { id: 'E02', name: 'E02 Outer Circular Expressway (Kadawatha - Kottawa)', length: '29 km', cams: 6, status: 'Dense' },
    { id: 'E03', name: 'E03 Colombo - Katunayake Expressway (Peliyagoda - BIA)', length: '26 km', cams: 4, status: 'Normal' },
    { id: 'E04', name: 'E04 Central Expressway (Mirigama - Kurunegala)', length: '41 km', cams: 4, status: 'Normal' }
  ];

  return (
    <header className={`h-14 px-4 border-b flex items-center justify-between z-30 select-none backdrop-blur-md transition-colors ${
      isDarkMode
        ? 'bg-slate-950/90 border-slate-800/90 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
    }`}>
      {/* Left: Brand & Corridor Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-xs tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>E-MOBILITY</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                isDarkMode 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                  : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
              }`}>
                TMC OPS-01
              </span>
            </div>
          </div>
        </div>

        <div className={`h-5 w-[1px] hidden sm:block ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

        {/* Corridor Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCorridorDropdownOpen(!isCorridorDropdownOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-100/90 border-slate-200 text-slate-800 hover:bg-slate-200/80 hover:border-slate-300'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <span className="truncate max-w-[210px]">{selectedCorridor}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>

          {isCorridorDropdownOpen && (
            <div className={`absolute top-full left-0 mt-1.5 w-80 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 border animate-in fade-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Select Expressway Corridor
              </div>
              {corridors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    if (onSelectCorridor) onSelectCorridor(c.name);
                    setIsCorridorDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    selectedCorridor.includes(c.id)
                      ? isDarkMode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-300 font-semibold'
                      : isDarkMode
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.length} • {c.cams} Calibrated CCTV Nodes</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    c.status === 'Normal' 
                      ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'
                      : isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {c.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Timecode & Weather */}
      <div className={`hidden xl:flex items-center space-x-5 text-xs font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-100/90 border-slate-200'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{timeStr || '16:15:00.00'}</span>
        </div>

        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-[11px] ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'
        }`}>
          <CloudSun className={`w-3.5 h-3.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
          <span>Dry Asphalt • 29°C • Visibility 12km</span>
        </div>
      </div>

      {/* Right Actions & Status */}
      <div className="flex items-center space-x-2.5">
        {/* Real-Time WebSocket Telemetry Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border ${
          realtimeStatus.includes('CONNECTED')
            ? isDarkMode 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : isDarkMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
              : 'bg-amber-50 border-amber-300 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            realtimeStatus.includes('CONNECTED')
              ? isDarkMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500 animate-pulse'
              : isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
          }`}></span>
          <span className="hidden sm:inline">LIVE 30 FPS</span>
        </div>

        {/* Hazard Alert Badge */}
        {activeIncidentsCount > 0 && (
          <button
            onClick={onOpenIncidentQueue}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold animate-pulse transition-colors ${
              isDarkMode
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Siren className={`w-3.5 h-3.5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>{activeIncidentsCount} HAZARDS</span>
          </button>
        )}

        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search plate / case..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className={`border rounded-lg pl-8 pr-3 py-1 text-xs outline-none focus:border-cyan-500 w-44 transition-all ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500 focus:bg-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
            }`}
          />
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Button & Dropdown Container */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`p-2 rounded-xl border relative transition-all duration-150 ${
              isNotificationOpen
                ? isDarkMode
                  ? 'bg-slate-800 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-200 border-cyan-500 text-slate-900 shadow-md'
                : isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 hover:border-slate-300'
            }`}
            title="TMC Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,59,48,0.7)] border-2 ${
                isDarkMode ? 'border-[#070b12]' : 'border-white'
              } leading-none tracking-tight animate-in zoom-in-75`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div
              className={`absolute top-full right-0 mt-2 w-[340px] sm:w-[410px] rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
                isDarkMode
                  ? 'bg-slate-950/98 backdrop-blur-2xl border-slate-800 text-slate-100 shadow-2xl shadow-black'
                  : 'bg-white/98 backdrop-blur-2xl border-slate-200 text-slate-800 shadow-2xl shadow-slate-400/30'
              }`}
            >
              {/* Header */}
              <div className={`p-3.5 px-4 border-b flex items-center justify-between gap-2 ${
                isDarkMode ? 'border-slate-800/80 bg-slate-900/70' : 'border-slate-100 bg-slate-50/90'
              }`}>
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-extrabold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Special Notifications
                  </span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex-shrink-0">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                      Up to date
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => onMarkAllAsRead && onMarkAllAsRead()}
                    className={`text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap flex-shrink-0 ${
                      isDarkMode
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/40 divide-dashed select-text">
                {notifications.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      No notifications
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Highway telemetry and AI speed monitoring operating normally.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = getCategoryConfig(notif.type);
                    const Icon = config.icon;
                    const isUnread = !notif.read;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(notif);
                          }
                          setIsNotificationOpen(false);
                        }}
                        className={`p-3 px-3.5 flex items-start gap-3 cursor-pointer transition-all duration-150 group relative ${
                          isUnread
                            ? isDarkMode
                              ? 'bg-slate-900/60 hover:bg-slate-800/80'
                              : 'bg-cyan-50/40 hover:bg-cyan-100/50'
                            : isDarkMode
                            ? 'hover:bg-slate-900/50 opacity-80 hover:opacity-100'
                            : 'hover:bg-slate-50 opacity-85 hover:opacity-100'
                        }`}
                      >
                        {/* Unread Accent Bar */}
                        {isUnread && (
                          <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${config.dotBg}`} />
                        )}

                        {/* Severity Icon */}
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${config.iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border ${config.pillStyle}`}>
                              {config.badgeText}
                            </span>
                            <span className={`text-[10px] font-mono flex-shrink-0 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {notif.time}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold leading-snug truncate ${
                            isDarkMode ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-700'
                          }`}>
                            {notif.title}
                          </h4>

                          <p className={`text-[11px] leading-relaxed line-clamp-2 mt-0.5 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {notif.message}
                          </p>

                          <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Open {notif.targetTab || 'view'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Unread Glowing Dot */}
                        {isUnread && (
                          <div className={`w-2 h-2 rounded-full ${config.dotBg} mt-1.5 flex-shrink-0 shadow-sm animate-pulse`} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className={`p-2.5 px-4 border-t flex items-center justify-between ${
                isDarkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
              }`}>
                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {notifications.length} Total Alerts
                </span>
                <button
                  onClick={() => {
                    if (onViewAll) onViewAll();
                    setIsNotificationOpen(false);
                  }}
                  className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 hover:border-slate-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>View All in Audit Log</span>
                  <ExternalLink className="w-3 h-3 text-cyan-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
