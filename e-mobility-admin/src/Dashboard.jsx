import React, { useState, useEffect, useRef } from 'react';
import { AI_SERVER_URL } from './config/env';
import {
  LayoutDashboard,
  Video,
  Cpu,
  FileText,
  Settings,
  Bell,
  ShieldCheck,
  Radio,
  TrendingUp,
  Camera,
  Download,
  CheckCircle,
  Calendar,
  Database,
  Save,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Activity,
  Zap,
  ChevronUp,
  ChevronDown,
  X,
  Menu,
  Moon,
  Sun,
  Search,
  RefreshCw,
  Printer,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Pin,
  PinOff,
  User,
  Users,
  Phone,
  Mail,
  Car,
  Shield,
  UserCheck,
  CheckCircle2,
  LogOut,
  AlertOctagon,
  Tv
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/auth.service';
import { realtimeClient } from './services/realtime.client';
import SettingsSection from './components/SettingsSection';
import TacticalTopBar from './components/dashboard/TacticalTopBar';
import OverviewView from './components/dashboard/OverviewView';
import LiveViolationsTab from './components/dashboard/LiveViolationsTab';
import AIDiagnosticsTab from './components/dashboard/AIDiagnosticsTab';
import SingleCameraModal from './components/dashboard/SingleCameraModal';
import CalibrationModal from './components/dashboard/CalibrationModal';
import SpeedViolationAuditTab from './components/dashboard/SpeedViolationAuditTab';

export default function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // State Management
  const [currentMenu, setCurrentMenu] = useState('Dashboard');
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const [isPinned, setIsPinned] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Speed Violation Detected',
      message: 'SP KY-9080 clocked at 141 km/h (Limit: 100 km/h) at Kadawatha Entry Gate.',
      type: 'violation',
      time: '2m ago',
      read: false,
      targetTab: 'Reports'
    },
    {
      id: 2,
      title: 'Audit PDF Generated',
      message: 'Speed Violation Audit Report for E01 Southern Expressway generated.',
      type: 'success',
      time: '12m ago',
      read: false,
      targetTab: 'Reports'
    },
    {
      id: 3,
      title: 'CCTV Latency Alert',
      message: 'Cam-02 (Kadawatha) edge frame latency elevated to 142ms. Auto-tuned buffer.',
      type: 'warning',
      time: '34m ago',
      read: true,
      targetTab: 'AI Diagnostics'
    },
    {
      id: 4,
      title: 'Traffic System Alert',
      message: 'Dense vehicle queue forming near Peliyagoda Interchange Km 8.5.',
      type: 'system',
      time: '1h ago',
      read: true,
      targetTab: 'Dashboard'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState('E01 Southern Expressway');
  const [isHovered, setIsHovered] = useState(false);

  // Real-time State & Modals
  const [telemetry, setTelemetry] = useState(null);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('CONNECTED_WS');
  const [inspectingCamId, setInspectingCamId] = useState(null);
  const [calibratingCamId, setCalibratingCamId] = useState(null);

  // User Management State (Synced with Shared Backend)
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Settings State
  const [speedLimit, setSpeedLimit] = useState('100');
  const [smsDispatch, setSmsDispatch] = useState(true);
  const [autoProcess, setAutoProcess] = useState(true);

  // Master Cameras List
  const [cameras, setCameras] = useState([
    { id: 1, camId: 'cam_01', name: 'Cam-01 (Southern Expy Km 68.4)', location: 'Pinnaduwa Interchange', speedLimit: 100, accuracy: 98.6, status: 'Online', activeTracks: 14 },
    { id: 2, camId: 'cam_02', name: 'Cam-02 (Outer Circular Km 14.2)', location: 'Kadawatha Interchange', speedLimit: 100, accuracy: 97.4, status: 'Online', activeTracks: 28 },
    { id: 3, camId: 'cam_03', name: 'Cam-03 (Katunayake Expy Km 8.5)', location: 'Peliyagoda Interchange', speedLimit: 100, accuracy: 99.1, status: 'Online', activeTracks: 11 },
    { id: 4, camId: 'cam_04', name: 'Cam-04 (Central Expy Km 22.1)', location: 'Mirigama Interchange', speedLimit: 100, accuracy: 99.4, status: 'Online', activeTracks: 9 },
    { id: 5, camId: 'cam_05', name: 'Cam-05 (Southern Expy Km 34.8)', location: 'Dodangoda Interchange', speedLimit: 100, accuracy: 98.2, status: 'Online', activeTracks: 15 },
    { id: 6, camId: 'cam_06', name: 'Cam-06 (Outer Circular Km 8.1)', location: 'Kaduwela Interchange', speedLimit: 100, accuracy: 97.9, status: 'Online', activeTracks: 18 },
    { id: 7, camId: 'cam_07', name: 'Cam-07 (Katunayake Expy Km 19.4)', location: 'Ja-Ela Interchange', speedLimit: 100, accuracy: 99.0, status: 'Online', activeTracks: 12 },
    { id: 8, camId: 'cam_08', name: 'Cam-08 (Central Expy Km 39.5)', location: 'Kurunegala Interchange', speedLimit: 100, accuracy: 98.8, status: 'Online', activeTracks: 16 },
  ]);

  // Violations List (Rolling Radar)
  const [violations, setViolations] = useState([
    { id: 1, plate: 'WP CAB-4521', makeModel: 'Toyota Corolla (Silver)', type: 'Speeding', speed: 128, limit: 100, time: '2 sec ago', cam: 'Cam-07', confidence: 96, checkpoint: 'Kottawa Interchange' },
    { id: 2, plate: 'SP KY-9080', makeModel: 'Nissan Sunny (Black)', type: 'Speeding', speed: 141, limit: 100, time: '14 sec ago', cam: 'Cam-03', confidence: 98, checkpoint: 'Kadawatha Entry Gate' },
    { id: 3, plate: 'WP BBC-112', makeModel: 'Honda Grace (White)', type: 'Speeding', speed: 156, limit: 100, time: '31 sec ago', cam: 'Cam-08', confidence: 99, checkpoint: 'Dodangoda Exit Hub' },
    { id: 4, plate: 'NW LD-7734', makeModel: 'Mitsubishi Lancer (Red)', type: 'Speeding', speed: 119, limit: 100, time: '48 sec ago', cam: 'Cam-07', confidence: 92, checkpoint: 'Kerawalapitiya Junction' },
    { id: 5, plate: 'CP AB-1234', makeModel: 'Toyota Prius (White)', type: 'Normal', speed: 94, limit: 100, time: '1 min ago', cam: 'Cam-02', confidence: 97, checkpoint: 'Kadawatha Entry Gate' },
    { id: 6, plate: 'WP CBM-4821', makeModel: 'Kia Sorento (Grey)', type: 'Normal', speed: 98, limit: 100, time: '2 min ago', cam: 'Cam-01', confidence: 99, checkpoint: 'Pinnaduwa Interchange' },
  ]);

  const notifiedVioKeysRef = useRef(new Set([
    'WP CAB-4521-128',
    'SP KY-9080-141',
    'WP BBC-112-156',
    'NW LD-7734-119'
  ]));

  const addNotification = (titleOrMsg, maybeMsg, maybeType = 'info', maybeTab = null) => {
    let title = titleOrMsg;
    let message = maybeMsg;
    let type = maybeType;
    let targetTab = maybeTab;

    if (maybeMsg === undefined) {
      title = 'System Alert';
      message = titleOrMsg;
      type = 'info';
    }

    if (!targetTab) {
      if (type === 'violation' || type === 'speed') targetTab = 'Reports';
      else if (type === 'warning' || type === 'cctv' || type === 'ai') targetTab = 'AI Diagnostics';
      else if (type === 'success' || type === 'report' || type === 'pdf' || type === 'csv') targetTab = 'Reports';
      else targetTab = 'Dashboard';
    }

    const newNotification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      time: 'Just now',
      read: false,
      targetTab
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    // Mark clicked notification as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    // Navigate to related target tab
    if (notif.targetTab) {
      setCurrentMenu(notif.targetTab);
    }
  };

  // Connect Real-Time Client on Mount
  useEffect(() => {
    realtimeClient.start();

    const unsubTel = realtimeClient.subscribeTelemetry((data) => {
      setTelemetry(data);
      if (data.nodes) {
        setCameras((prev) =>
          prev.map((cam) => {
            const liveNode = data.nodes[cam.camId];
            if (liveNode) {
              return {
                ...cam,
                activeTracks: liveNode.activeTracks || cam.activeTracks,
                status: liveNode.status || cam.status,
                speedLimit: liveNode.speedLimit || cam.speedLimit,
              };
            }
            return cam;
          })
        );
      }
    });

    // Realtime speed violation notifications (EXCLUDING normal vehicles & duplicate polls)
    const unsubVio = realtimeClient.subscribeViolation((vio) => {
      // STRICT REQUIREMENT: Do NOT notify for normal vehicle detections!
      if (!vio || vio.type === 'Normal' || (vio.speed && vio.limit && vio.speed <= vio.limit)) {
        return;
      }

      const vioKey = `${vio.plate || ''}-${vio.speed || ''}`;
      if (notifiedVioKeysRef.current.has(vioKey)) {
        return;
      }
      notifiedVioKeysRef.current.add(vioKey);

      addNotification(
        `Speed Violation: ${vio.plate || 'Vehicle'}`,
        `Clocked at ${vio.speed} km/h (Limit: ${vio.limit || 100} km/h) at ${vio.checkpoint || vio.cam || 'Highway Checkpoint'}`,
        'violation',
        'Reports'
      );
    });

    const unsubInc = realtimeClient.subscribeIncident((incident) => {
      setActiveIncidents((prev) => {
        const exists = prev.some((i) => i.track_id === incident.track_id && i.camera_id === incident.camera_id);
        if (!exists) {
          addNotification(
            `Traffic Alert: ${incident.type || 'Hazard Detected'}`,
            `${incident.camera_id?.toUpperCase() || 'Highway Node'} - ${incident.lane || 'Lane 2'}: ${incident.description || 'Abnormal stoppage observed'}`,
            'system',
            'Dashboard'
          );
          return [incident, ...prev.slice(0, 5)];
        }
        return prev;
      });
    });

    const unsubConn = realtimeClient.subscribeConnection((st) => {
      setRealtimeStatus(st);
      if (st === 'RECONNECTING' || st === 'DISCONNECTED') {
        addNotification(
          'CCTV & Edge Connection Alert',
          'AI Vision edge node stream disconnected. Attempting automatic reconnection...',
          'warning',
          'AI Diagnostics'
        );
      }
    });

    return () => {
      unsubTel();
      unsubVio();
      unsubInc();
      unsubConn();
      realtimeClient.stop();
    };
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#070b12] text-slate-100' : 'bg-slate-100 text-slate-900'} font-sans select-none transition-colors duration-200`}>
      {/* ------------------------------------------------------------- */}
      {/* TACTICAL SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`transition-all duration-300 ${isPinned || isHovered ? 'w-60' : 'w-16'} ${
          isDarkMode ? 'bg-[#0a0f1d] border-slate-800/80 shadow-2xl' : 'bg-white border-slate-200 shadow-md'
        } border-r flex flex-col justify-between z-40 select-none`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          {/* Logo Brand Header */}
          <div className={`h-14 px-3.5 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {(isPinned || isHovered) && (
                <div>
                  <h1 className={`font-black text-xs tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>E-MOBILITY</h1>
                  <span className="text-[9px] text-cyan-500 tracking-wider font-bold block uppercase font-mono">TMC Sri Lanka</span>
                </div>
              )}
            </div>
            {(isPinned || isHovered) && (
              <button onClick={() => setIsPinned(!isPinned)} className={`${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1 mt-1">
            {[
              { id: 'Dashboard', icon: LayoutDashboard, label: 'TMC Command Center' },
              { id: 'Live Violations', icon: Video, label: 'CCTV Video Wall' },
              { id: 'AI Diagnostics', icon: Cpu, label: 'AI & Edge Diagnostics' },
              { id: 'User Management', icon: Users, label: 'User Management' },
              { id: 'Reports', icon: FileText, label: 'Reports & e-Challan' },
              { id: 'Settings', icon: Settings, label: 'Operations Settings' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentMenu(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600/90 text-white shadow-md shadow-cyan-600/30 font-bold border border-cyan-400/30'
                      : isDarkMode
                      ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {(isPinned || isHovered) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Footer */}
        <div className={`p-2.5 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-center justify-between p-2 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-500 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                RS
              </div>
              {(isPinned || isHovered) && (
                <div className="text-left truncate">
                  <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>R. Senanayake</p>
                  <span className="text-[9px] text-emerald-500 font-mono block">● Operations Lead</span>
                </div>
              )}
            </div>
            {(isPinned || isHovered) && (
              <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-500 p-1 rounded-lg">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tactical Top Navigation Bar */}
        <TacticalTopBar
          selectedCorridor={selectedCorridor}
          onSelectCorridor={(c) => setSelectedCorridor(c)}
          realtimeStatus={realtimeStatus}
          activeIncidentsCount={activeIncidents.length}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onNotificationClick={handleNotificationClick}
          onViewAll={() => setCurrentMenu('Reports')}
          onOpenIncidentQueue={() => setCurrentMenu('Dashboard')}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: MAIN OPERATIONS COMMAND CENTER (OverviewView) */}
          {/* ------------------------------------------------------------- */}
          {currentMenu === 'Dashboard' && (
            <OverviewView
              telemetry={telemetry}
              cameras={cameras}
              violations={violations}
              incidents={activeIncidents}
              isDarkMode={isDarkMode}
              onInspectCamera={(cid) => setInspectingCamId(cid)}
              onCalibrateCamera={(cid) => setCalibratingCamId(cid)}
              onSelectViolation={(v) => setSelectedViolation(v)}
              onDispatchPatrol={(inc) => addNotification('Patrol Dispatched', `Highway unit assigned to ${inc.camera_id?.toUpperCase()} - ${inc.lane || 'Lane 2'}`, 'success')}
              onAcknowledgeIncident={(inc) => setActiveIncidents(prev => prev.filter(i => i.track_id !== inc.track_id))}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: DEDICATED CCTV VIDEO WALL */}
          {/* ------------------------------------------------------------- */}
          {currentMenu === 'Live Violations' && (
            <LiveViolationsTab
              cameras={cameras}
              isDarkMode={isDarkMode}
              onInspectCamera={(cid) => setInspectingCamId(cid)}
              onCalibrateCamera={(cid) => setCalibratingCamId(cid)}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: AI & EDGE DIAGNOSTICS */}
          {currentMenu === 'AI Diagnostics' && (
            <AIDiagnosticsTab
              telemetry={telemetry}
              isDarkMode={isDarkMode}
              onRefresh={() => fetch(`${AI_SERVER_URL}/api/telemetry`).then(r => r.json()).then(setTelemetry)}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: USER MANAGEMENT */}
          {currentMenu === 'User Management' && (
            <div className="space-y-4">
              <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 transition-colors`}>
                <div className="relative flex-1 min-w-[260px]">
                  <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Search by Citizen Name, NIC, Email, Mobile..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className={`w-full ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'} border rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-500 transition-colors`}
                  />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl overflow-hidden transition-colors`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`${isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'} uppercase font-semibold border-b`}>
                      <tr>
                        <th className="p-3.5 pl-5">Citizen / User</th>
                        <th className="p-3.5">National ID (NIC)</th>
                        <th className="p-3.5">Mobile</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5 pr-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {usersList
                        .filter((u) => {
                          if (!userSearchQuery) return true;
                          const q = userSearchQuery.toLowerCase();
                          return (
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.nic && u.nic.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.mobile && u.mobile.includes(q))
                          );
                        })
                        .map((user) => (
                          <tr key={user.id || user.nic} className={`${isDarkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'} transition`}>
                            <td className={`p-3.5 pl-5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</td>
                            <td className="p-3.5 font-mono text-cyan-500">{user.nic}</td>
                            <td className={`p-3.5 font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{user.mobile}</td>
                            <td className={`p-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-500'}`}>
                                {user.role === 'admin' ? 'Administrator' : 'Citizen'}
                              </span>
                            </td>
                            <td className="p-3.5 pr-5 text-right text-emerald-500 font-semibold">Active</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: REPORTS & E-CHALLAN (SPEED & VIOLATION AUDIT) */}
          {/* ------------------------------------------------------------- */}
          {currentMenu === 'Reports' && (
            <SpeedViolationAuditTab isDarkMode={isDarkMode} onNotification={addNotification} />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: SETTINGS */}
          {/* ------------------------------------------------------------- */}
          {currentMenu === 'Settings' && (
            <SettingsSection
              isDarkMode={isDarkMode}
              currentSpeedLimit={speedLimit}
              onSettingsSaved={(newConfig) => {
                if (newConfig.speedLimit) {
                  const newLimit = Number(newConfig.speedLimit);
                  setSpeedLimit(String(newLimit));

                  // Instantly update speed limit across all 8 cameras in state
                  setCameras((prev) =>
                    prev.map((c) => ({
                      ...c,
                      speedLimit: newLimit,
                    }))
                  );

                  // Apply to running AI server & WebSockets immediately
                  realtimeClient.setSpeedLimit(newLimit);
                }
                if (newConfig.smsDispatch !== undefined) setSmsDispatch(newConfig.smsDispatch);
                if (newConfig.autoProcessViolations !== undefined) setAutoProcess(newConfig.autoProcessViolations);
              }}
              addNotification={addNotification}
            />
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HIGH-RES SINGLE CAMERA INSPECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {inspectingCamId && (
        <SingleCameraModal
          camId={inspectingCamId}
          cameraInfo={cameras.find(c => c.camId === inspectingCamId)}
          isDarkMode={isDarkMode}
          onClose={() => setInspectingCamId(null)}
          onOpenCalibration={(cid) => {
            setInspectingCamId(null);
            setCalibratingCamId(cid);
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* IN-UI CAMERA GEOMETRY CALIBRATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {calibratingCamId && (
        <CalibrationModal
          camId={calibratingCamId}
          currentConfig={cameras.find(c => c.camId === calibratingCamId)}
          isDarkMode={isDarkMode}
          onClose={() => setCalibratingCamId(null)}
          onSave={(cid, newConf) => {
            setCameras(prev => prev.map(c => c.camId === cid ? { ...c, ...newConf } : c));
            addNotification('Calibration Updated', `Geometry matrix saved for ${cid.toUpperCase()}`, 'success');
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIOLATION CASE INVESTIGATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 transition-colors`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Violation Investigation Case</h3>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reference ID: #{selectedViolation.id}</p>
              </div>
              <button
                onClick={() => setSelectedViolation(null)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Vehicle Plate</span>
                <p className="text-lg font-mono font-black text-amber-500 mt-1">{selectedViolation.plate}</p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedViolation.makeModel}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Recorded Speed</span>
                <p className="text-lg font-black text-rose-500 mt-1 font-mono">{selectedViolation.speed} km/h</p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Speed Limit: {selectedViolation.limit || 100} km/h</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedViolation(null)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/30"
              >
                Close Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
