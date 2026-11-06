import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  BarChart3,
  Flag,
  Settings,
  FileText,
  ArrowLeft,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { Avatar } from '../common/Avatar';

export const AdminSidebar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 font-bold'
        : 'text-purple-200/80 hover:bg-purple-900/40 hover:text-white'
    }`;

  const pendingItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-purple-600/70 text-white font-bold'
        : 'text-purple-300/60 hover:bg-purple-900/30 hover:text-purple-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar Shell */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-purple-950 text-white flex flex-col h-screen
          border-r border-purple-900/60 shadow-2xl lg:shadow-xl lg:static lg:w-64 lg:translate-x-0
          transition-transform duration-300 ease-in-out select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand & Console Header */}
        <div className="p-5 sm:p-6 border-b border-purple-900/60 flex items-center justify-between bg-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800 border border-purple-700 flex items-center justify-center text-purple-200 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                SkillSwap <span className="text-[11px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-700 text-purple-100">Admin</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-300/80">
                Governance Console
              </p>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Return to Standard User Portal Button */}
        <div className="p-3 border-b border-purple-900/50 bg-purple-950">
          <button
            onClick={() => {
              closeSidebar();
              navigate('/dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-200 bg-forest-800/80 hover:bg-forest-700 border border-forest-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User View</span>
          </button>
        </div>

        {/* Admin Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Core Governance */}
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-purple-400/80 mb-2">
              Platform Governance
            </p>
            <div className="space-y-1">
              <NavLink to="/admin" end onClick={closeSidebar} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Admin Overview</span>
              </NavLink>
              <NavLink to="/admin/users" onClick={closeSidebar} className={navItemClass}>
                <Users className="w-4 h-4 text-purple-400" />
                <span>User Management</span>
              </NavLink>
              <NavLink to="/admin/analytics" onClick={closeSidebar} className={navItemClass}>
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Platform Analytics</span>
              </NavLink>
            </div>
          </div>

          {/* Extended Operations */}
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-purple-400/80 mb-2">
              System Operations
            </p>
            <div className="space-y-1">
              <NavLink to="/admin/moderation" onClick={closeSidebar} className={pendingItemClass}>
                <div className="flex items-center gap-3">
                  <Flag className="w-4 h-4 text-purple-400" />
                  <span>Reports & Moderation</span>
                </div>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">Queue</span>
              </NavLink>
              <NavLink to="/admin/settings" onClick={closeSidebar} className={pendingItemClass}>
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Platform Settings</span>
                </div>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">Config</span>
              </NavLink>
              <NavLink to="/admin/audit-logs" onClick={closeSidebar} className={pendingItemClass}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Audit Logs</span>
                </div>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">Logs</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Footer with Demo Switcher & Sign Out */}
        <div className="p-4 border-t border-purple-900/60 bg-purple-950/80 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <Avatar src={user?.avatar} name={user?.name || 'Admin'} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-purple-300 capitalize">{user?.role} Role</p>
            </div>
          </div>

          <div className="bg-purple-900/40 p-2.5 rounded-xl border border-purple-800/50">
            <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-action" /> Switch Demo Account:
            </p>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
              <button
                onClick={() => { switchDemoUser('mentor'); closeSidebar(); navigate('/dashboard'); }}
                className="py-1 px-1.5 bg-forest-800 hover:bg-forest-700 rounded text-center text-white"
              >
                Mentor
              </button>
              <button
                onClick={() => { switchDemoUser('learner'); closeSidebar(); navigate('/dashboard'); }}
                className="py-1 px-1.5 bg-forest-800 hover:bg-forest-700 rounded text-center text-white"
              >
                Learner
              </button>
              <button
                onClick={() => { switchDemoUser('admin'); closeSidebar(); }}
                className="py-1 px-1.5 bg-purple-700 hover:bg-purple-600 rounded text-center text-white"
              >
                Admin
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

