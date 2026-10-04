import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import {
  LayoutGrid,
  Users,
  User,
  Shield,
  ShieldCheck,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Car,
  CreditCard,
  ChevronRight,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  MoreVertical,
  Key,
  History,
  Mail,
  Copy,
  CheckCheck,
  UserX,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Building,
  Calendar,
  Camera,
  UserPlus,
  Eye,
  Globe,
  Laptop,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Database,
  Trash2,
  KeyRound,
  Send
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Synchronized Light / Dark Mode matching the system theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 7-day rides data matching screenshot
  const rideStats = [
    { day: 'Mon', rides: 2140, height: '38%', display: '2,140' },
    { day: 'Tue', rides: 2820, height: '52%', display: '2,820' },
    { day: 'Wed', rides: 2540, height: '46%', display: '2,540' },
    { day: 'Thu', rides: 3750, height: '68%', display: '3,750' },
    { day: 'Fri', rides: 4920, height: '88%', display: '4,920' },
    { day: 'Sat', rides: 5680, height: '100%', display: '5,680' },
    { day: 'Sun', rides: 3190, height: '58%', display: '3,190' }
  ];

  // Admin Activity Log (Actual verified operators)
  const [adminActivities] = useState([
    {
      id: 1,
      admin: 'Nipun S.',
      avatar: 'NS',
      color: 'emerald',
      action: 'Calibrated expressway CCTV camera 02',
      detail: 'ANPR & Speed Sensor Sync',
      time: '10 min ago',
      status: 'Done'
    },
    {
      id: 2,
      admin: 'Admin Commander',
      avatar: 'AC',
      color: 'cyan',
      action: 'Verified traffic telemetry & speed sensor feeds',
      detail: 'Southern Expressway Corridor (E01)',
      time: '1 hr ago',
      status: 'Done'
    },
    {
      id: 3,
      admin: 'Super Administrator',
      avatar: 'SA',
      color: 'purple',
      action: 'Verified system encryption keys and audit trail',
      detail: 'Root Security Protocol AES-256-GCM',
      time: '3 hrs ago',
      status: 'Done'
    }
  ]);

  // Actual verified Admin Users Directory State (Real Accounts Only)
  const [adminsList, setAdminsList] = useState([
    {
      id: 5,
      name: 'Nipun Sudusinghe',
      email: 'nipunsudusinghe523@gmail.com',
      role: 'admin',
      status: 'Active',
      lastLogin: '10 min ago',
      nic: '199852300001',
      department: 'TMC Command Center',
      joinedDate: 'Jan 01, 2024'
    },
    {
      id: 2,
      name: 'Admin Commander',
      email: 'admin@example.com',
      role: 'admin',
      status: 'Active',
      lastLogin: '1 hr ago',
      nic: '198512345678',
      department: 'Expressway Operations',
      joinedDate: 'Jan 01, 2024'
    },
    {
      id: 99,
      name: 'Super Administrator',
      email: 'emobilitysuperadmin@gmail.com',
      role: 'super_admin',
      status: 'Active',
      lastLogin: 'Logged in now',
      nic: '000000000000',
      department: 'TMC Highway Authority Root',
      joinedDate: 'Jan 01, 2024'
    }
  ]);

  // Live synchronization with registered backend user database
  const fetchActualAdmins = async () => {
    try {
      const users = await authService.getUsers();
      if (Array.isArray(users)) {
        const realAdmins = users
          .filter((u) => u.role === 'admin' || u.role === 'super_admin')
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || 'admin',
            status: u.status || 'Active',
            lastLogin: u.role === 'super_admin' ? 'Logged in now' : 'Active recently',
            nic: u.nic || 'N/A',
            department: u.role === 'super_admin' ? 'TMC Highway Authority Root' : 'TMC Highway Operations',
            joinedDate: u.registeredDate || 'Jan 01, 2024'
          }));
        if (realAdmins.length > 0) {
          setAdminsList(realAdmins);
        }
      }
    } catch (err) {
      console.warn('Real admin sync notice:', err.message);
    }
  };

  useEffect(() => {
    fetchActualAdmins();
  }, []);

  // Filter & Search states for Admins
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Dynamic summary stats
  const totalAdmins = adminsList.length;
  const activeAdmins = adminsList.filter((a) => a.status === 'Active').length;
  const pendingAdmins = adminsList.filter((a) => a.status === 'Pending Approval' || a.status === 'Pending Activation').length;
  const suspendedAdmins = adminsList.filter((a) => a.status === 'Suspended').length;

  // Filtered admins list
  const filteredAdmins = adminsList.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.nic.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || admin.status === statusFilter;
    const matchesRole = roleFilter === 'All' || admin.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Modal States
  const [manageModalAdmin, setManageModalAdmin] = useState(null);
  const [manageActiveTab, setManageActiveTab] = useState('profile');
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'approve'|'reject'|'suspend'|'reactivate', admin: {...} }

  // Super Admin → Create Admin states
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({ name: '', officialEmail: '', personalEmail: '' });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminResult, setCreateAdminResult] = useState(null); // { admin, tempPassword, setPasswordUrl, emailSent, emailError }
  const [isResending, setIsResending] = useState(false);

  // Super Admin → Login Photo Audit states
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('All');
  const [selectedPhotoAudit, setSelectedPhotoAudit] = useState(null);
  const [auditPhotoBlobUrl, setAuditPhotoBlobUrl] = useState(null);
  const [auditPhotoViews, setAuditPhotoViews] = useState([]);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  // Fetch Login Audits
  const fetchLoginAudits = async () => {
    setIsLoadingAudits(true);
    try {
      const res = await authService.getLoginAudits({
        search: auditSearch,
        status: auditStatusFilter
      });
      if (res.success && Array.isArray(res.audits)) {
        setAuditLogs(res.audits);
      }
    } catch (err) {
      console.warn('Login audits fetch notice:', err.message);
    } finally {
      setIsLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Login Photo Audit') {
      fetchLoginAudits();
    }
  }, [activeTab, auditSearch, auditStatusFilter]);

  // Open photo audit modal with secure blob retrieval & tracking
  const openAuditPhotoModal = async (audit) => {
    setSelectedPhotoAudit(audit);
    setAuditPhotoBlobUrl(null);
    setAuditPhotoViews([]);
    setPhotoError(null);
    setIsLoadingPhoto(true);

    try {
      // 1. Fetch private photo as authenticated Blob (logs view in backend)
      const blobUrl = await authService.getAuditPhotoBlob(audit.id);
      setAuditPhotoBlobUrl(blobUrl);

      // 2. Fetch Super Admin view access log
      const viewsRes = await authService.getAuditPhotoViews(audit.id);
      if (viewsRes.success) {
        setAuditPhotoViews(viewsRes.views);
      }
    } catch (err) {
      setPhotoError(err.response?.data?.message || err.message || 'Unable to retrieve verification photo.');
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  // Action handlers
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { name, officialEmail, personalEmail } = createAdminForm;

    if (!name?.trim() || name.trim().length < 2) {
      showToast('Please enter the Administrator Full Name (at least 2 characters).', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!officialEmail?.trim() || !emailRegex.test(officialEmail.trim())) {
      showToast('Please enter a valid Official Email address for the administrator.', 'error');
      return;
    }

    if (!personalEmail?.trim() || !emailRegex.test(personalEmail.trim())) {
      showToast('Please enter a valid Personal/Private Email to deliver initial credentials.', 'error');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const res = await authService.createAdmin({
        name: name.trim(),
        officialEmail: officialEmail.trim(),
        personalEmail: personalEmail.trim()
      });

      setCreateAdminResult(res);
      if (res.emailSent === false) {
        showToast(
          `Administrator created, but email dispatch failed (${res.emailError || 'SMTP error'}). Click "Resend Credentials".`,
          'error'
        );
      } else {
        showToast(`Administrator account created for ${name}! Credentials dispatched to ${personalEmail}.`, 'success');
      }

      setCreateAdminForm({ name: '', officialEmail: '', personalEmail: '' });
      fetchActualAdmins();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to create administrator account.', 'error');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleResendCredentials = async (adminId, targetEmail) => {
    setIsResending(true);
    try {
      const res = await authService.resendCredentials(adminId, targetEmail);
      showToast(res.message || 'Fresh credentials generated and emailed.', 'success');
      if (createAdminResult && createAdminResult.admin?.id === adminId) {
        setCreateAdminResult(prev => ({
          ...prev,
          emailSent: true,
          emailError: null,
          tempPassword: res.tempPassword,
          setPasswordUrl: res.setPasswordUrl
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to resend credentials.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleApprove = async (admin) => {
    try {
      await authService.approveAdmin(admin.id);
      setAdminsList((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, status: 'Active', lastLogin: 'Just now' } : a))
      );
      setConfirmModal(null);
      showToast(`Administrator ${admin.name} has been approved successfully!`, 'success');
      fetchActualAdmins();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (admin) => {
    try {
      await authService.rejectAdmin(admin.id);
      setAdminsList((prev) => prev.filter((a) => a.id !== admin.id));
      setConfirmModal(null);
      showToast(`Application for ${admin.name} has been rejected.`, 'info');
      fetchActualAdmins();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Reject failed', 'error');
    }
  };

  const handleToggleSuspend = async (admin) => {
    try {
      const res = await authService.toggleSuspendAdmin(admin.id);
      const newStatus = res.newStatus === 'suspended' ? 'Suspended' : 'Active';
      setAdminsList((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
      );
      if (manageModalAdmin && manageModalAdmin.id === admin.id) {
        setManageModalAdmin((prev) => ({ ...prev, status: newStatus }));
      }
      setConfirmModal(null);
      showToast(
        `Administrator ${admin.name} has been ${newStatus === 'Suspended' ? 'suspended' : 'reactivated'}.`,
        newStatus === 'Suspended' ? 'error' : 'success'
      );
      fetchActualAdmins();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Action failed', 'error');
    }
  };

  const handleRoleChange = (adminId, newRole) => {
    setAdminsList((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a))
    );
    if (manageModalAdmin && manageModalAdmin.id === adminId) {
      setManageModalAdmin((prev) => ({ ...prev, role: newRole }));
    }
    showToast(`Role updated to ${newRole === 'super_admin' ? 'Super Admin' : 'Admin'}.`, 'success');
  };

  const handlePasswordReset = (admin) => {
    showToast(`Password reset link dispatched to ${admin.email}.`, 'success');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
    showToast(`Copied ${text} to clipboard!`, 'info');
  };

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, badge: null },
    { name: 'Admins', icon: Users, badge: pendingAdmins > 0 ? String(pendingAdmins) : null },
    { name: 'Provision Admin', icon: UserPlus, badge: 'Protocol' },
    { name: 'Login Photo Audit', icon: Camera, badge: null },
    { name: 'Users', icon: User, badge: null },
    { name: 'Roles & permissions', icon: Shield, badge: null },
    { name: 'Reports', icon: BarChart3, badge: null },
    { name: 'Audit logs', icon: FileText, badge: null },
    { name: 'Settings', icon: Settings, badge: null }
  ];

  // Helper function for Avatar initials badge
  const getAvatarBadgeClass = (color) => {
    if (isDarkMode) {
      switch (color) {
        case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'cyan': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'indigo': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'amber': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        default: return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    } else {
      switch (color) {
        case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'cyan': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex font-sans select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#080c14] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* -------------------- TOAST NOTIFICATION -------------------- */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- SIDEBAR (LEFT) -------------------- */}
      <aside
        className={`w-64 flex flex-col justify-between p-5 border-r flex-shrink-0 transition-colors duration-200 ${
          isDarkMode ? 'bg-[#070b12] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="relative flex-shrink-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                <ShieldCheck className="w-5 h-5 stroke-[2.4] text-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <h1
                className={`text-[10px] font-bold uppercase tracking-wider font-mono leading-tight ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                E-Mobility Sri Lanka
              </h1>
              <p
                className={`text-sm font-bold tracking-tight leading-tight mt-0.5 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Super Admin
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isDarkMode
                            ? 'text-emerald-950 stroke-[2.5]'
                            : 'text-white stroke-[2.5]'
                          : isDarkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="tracking-tight">{item.name}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isDarkMode
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Label */}
        <div
          className={`pt-4 border-t px-2 flex items-center justify-between ${
            isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDarkMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
              }`}
            ></span>
            <span
              className={`text-xs font-semibold tracking-tight ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Super Admin panel
            </span>
          </div>
          <span
            className={`text-[10px] font-mono ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            v2.4
          </span>
        </div>
      </aside>

      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header
          className={`px-8 py-5 border-b flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md transition-colors duration-200 ${
            isDarkMode ? 'bg-[#080c14]/90 border-slate-800/80' : 'bg-white/90 border-slate-200/90 shadow-sm'
          }`}
        >
          {/* Welcome Title */}
          <div>
            <h1
              className={`text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Welcome back, Super Admin
            </h1>
            <p
              className={`text-xs md:text-sm mt-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Here is what is happening across the platform today.
            </p>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* User Meta */}
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-semibold truncate ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {user?.email || 'emobilitysuperadmin@gmail.com'}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                  }`}
                ></span>
                <span
                  className={`text-xs font-mono font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Role: Super Admin
                </span>
              </div>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-amber-400 hover:border-slate-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Log out Button */}
            <button
              onClick={handleLogout}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isDarkMode
                  ? 'border-slate-800 bg-[#0e1622] hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 text-slate-300'
                  : 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-700'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {/* Body Container */}
        <main className="p-8 space-y-6">
          {activeTab === 'Dashboard' && (
            <>
              {/* -------------------- 4 KPI METRIC CARDS -------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total users */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total users
                    </span>
                    <Users
                      className={`w-4 h-4 transition-opacity ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    12,480
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-bold'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+4.2% this week</span>
                  </div>
                </div>

                {/* 2. Active admins */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Active admins
                    </span>
                    <ShieldCheck
                      className={`w-4 h-4 transition-opacity ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    18
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-bold'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+2 this month</span>
                  </div>
                </div>

                {/* 3. Rides today */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Rides today
                    </span>
                    <Car
                      className={`w-4 h-4 transition-opacity ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    3,205
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-rose-400' : 'text-rose-600 font-bold'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-1.8% vs yesterday</span>
                  </div>
                </div>

                {/* 4. Revenue (LKR) */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Revenue (LKR)
                    </span>
                    <CreditCard
                      className={`w-4 h-4 transition-opacity ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    1.9M
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-bold'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+7.5% this week</span>
                  </div>
                </div>
              </div>

              {/* -------------------- MIDDLE SECTION (CHART & SYSTEM STATUS) -------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Rides in the last 7 days (8 cols) */}
                <div
                  className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col justify-between transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20'
                      : 'bg-white border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`text-base font-bold tracking-tight ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Rides in the last 7 days
                    </h2>
                    <span
                      className={`text-xs font-mono font-medium ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total: 25,040 rides
                    </span>
                  </div>

                  {/* Vertical Bar Chart with background track and gridlines */}
                  <div className="h-60 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-3 relative">
                    {/* Subtle horizontal grid lines */}
                    <div
                      className={`absolute inset-x-3 top-8 border-b border-dashed pointer-events-none ${
                        isDarkMode ? 'border-slate-800/40' : 'border-slate-200'
                      }`}
                    ></div>
                    <div
                      className={`absolute inset-x-3 top-28 border-b border-dashed pointer-events-none ${
                        isDarkMode ? 'border-slate-800/30' : 'border-slate-200/80'
                      }`}
                    ></div>

                    {rideStats.map((item, index) => (
                      <div
                        key={item.day}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative z-10"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Interactive Tooltip */}
                        {hoveredBar === index && (
                          <div className="absolute -top-10 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xl pointer-events-none z-20 whitespace-nowrap bg-slate-900 text-white border border-slate-700">
                            <span className="text-emerald-400">{item.display}</span> rides
                          </div>
                        )}

                        {/* Bar column with background container */}
                        <div
                          className={`w-full max-w-[68px] flex items-end h-full rounded-t-xl transition-colors ${
                            isDarkMode ? 'bg-slate-800/20' : 'bg-slate-100/70'
                          }`}
                        >
                          <div
                            style={{ height: item.height }}
                            className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm shadow-emerald-500/20"
                          />
                        </div>

                        {/* Day label */}
                        <span
                          className={`text-xs font-semibold mt-3 ${
                            hoveredBar === index
                              ? isDarkMode
                                ? 'text-emerald-400'
                                : 'text-emerald-600'
                              : isDarkMode
                              ? 'text-slate-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System status (4 cols) */}
                <div
                  className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20'
                      : 'bg-white border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2
                        className={`text-base font-bold tracking-tight ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        System status
                      </h2>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isDarkMode
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        99.98% Uptime
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {/* API */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          API
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            isDarkMode
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDarkMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                            }`}
                          ></span>
                          <span>Operational</span>
                        </span>
                      </div>

                      {/* Database */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          Database
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            isDarkMode
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDarkMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                            }`}
                          ></span>
                          <span>Operational</span>
                        </span>
                      </div>

                      {/* Payments */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          Payments
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            isDarkMode
                              ? 'bg-amber-950/70 text-amber-400 border-amber-800/60'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span>Slow</span>
                        </span>
                      </div>

                      {/* Notifications */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          Notifications
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            isDarkMode
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDarkMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                            }`}
                          ></span>
                          <span>Operational</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pending admin approvals */}
                  <div
                    className={`mt-6 pt-5 border-t flex items-center justify-between ${
                      isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Pending admin approvals
                    </span>
                    <button
                      onClick={() => setActiveTab('Admins')}
                      className={`px-2.5 py-1 rounded-lg text-sm font-bold border transition-colors ${
                        isDarkMode
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300'
                      }`}
                    >
                      {pendingAdmins}
                    </button>
                  </div>
                </div>
              </div>

              {/* -------------------- BOTTOM SECTION: RECENT ADMIN ACTIVITY -------------------- */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className={`text-base font-bold tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Recent admin activity
                  </h2>
                  <span
                    className={`text-xs ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Live operational events
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        className={`text-xs border-b ${
                          isDarkMode
                            ? 'text-slate-400 border-slate-800/80'
                            : 'text-slate-500 border-slate-200'
                        }`}
                      >
                        <th className="pb-3 font-semibold uppercase tracking-wider">Admin</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Action</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Time</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-right pr-2">Status</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y text-sm ${
                        isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'
                      }`}
                    >
                      {adminActivities.map((act) => (
                        <tr
                          key={act.id}
                          className={`transition-colors ${
                            isDarkMode
                              ? 'hover:bg-slate-800/30'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] border ${getAvatarBadgeClass(act.color)}`}
                              >
                                {act.avatar}
                              </div>
                              <span
                                className={`font-semibold ${
                                  isDarkMode ? 'text-slate-200' : 'text-slate-900'
                                }`}
                              >
                                {act.admin}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`font-medium ${
                                isDarkMode ? 'text-slate-300' : 'text-slate-800'
                              }`}
                            >
                              {act.action}
                            </span>
                            <span
                              className={`text-xs block ${
                                isDarkMode ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            >
                              {act.detail}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 text-xs font-mono ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {act.time}
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                                isDarkMode
                                  ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{act.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* -------------------- TAB: ADMINS (ENTERPRISE ADMIN MANAGEMENT) -------------------- */}
          {activeTab === 'Admins' && (
            <div className="space-y-6">
              {/* ----------------- TOP SUMMARY CARDS (4 CARDS) ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Admins */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total Admins
                    </span>
                    <Users
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {totalAdmins}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <span>All registered personnel</span>
                  </div>
                </div>

                {/* 2. Active Admins */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Active Admins
                    </span>
                    <ShieldCheck
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-emerald-500/60' : 'text-emerald-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {activeAdmins}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-bold'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Full operational access</span>
                  </div>
                </div>

                {/* 3. Pending Approvals */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Pending Approvals
                    </span>
                    <Clock
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-amber-500/60' : 'text-amber-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {pendingAdmins}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-amber-400' : 'text-amber-700 font-bold'
                    }`}
                  >
                    <span>Requires Super Admin review</span>
                  </div>
                </div>

                {/* 4. Suspended Admins */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Suspended Admins
                    </span>
                    <UserX
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-rose-500/60' : 'text-rose-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {suspendedAdmins}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <span>Access revoked</span>
                  </div>
                </div>
              </div>

              {/* ----------------- ADMIN TABLE & TOOLBAR CONTAINER ----------------- */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2
                      className={`text-xl font-bold tracking-tight ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Admin Management & Access Delegation
                    </h2>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Enterprise Super Admin console to authorize, configure permissions, and audit subordinate operators.
                    </p>
                  </div>

                  {/* Search and Filters Toolbar */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative min-w-[220px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, NIC..."
                        className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border outline-none transition-all ${
                          isDarkMode
                            ? 'bg-slate-900/80 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                        }`}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-3 py-2 text-xs rounded-xl border outline-none font-semibold transition-all cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'
                      }`}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Suspended">Suspended</option>
                    </select>

                    {/* Role Filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className={`px-3 py-2 text-xs rounded-xl border outline-none font-semibold transition-all cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'
                      }`}
                    >
                      <option value="All">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    {/* Reset Filters */}
                    {(searchTerm || statusFilter !== 'All' || roleFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('All');
                          setRoleFilter('All');
                        }}
                        className="px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        Reset
                      </button>
                    )}

                    {/* Create Admin Button */}
                    <button
                      onClick={() => {
                        setCreateAdminResult(null);
                        setShowCreateAdminModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Create Admin</span>
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        className={`text-xs border-b ${
                          isDarkMode
                            ? 'text-slate-400 border-slate-800/80 bg-slate-900/30'
                            : 'text-slate-500 border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Administrator</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Last Login</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y text-sm ${
                        isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'
                      }`}
                    >
                      {filteredAdmins.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center">
                            <div className="max-w-xs mx-auto space-y-2">
                              <Users className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                              <p
                                className={`text-sm font-semibold ${
                                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                No administrators found
                              </p>
                              <p className="text-xs text-slate-500">
                                No records match your current search terms or filter settings.
                              </p>
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setStatusFilter('All');
                                  setRoleFilter('All');
                                }}
                                className="mt-2 text-xs font-bold text-emerald-500 hover:underline"
                              >
                                Clear all filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAdmins.map((adm) => (
                          <tr
                            key={adm.id}
                            className={`transition-colors ${
                              isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Administrator */}
                            <td className="py-3.5 px-4 font-semibold">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                                    adm.status === 'Active'
                                      ? isDarkMode
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : adm.status === 'Suspended'
                                      ? isDarkMode
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isDarkMode
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {adm.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <span
                                    className={`font-semibold block ${
                                      isDarkMode ? 'text-slate-200' : 'text-slate-900'
                                    }`}
                                  >
                                    {adm.name}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-500 block">
                                    NIC: {adm.nic}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2 group">
                                <span
                                  className={`font-mono text-xs ${
                                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  {adm.email}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(adm.email)}
                                  title="Copy email to clipboard"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-emerald-500 text-slate-400"
                                >
                                  {copiedEmail === adm.email ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                                  adm.role === 'super_admin'
                                    ? isDarkMode
                                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                      : 'bg-purple-100 text-purple-800 border-purple-300'
                                    : isDarkMode
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                                  adm.status === 'Active'
                                    ? isDarkMode
                                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : adm.status === 'Suspended'
                                    ? isDarkMode
                                      ? 'bg-rose-950/70 text-rose-400 border-rose-800/60'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isDarkMode
                                    ? 'bg-amber-950/70 text-amber-400 border-amber-800/60'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                {adm.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                {adm.status === 'Suspended' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                                {adm.status === 'Pending Approval' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                                <span>{adm.status}</span>
                              </span>
                            </td>

                            {/* Last Login */}
                            <td
                              className={`py-3.5 px-4 text-xs font-mono ${
                                isDarkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {adm.lastLogin}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right pr-4">
                              {adm.status === 'Pending Approval' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setConfirmModal({ type: 'approve', admin: adm })}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => setConfirmModal({ type: 'reject', admin: adm })}
                                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs rounded-lg transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setManageModalAdmin(adm);
                                    setManageActiveTab('profile');
                                  }}
                                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ml-auto transition-all ${
                                    isDarkMode
                                      ? 'border-slate-800 text-slate-300 bg-slate-900/60 hover:text-white hover:border-slate-700 hover:bg-slate-800'
                                      : 'border-slate-200 text-slate-700 bg-white hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                                  }`}
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                  <span>Manage</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Stats */}
                <div
                  className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between text-xs ${
                    isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>
                    Showing {filteredAdmins.length} of {totalAdmins} administrative personnel
                  </span>
                  <span className="font-mono">Role: Super Admin • Root Delegation Control</span>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB: PROVISION NEW ADMINISTRATOR (ENTERPRISE PROTOCOL) -------------------- */}
          {activeTab === 'Provision Admin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Security Protocol ISO/IEC 27001
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">•</span>
                    <span className="text-[11px] font-mono text-slate-400">AES-256-GCM / HMAC-SHA256</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                    <span>Provision New Administrator</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generate cryptographically secure temporary credentials and dispatch a single-use 24-hour activation link strictly to the private email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreateAdminResult(null);
                    setCreateAdminForm({ name: '', officialEmail: '', personalEmail: '' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isDarkMode
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear Form</span>
                </button>
              </div>

              {/* 4 Protocol Architecture Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0d1420] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Temp Password</h4>
                  <p className="text-sm font-bold mt-1">CSPRNG ≥ 12 Chars</p>
                  <p className="text-[11px] text-slate-500 mt-1">Cryptographically generated random 14-char key with symbols & digits.</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0d1420] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Password Policy</h4>
                  <p className="text-sm font-bold mt-1">Forced 1st Reset</p>
                  <p className="text-[11px] text-slate-500 mt-1"><code>must_change_password = true</code> enforced before dashboard unlock.</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0d1420] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activation Token</h4>
                  <p className="text-sm font-bold mt-1">24h Single-Use Link</p>
                  <p className="text-[11px] text-slate-500 mt-1">SHA-256 token hash invalidated immediately upon consumption.</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0d1420] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <Send className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Channel</h4>
                  <p className="text-sm font-bold mt-1">Personal Email Only</p>
                  <p className="text-[11px] text-slate-500 mt-1">Zero leak to official mailbox; prevents unauthorized early interception.</p>
                </div>
              </div>

              {/* Main Provision Grid: Form (Left) & Preview / Result (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form */}
                <div
                  className={`lg:col-span-7 p-6 sm:p-7 rounded-3xl border transition-all ${
                    isDarkMode
                      ? 'bg-[#0d1420] border-slate-800 shadow-xl shadow-black/30'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 pb-5 border-b border-slate-800/60 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      <UserPlus className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight">Administrator Enrollment Parameters</h3>
                      <p className="text-xs text-slate-400">Complete required fields to initiate cryptographically verified onboarding</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateAdmin} className="space-y-5">
                    {/* 1. Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Administrator Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={createAdminForm.name}
                          onChange={(e) => setCreateAdminForm({ ...createAdminForm, name: e.target.value })}
                          placeholder="e.g. Kasun Jayasundara"
                          required
                          className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border outline-none font-medium transition-all ${
                            isDarkMode
                              ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${createAdminForm.name.trim().length >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span>Official name to appear on traffic audit logs and violation approval stamps.</span>
                      </p>
                    </div>

                    {/* 2. Official Email (Login Username) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Official Work Email (Login Username) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={createAdminForm.officialEmail}
                          onChange={(e) => setCreateAdminForm({ ...createAdminForm, officialEmail: e.target.value })}
                          placeholder="e.g. kasun.j@emobility.lk"
                          required
                          className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border outline-none font-medium transition-all ${
                            isDarkMode
                              ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createAdminForm.officialEmail.trim()) ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span>This official email will serve as the administrator's unique login username.</span>
                      </p>
                    </div>

                    {/* 3. Personal / Private Email (Credential Delivery Destination) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Personal / Private Email (Credential Delivery Destination) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Send className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="email"
                          value={createAdminForm.personalEmail}
                          onChange={(e) => setCreateAdminForm({ ...createAdminForm, personalEmail: e.target.value })}
                          placeholder="e.g. kasun.private@gmail.com"
                          required
                          className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border outline-none font-medium transition-all ${
                            isDarkMode
                              ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-emerald-400/90 mt-1.5 flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Initial temporary credentials and 24h setup link will be dispatched exclusively to this address.</span>
                      </p>
                    </div>

                    {/* Submission CTA */}
                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Status: Ready for generation
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingAdmin || !createAdminForm.name || !createAdminForm.officialEmail || !createAdminForm.personalEmail}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isCreatingAdmin ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Provisioning & Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 stroke-[2.5]" />
                            <span>Provision Administrator</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Live Protocol Status & Result Card */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Result Card when Provisioned */}
                  {createAdminResult ? (
                    <div
                      className={`p-6 rounded-3xl border space-y-5 animate-in zoom-in-95 duration-200 ${
                        isDarkMode
                          ? 'bg-[#0d1420] border-emerald-500/40 shadow-2xl shadow-emerald-500/10 text-slate-100'
                          : 'bg-white border-emerald-500/40 shadow-xl shadow-emerald-500/10 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                            Provisioning Successful
                          </span>
                          <h4 className="text-base font-black tracking-tight mt-0.5">
                            {createAdminResult.admin?.name}
                          </h4>
                        </div>
                      </div>

                      {/* Dispatch Status */}
                      {createAdminResult.emailSent === false ? (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                          <div>
                            <p className="font-bold">Email Dispatch Notice</p>
                            <p className="text-[11px] text-amber-200/80 mt-0.5">
                              {createAdminResult.emailError || 'SMTP server could not be reached.'} You can resend credentials below.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Credentials securely dispatched to <strong>{createAdminResult.admin?.personalEmail}</strong></span>
                        </div>
                      )}

                      {/* Credential Details with Copy Buttons */}
                      <div className={`p-4 rounded-2xl border space-y-3.5 text-xs ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Official Username (Login Email)
                          </span>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-400 font-bold">
                            <span className="truncate mr-2">{createAdminResult.admin?.officialEmail || createAdminResult.admin?.email}</span>
                            <button
                              onClick={() => copyToClipboard(createAdminResult.admin?.officialEmail || createAdminResult.admin?.email)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="Copy Username"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Generated Temporary Password (≥ 12 Chars)
                          </span>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold">
                            <span>{createAdminResult.tempPassword}</span>
                            <button
                              onClick={() => copyToClipboard(createAdminResult.tempPassword)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="Copy Password"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Single-Use 24h Setup URL
                          </span>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                            <span className="truncate mr-2">{createAdminResult.setPasswordUrl || createAdminResult.activationUrl}</span>
                            <button
                              onClick={() => copyToClipboard(createAdminResult.setPasswordUrl || createAdminResult.activationUrl)}
                              className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                              title="Copy Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleResendCredentials(createAdminResult.admin?.id, createAdminResult.admin?.personalEmail)}
                          disabled={isResending}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                          <span>Resend Credentials</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCreateAdminResult(null);
                            setCreateAdminForm({ name: '', officialEmail: '', personalEmail: '' });
                          }}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Provision Another
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Protocol Verification Checklist (Prior to submission) */
                    <div
                      className={`p-6 rounded-3xl border space-y-4 ${
                        isDarkMode ? 'bg-[#0d1420] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pre-Flight Verification Checklist</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${createAdminForm.name.trim().length >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <div>
                            <span className="font-bold">Full Name Provided</span>
                            <p className="text-[11px] text-slate-400">Minimum 2 characters for national identity linkage.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createAdminForm.officialEmail.trim()) ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <div>
                            <span className="font-bold">Official Login Email Format</span>
                            <p className="text-[11px] text-slate-400">Valid email structure used exclusively for login identity.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createAdminForm.personalEmail.trim()) ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <div>
                            <span className="font-bold">Personal Delivery Address Format</span>
                            <p className="text-[11px] text-slate-400">Secure recipient for credentials & password activation link.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-400 leading-relaxed">
                        🔒 <strong>Zero-Trust Guarantee:</strong> The generated password setup token is stored hashed and permanently revoked the moment a permanent password is set.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB: LOGIN PHOTO AUDIT (14-DAY RETENTION & VERIFICATION) -------------------- */}
          {activeTab === 'Login Photo Audit' && (
            <div className="space-y-6">
              {/* ----------------- TOP SUMMARY CARDS (4 CARDS) ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Audits */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total Login Audits
                    </span>
                    <Camera
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-slate-600 opacity-60' : 'text-slate-400 opacity-70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {auditLogs.length}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <span>All captured admin sessions</span>
                  </div>
                </div>

                {/* 2. Verified Snapshots */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Verified Daily Snapshots
                    </span>
                    <ShieldCheck
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-emerald-500/60' : 'text-emerald-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {auditLogs.filter((a) => a.verification_status === 'VERIFIED').length}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-bold'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1 snapshot per login session</span>
                  </div>
                </div>

                {/* 3. 14-Day Retention Policy */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      14-Day Retention Enforced
                    </span>
                    <Clock
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-cyan-500/60' : 'text-cyan-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                    }`}
                  >
                    14 Days
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-700 font-bold'
                    }`}
                  >
                    <span>Auto backend & storage purge</span>
                  </div>
                </div>

                {/* 4. Super Admin Audit Logging */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                    isDarkMode
                      ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Photo View Tracking
                    </span>
                    <Eye
                      className={`w-4 h-4 ${
                        isDarkMode ? 'text-purple-500/60' : 'text-purple-600/70'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-3xl font-black mt-2 tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Active
                  </div>
                  <div
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-700 font-bold'
                    }`}
                  >
                    <span>Records Super Admin photo views</span>
                  </div>
                </div>
              </div>

              {/* ----------------- AUDIT TABLE CONTAINER ----------------- */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2
                        className={`text-xl font-bold tracking-tight ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Admin Login Photo Audit
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                        14-Day Retention Enforced
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Audit records of subordinate administrator logins with explicit camera consent verification, private storage, and access tracking.
                    </p>
                  </div>

                  {/* Search and Filters Toolbar */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative min-w-[220px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        placeholder="Search Admin, Email, IP..."
                        className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border outline-none transition-all ${
                          isDarkMode
                            ? 'bg-slate-900/80 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={auditStatusFilter}
                      onChange={(e) => setAuditStatusFilter(e.target.value)}
                      className={`px-3 py-2 text-xs rounded-xl border outline-none font-semibold transition-all cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'
                      }`}
                    >
                      <option value="All">All Login Statuses</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                    </select>

                    {/* Refresh Button */}
                    <button
                      onClick={fetchLoginAudits}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isDarkMode
                          ? 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Refresh Audit Logs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudits ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        className={`text-xs border-b ${
                          isDarkMode
                            ? 'text-slate-400 border-slate-800/80 bg-slate-900/30'
                            : 'text-slate-500 border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Administrator</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date & Time</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">IP & Network</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Device / Browser</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Login Status</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider">Verification & Retention</th>
                        <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                      {isLoadingAudits ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                              <span>Loading encrypted login audit trail...</span>
                            </div>
                          </td>
                        </tr>
                      ) : auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Camera className="w-8 h-8 text-slate-600" />
                              <span>No login verification photo audits recorded yet.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((audit) => (
                          <tr
                            key={audit.id}
                            className={`transition-colors duration-150 ${
                              isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            {/* Administrator */}
                            <td className="py-3.5 px-4 font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                                  {audit.user_name ? audit.user_name.charAt(0) : 'A'}
                                </div>
                                <div>
                                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {audit.user_name || 'Administrator'}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {audit.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Date & Time */}
                            <td className="py-3.5 px-4">
                              <div className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>
                                {new Date(audit.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {new Date(audit.timestamp).toLocaleTimeString()}
                              </div>
                            </td>

                            {/* IP Address */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <span>{audit.ip_address || '127.0.0.1'}</span>
                              </div>
                            </td>

                            {/* Device Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 text-slate-300 max-w-[200px] truncate" title={audit.device_info}>
                                <Laptop className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{audit.device_info || 'Chrome (Windows)'}</span>
                              </div>
                            </td>

                            {/* Login Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  audit.login_status === 'SUCCESS'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {audit.login_status}
                              </span>
                            </td>

                            {/* Verification & Retention */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1">
                                {audit.photo_expired ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                                    <Trash2 className="w-2.5 h-2.5 text-rose-400" />
                                    Purged (14-Day Policy)
                                  </span>
                                ) : audit.photo_filename ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Verified • {audit.days_remaining}d remaining
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">
                                    {audit.verification_status || 'DIRECT'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              {audit.photo_filename && !audit.photo_expired ? (
                                <button
                                  onClick={() => openAuditPhotoModal(audit)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>View Photo & Audit</span>
                                </button>
                              ) : (
                                <span className="text-slate-500 text-xs italic">
                                  {audit.photo_expired ? 'Photo deleted' : 'No photo'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div
                  className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between text-xs ${
                    isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>Showing {auditLogs.length} audit sessions</span>
                  <span className="font-mono">Security Notice: Normal Admins cannot access login verification photos</span>
                </div>
              </div>
            </div>
          )}


          {/* -------------------- TAB: USERS -------------------- */}
          {activeTab === 'Users' && (
            <div
              className={`p-6 rounded-2xl border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Platform User Directory
              </h2>
              <p
                className={`text-xs mt-1 mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                12,480 registered EV owners, highway commuters, and transit operators.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Total Commuters
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    11,200
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Commercial Fleets
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    1,262
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    EV Station Operators
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    18
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB: ROLES & PERMISSIONS -------------------- */}
          {activeTab === 'Roles & permissions' && (
            <div
              className={`p-6 rounded-2xl border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Role-Based Access Control (RBAC) Matrix
              </h2>
              <p
                className={`text-xs mt-1 mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Platform permission configuration and server-side route guards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className={`p-5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-sm font-bold ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                      }`}
                    >
                      super_admin
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${
                        isDarkMode
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      ROOT
                    </span>
                  </div>
                  <ul
                    className={`text-xs space-y-2.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                      <span>Full access to /super-admin routes & APIs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                      <span>Subordinate admin creation & approvals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                      <span>System encryption key audit & DB logs</span>
                    </li>
                  </ul>
                </div>

                <div
                  className={`p-5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-sm font-bold ${
                        isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                      }`}
                    >
                      admin
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${
                        isDarkMode
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                      }`}
                    >
                      OPERATOR
                    </span>
                  </div>
                  <ul
                    className={`text-xs space-y-2.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                        }`}
                      />
                      <span>Real-time traffic monitoring & speed audit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                        }`}
                      />
                      <span>e-Challan penalty issue & PDF generation</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <span>✕ Restricted from Super Admin terminal (403)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB: REPORTS -------------------- */}
          {activeTab === 'Reports' && (
            <div
              className={`p-6 rounded-2xl border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Platform Reports & Analytics
              </h2>
              <p
                className={`text-xs mt-1 mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Cross-corridor performance, revenue telemetry, and compliance audits.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Highway e-Challan Reports</span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------- TAB: AUDIT LOGS -------------------- */}
          {activeTab === 'Audit logs' && (
            <div
              className={`p-6 rounded-2xl border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Security & Forensic Audit Trail
              </h2>
              <p
                className={`text-xs mt-1 mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Cryptographically protected audit log of all administrative actions and logins.
              </p>
              <div className="space-y-3 font-mono text-xs">
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>[2026-10-04 18:25:12] AUTH_SUCCESS user=emobilitysuperadmin@gmail.com role=super_admin ip=127.0.0.1</span>
                  <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>OK</span>
                </div>
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>[2026-10-04 18:20:00] STATION_APPROVE admin=Nimali P. station_id=STN-COL-04</span>
                  <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>DONE</span>
                </div>
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>[2026-10-04 17:35:44] PRICING_UPDATE admin=Kasun R. rule=OFFPEAK_EV_TARIFF_30</span>
                  <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>DONE</span>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB: SETTINGS -------------------- */}
          {activeTab === 'Settings' && (
            <div
              className={`p-6 rounded-2xl border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#0d1420]/90 border-slate-800/80 shadow-lg'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Platform Configuration
              </h2>
              <p
                className={`text-xs mt-1 mb-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Global settings for the E-Mobility Highway Authority platform.
              </p>

              <div className="space-y-4 max-w-lg">
                <div
                  className={`flex items-center justify-between py-3 border-b ${
                    isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Appearance Theme
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Toggle dark or light interface across panels
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
                      isDarkMode
                        ? 'border-slate-800 bg-slate-900 text-white hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 shadow-sm'
                    }`}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                  </button>
                </div>

                <div
                  className={`flex items-center justify-between py-3 border-b ${
                    isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      AES-256-GCM Encryption
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      PII field encryption with HMAC-SHA256 lookup
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                      isDarkMode
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Enforced
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* -------------------- MANAGE ADMIN MODAL -------------------- */}
      {manageModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              isDarkMode ? 'bg-[#0d1420] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b flex items-center justify-between ${
                isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                    manageModalAdmin.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {manageModalAdmin.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{manageModalAdmin.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{manageModalAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={() => setManageModalAdmin(null)}
                className={`p-2 rounded-lg hover:bg-slate-800/40 transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div
              className={`flex border-b px-6 text-xs font-semibold ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              {[
                { id: 'profile', label: 'View Profile', icon: User },
                { id: 'role', label: 'Role & Permissions', icon: Shield },
                { id: 'security', label: 'Security & Access', icon: Key },
                { id: 'audit', label: 'Audit Logs', icon: History }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = manageActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setManageActiveTab(tab.id)}
                    className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-all ${
                      isActive
                        ? 'border-emerald-500 text-emerald-500 font-bold'
                        : isDarkMode
                        ? 'border-transparent text-slate-400 hover:text-slate-200'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {manageActiveTab === 'profile' && (
                <div className="space-y-3.5 text-xs">
                  <div className={`p-4 rounded-xl border grid grid-cols-2 gap-4 ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">National Identity Card (NIC)</span>
                      <span className="font-mono font-bold">{manageModalAdmin.nic}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Department Unit</span>
                      <span className="font-bold">{manageModalAdmin.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Registered Since</span>
                      <span>{manageModalAdmin.joinedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Last Operational Session</span>
                      <span className="font-mono">{manageModalAdmin.lastLogin}</span>
                    </div>
                  </div>
                </div>
              )}

              {manageActiveTab === 'role' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    Select the role level assigned to this administrative account. Changes apply immediately upon server token validation.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRoleChange(manageModalAdmin.id, 'admin')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        manageModalAdmin.role === 'admin'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm">Standard Admin</span>
                        {manageModalAdmin.role === 'admin' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-[11px] text-slate-400">Traffic operations, e-Challan approvals & CCTV telemetry</p>
                    </button>

                    <button
                      onClick={() => handleRoleChange(manageModalAdmin.id, 'super_admin')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        manageModalAdmin.role === 'super_admin'
                          ? 'border-purple-500 bg-purple-500/10'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-purple-400">Super Admin</span>
                        {manageModalAdmin.role === 'super_admin' && <Check className="w-4 h-4 text-purple-500" />}
                      </div>
                      <p className="text-[11px] text-slate-400">Root credentials, admin delegation & cryptographic keys</p>
                    </button>
                  </div>
                </div>
              )}

              {manageActiveTab === 'security' && (
                <div className="space-y-4 text-xs">
                  {/* Resend Credentials */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="font-bold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resend Administrator Credentials</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Regenerates a fresh temporary password and 24-hour setup link, invalidating any previous tokens.
                      </p>
                    </div>
                    <button
                      onClick={() => handleResendCredentials(manageModalAdmin.id)}
                      disabled={isResending}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>{isResending ? 'Sending...' : 'Resend Credentials'}</span>
                    </button>
                  </div>

                  {/* Reset Password */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="font-bold">Reset Administrator Password</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Send a secure one-time password reset token to their verified email.</p>
                    </div>
                    <button
                      onClick={() => handlePasswordReset(manageModalAdmin)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Send Reset Link</span>
                    </button>
                  </div>

                  {/* Suspend / Reactivate */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="font-bold">
                        {manageModalAdmin.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                      </h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {manageModalAdmin.status === 'Suspended'
                          ? 'Restore operational credentials and enable login access immediately.'
                          : 'Immediately revoke active JWT tokens and prevent portal authentication.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSuspend(manageModalAdmin)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        manageModalAdmin.status === 'Suspended'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                      }`}
                    >
                      {manageModalAdmin.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </div>
                </div>
              )}

              {manageActiveTab === 'audit' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 mb-2">Immutable forensic trail of actions executed by this administrator:</p>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span>[2026-10-04 18:10] STATION_APPROVE ID: STN-COL-04</span>
                      <span className="text-emerald-500 font-bold">SUCCESS</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span>[2026-10-04 17:35] SPEED_CHALLAN_AUDIT Plate: WP-CAD-4591</span>
                      <span className="text-emerald-500 font-bold">APPROVED</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span>[2026-10-03 09:20] JWT_LOGIN IP: 192.168.1.104</span>
                      <span className="text-emerald-500 font-bold">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex justify-end gap-2 ${
                isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <button
                onClick={() => setManageModalAdmin(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- CONFIRMATION MODAL -------------------- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-[#0d1420] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmModal.type === 'approve'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {confirmModal.type === 'approve' ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {confirmModal.type === 'approve' ? 'Approve Administrator' : 'Reject Application'}
                </h3>
                <p className="text-xs text-slate-400">
                  {confirmModal.type === 'approve'
                    ? 'Grant active operational administrative credentials'
                    : 'Permanently reject this admin enrollment request'}
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <p>
                <strong className="text-slate-400 font-medium">Administrator:</strong>{' '}
                <span className="font-bold">{confirmModal.admin.name}</span>
              </p>
              <p>
                <strong className="text-slate-400 font-medium">Email:</strong>{' '}
                <span className="font-mono">{confirmModal.admin.email}</span>
              </p>
              <p>
                <strong className="text-slate-400 font-medium">NIC:</strong>{' '}
                <span className="font-mono">{confirmModal.admin.nic}</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {confirmModal.type === 'approve'
                ? 'By approving, this user will receive full permissions corresponding to their assigned role and will be able to access the TMC Operational dashboard.'
                : 'Are you sure you want to reject this request? The candidate will be notified of the decision.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Cancel
              </button>

              {confirmModal.type === 'approve' ? (
                <button
                  onClick={() => handleApprove(confirmModal.admin)}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Confirm Approval
                </button>
              ) : (
                <button
                  onClick={() => handleReject(confirmModal.admin)}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Confirm Rejection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SUPER ADMIN → CREATE ADMIN MODAL -------------------- */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#0d1420] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Provision New Administrator</h3>
                  <p className="text-xs text-slate-400">Generate credentials and dispatch one-time activation link</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 leading-relaxed ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Admin Creation Protocol</span>
                </div>
                <p>
                  &bull; Generates a cryptographically secure random temporary password (min 12 chars).<br />
                  &bull; Sets mandatory permanent password change policy (<code>must_change_password = true</code>).<br />
                  &bull; Generates a single-use 24-hour setup link sent strictly to the personal email.
                </p>
              </div>

              {/* Admin Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Administrator Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={createAdminForm.name}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, name: e.target.value })}
                    placeholder="e.g. Kasun Jayasundara"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Admin Official Email (Login Username) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Official Email (Login Username) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={createAdminForm.officialEmail}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, officialEmail: e.target.value })}
                    placeholder="e.g. kasun.j@emobility.lk"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">This official email will serve as the administrator's login username.</p>
              </div>

              {/* Admin Personal / Private Email (Credentials Delivery) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Personal / Private Email (Delivery Destination) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input
                    type="email"
                    value={createAdminForm.personalEmail}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, personalEmail: e.target.value })}
                    placeholder="e.g. kasun.private@gmail.com"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-emerald-500/80 mt-1">Credentials and setup link will be emailed strictly to this private address.</p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isCreatingAdmin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Admin & Send Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- SUPER ADMIN → CREATE ADMIN SUCCESS MODAL -------------------- */}
      {createAdminResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#0d1420] border-emerald-500/40 text-slate-100' : 'bg-white border-emerald-500/40 text-slate-900'
            }`}
          >
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-full">
                Administrator Created
              </span>
              <h3 className="text-xl font-black mt-2 text-white">Administrator Account Provisioned</h3>
              <p className="text-xs text-slate-400 mt-1">
                Account created for <strong>{createAdminResult.admin?.name}</strong>.
              </p>
            </div>

            {/* Email dispatch alert if failed */}
            {createAdminResult.emailSent === false && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <div className="flex-1">
                  <p className="font-bold">Email Dispatch Notice</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    {createAdminResult.emailError || 'SMTP server could not be reached.'} You can resend credentials below anytime.
                  </p>
                </div>
              </div>
            )}

            {/* Credential summary with copy buttons */}
            <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Official Email (Login Username)
                </span>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-emerald-400 font-bold">
                  {createAdminResult.admin?.officialEmail || createAdminResult.admin?.email}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Credentials Sent To (Personal Email)
                </span>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-slate-300">
                  {createAdminResult.admin?.personalEmail || 'Personal address'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Temporary Secure Password
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-cyan-400 font-bold">
                  <span>{createAdminResult.tempPassword}</span>
                  <button
                    onClick={() => copyToClipboard(createAdminResult.tempPassword)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Set New Password Link (Expires in 24 Hours, Single-Use)
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="truncate mr-2">{createAdminResult.setPasswordUrl || createAdminResult.activationUrl}</span>
                  <button
                    onClick={() => copyToClipboard(createAdminResult.setPasswordUrl || createAdminResult.activationUrl)}
                    className="p-1 text-slate-400 hover:text-white flex-shrink-0"
                    title="Copy Setup Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleResendCredentials(createAdminResult.admin?.id, createAdminResult.admin?.personalEmail)}
                disabled={isResending}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend Credentials</span>
              </button>

              <button
                onClick={() => {
                  setCreateAdminResult(null);
                  setShowCreateAdminModal(false);
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SUPER ADMIN → LOGIN PHOTO AUDIT MODAL -------------------- */}
      {selectedPhotoAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#0d1420] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Camera className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold tracking-tight">Login Verification Photo Audit</h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                      14-Day Retention Enforced
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Administrator: {selectedPhotoAudit.user_name} ({selectedPhotoAudit.user_email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhotoAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Photo Preview */}
              <div className="flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800 rounded-2xl p-5 min-h-[300px]">
                {isLoadingPhoto ? (
                  <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
                    <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
                    <span>Decrypting private audit photo stream...</span>
                  </div>
                ) : photoError ? (
                  <div className="text-center p-4 space-y-2">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                    <p className="text-xs text-rose-300 font-semibold">{photoError}</p>
                    <p className="text-[11px] text-slate-500">
                      Under the 14-day policy, expired verification photos are automatically purged from storage.
                    </p>
                  </div>
                ) : auditPhotoBlobUrl ? (
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl max-w-[280px]">
                      <img
                        src={auditPhotoBlobUrl}
                        alt="Daily Verification Snapshot"
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                        <span>VERIFIED CAPTURE</span>
                        <span>{new Date(selectedPhotoAudit.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Private Disk Storage • Unguessable SHA-256 Hash Ref
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No photo available.</p>
                )}
              </div>

              {/* Right Column: Metadata & Photo View Access Log */}
              <div className="space-y-4 text-xs">
                {/* Audit Record Summary */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Session Authentication Audit
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Admin ID:</span>
                      <span className="font-mono text-slate-200">{selectedPhotoAudit.user_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Login Status:</span>
                      <span className="font-bold text-emerald-400">{selectedPhotoAudit.login_status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date & Time:</span>
                      <span className="text-slate-200">{new Date(selectedPhotoAudit.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">IP Address:</span>
                      <span className="font-mono text-slate-200">{selectedPhotoAudit.ip_address}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Device / Browser:</span>
                      <span className="text-slate-200 font-mono text-[10px] truncate block" title={selectedPhotoAudit.device_info}>
                        {selectedPhotoAudit.device_info}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo View Access Log (Super Admin View Audit) */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      Super Admin Access Log
                    </h4>
                    <span className="text-[10px] text-purple-400 font-mono font-bold">
                      {auditPhotoViews.length} view(s) recorded
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By protocol, all Super Admin inspections of subordinate photo audits are recorded with timestamp and IP.
                  </p>

                  <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                    {auditPhotoViews.length === 0 ? (
                      <p className="text-slate-500 italic">This inspection was just recorded now.</p>
                    ) : (
                      auditPhotoViews.map((view, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                        >
                          <span className="text-slate-300">{view.super_admin_email || 'Super Admin'}</span>
                          <span className="text-slate-500">{new Date(view.viewed_at).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex justify-end ${
              isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50'
            }`}>
              <button
                onClick={() => setSelectedPhotoAudit(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

