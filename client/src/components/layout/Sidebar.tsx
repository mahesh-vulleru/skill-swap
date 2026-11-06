import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  Search,
  Sparkles,
  Repeat,
  CalendarPlus,
  CalendarCheck,
  MessageSquare,
  Award,
  Coins,
  User,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-action text-white shadow-md shadow-action/20 font-bold'
        : 'text-emerald-100/80 hover:bg-forest-700/60 hover:text-white'
    }`;

  const adminItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-purple-600 text-white shadow-sm font-bold'
        : 'text-purple-200/80 hover:bg-purple-900/40 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-forest-800 text-white flex flex-col h-screen sticky top-0 border-r border-forest-900/40 shadow-xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-forest-700/60 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-forest-600 border border-forest-500/40 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-5 h-5 text-action" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
              Skill<span className="text-action">Swap</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300/80">Knowledge Network</p>
          </div>
        </NavLink>
      </div>

      {/* User Quick Info */}
      {user && (
        <div className="px-5 py-4 border-b border-forest-700/40 bg-forest-900/40 flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-action"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-forest-700 text-emerald-200">
                {user.role === 'learner_mentor' ? 'Learner & Mentor' : user.role}
              </span>
              <span className="text-xs font-bold text-action flex items-center gap-0.5">
                <Coins className="w-3 h-3" /> {user.credits}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Core Learning Network */}
        <div>
          <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">Main Menu</p>
          <div className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>User Dashboard</span>
            </NavLink>
            <NavLink to="/skills" className={navItemClass}>
              <Search className="w-4 h-4" />
              <span>Explore Skills</span>
            </NavLink>
            <NavLink to="/matches" className={navItemClass}>
              <Sparkles className="w-4 h-4 text-action" />
              <span>Find Matches</span>
            </NavLink>
            <NavLink to="/exchange-requests" className={navItemClass}>
              <Repeat className="w-4 h-4" />
              <span>Exchange Requests</span>
            </NavLink>
          </div>
        </div>

        {/* Sessions & Chat */}
        <div>
          <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">Collaboration</p>
          <div className="space-y-1">
            <NavLink to="/schedule" className={navItemClass}>
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule Session</span>
            </NavLink>
            <NavLink to="/my-sessions" className={navItemClass}>
              <CalendarCheck className="w-4 h-4" />
              <span>My Sessions</span>
            </NavLink>
            <NavLink to="/chat" className={navItemClass}>
              <MessageSquare className="w-4 h-4" />
              <span>Real-Time Chat</span>
            </NavLink>
          </div>
        </div>

        {/* Growth & Economy */}
        <div>
          <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">Reputation</p>
          <div className="space-y-1">
            <NavLink to="/reviews" className={navItemClass}>
              <Award className="w-4 h-4" />
              <span>Reviews & Badges</span>
            </NavLink>
            <NavLink to="/credits" className={navItemClass}>
              <Coins className="w-4 h-4" />
              <span>Credits & Rewards</span>
            </NavLink>
            <NavLink to="/profile" className={navItemClass}>
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </NavLink>
          </div>
        </div>

        {/* Admin Navigation (Accessible for review & verification) */}
        <div className="pt-2 border-t border-forest-700/50">
          <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Administration
          </p>
          <div className="space-y-1">
            <NavLink to="/admin" end className={adminItemClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Overview</span>
            </NavLink>
            <NavLink to="/admin/users" className={adminItemClass}>
              <Users className="w-3.5 h-3.5" />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/admin/analytics" className={adminItemClass}>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Platform Analytics</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer with Demo Switcher & Logout */}
      <div className="p-4 border-t border-forest-700/60 bg-forest-900/60 space-y-3">
        {/* Switch Persona */}
        <div className="bg-forest-950/70 p-2.5 rounded-xl border border-forest-700/50">
          <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide mb-1.5">
            Switch Demo Account:
          </p>
          <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
            <button
              onClick={() => switchDemoUser('mentor')}
              className="py-1 px-1.5 bg-forest-700 hover:bg-forest-600 rounded text-center text-white transition-colors"
            >
              Mentor
            </button>
            <button
              onClick={() => switchDemoUser('learner')}
              className="py-1 px-1.5 bg-forest-700 hover:bg-forest-600 rounded text-center text-white transition-colors"
            >
              Learner
            </button>
            <button
              onClick={() => switchDemoUser('admin')}
              className="py-1 px-1.5 bg-purple-700 hover:bg-purple-600 rounded text-center text-white transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

