import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = ['admin'] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Unauthenticated user -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Authenticated user with unauthorized role -> 403 Forbidden UI
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">403 - Access Forbidden</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Your account ({user.email || user.nic}) is assigned role <span className="font-mono text-cyan-400 font-bold uppercase">{user.role}</span>. You do not have permissions to access this dashboard.
        </p>
        <button
          onClick={() => {
            window.location.href = user.role === 'super_admin' ? '/super-admin/dashboard' : '/dashboard';
          }}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;