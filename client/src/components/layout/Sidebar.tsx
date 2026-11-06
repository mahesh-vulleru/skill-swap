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
  LogOut,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { Avatar } from '../common/Avatar';

export const Sidebar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    closeSidebar();
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-action text-white shadow-md shadow-action/20 font-bold'
        : 'text-emerald-100/80 hover:bg-forest-700/60 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-forest-800 text-white flex flex-col h-screen
          border-r border-forest-900/40 shadow-2xl lg:shadow-xl lg:static lg:w-64 lg:translate-x-0
          transition-transform duration-300 ease-in-out select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-forest-700/60 flex items-center justify-between">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-600 border border-forest-500/40 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5 text-action" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                Skill<span className="text-action">Swap</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300/80">
                Knowledge Network
              </p>
            </div>
          </NavLink>

          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-forest-700/80 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        {user && (
          <div className="px-5 py-3.5 border-b border-forest-700/40 bg-forest-900/40 flex items-center gap-3">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="md"
              isOnline={true}
              className="border-2 border-action rounded-full"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-forest-700 text-emerald-200 truncate">
                  {user.role === 'learner_mentor' ? 'Learner & Mentor' : user.role}
                </span>
                <span className="text-xs font-bold text-action flex items-center gap-0.5 whitespace-nowrap">
                  <Coins className="w-3 h-3" /> {user.credits}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Navigation Links (10 Core Modules) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Menu (Discovery & Matching) */}
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">
              Main Menu
            </p>
            <div className="space-y-1">
              <NavLink to="/dashboard" onClick={handleNavClick} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>User Dashboard</span>
              </NavLink>
              <NavLink to="/skills" onClick={handleNavClick} className={navItemClass}>
                <Search className="w-4 h-4" />
                <span>Explore Skills</span>
              </NavLink>
              <NavLink to="/matches" onClick={handleNavClick} className={navItemClass}>
                <Sparkles className="w-4 h-4 text-action" />
                <span>Find Matches</span>
              </NavLink>
              <NavLink to="/exchange-requests" onClick={handleNavClick} className={navItemClass}>
                <Repeat className="w-4 h-4" />
                <span>Exchange Requests</span>
              </NavLink>
            </div>
          </div>

          {/* Collaboration (Scheduling & Messaging) */}
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">
              Collaboration
            </p>
            <div className="space-y-1">
              <NavLink to="/schedule" onClick={handleNavClick} className={navItemClass}>
                <CalendarPlus className="w-4 h-4" />
                <span>Schedule Session</span>
              </NavLink>
              <NavLink to="/my-sessions" onClick={handleNavClick} className={navItemClass}>
                <CalendarCheck className="w-4 h-4" />
                <span>My Sessions</span>
              </NavLink>
              <NavLink to="/chat" onClick={handleNavClick} className={navItemClass}>
                <MessageSquare className="w-4 h-4" />
                <span>Real-Time Chat</span>
              </NavLink>
            </div>
          </div>

          {/* Reputation & Growth (Economy & Profile) */}
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-emerald-400/60 mb-2">
              Reputation & Economy
            </p>
            <div className="space-y-1">
              <NavLink to="/reviews" onClick={handleNavClick} className={navItemClass}>
                <Award className="w-4 h-4" />
                <span>Reviews & Badges</span>
              </NavLink>
              <NavLink to="/credits" onClick={handleNavClick} className={navItemClass}>
                <Coins className="w-4 h-4" />
                <span>Credits & Rewards</span>
              </NavLink>
              <NavLink to="/profile" onClick={handleNavClick} className={navItemClass}>
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </NavLink>
            </div>
          </div>

          {/* Switch to Admin Console (Only visible if authenticated user has admin role) */}
          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-forest-700/50">
              <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-2">
                Privileged Access
              </p>
              <button
                onClick={() => {
                  closeSidebar();
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700/80 hover:bg-purple-600 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-300" />
                  <span>Admin Console</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          )}
        </div>

        {/* Footer with Persona Switcher & Logout */}
        <div className="p-4 border-t border-forest-700/60 bg-forest-900/60 space-y-3">
          <div className="bg-forest-950/70 p-2.5 rounded-xl border border-forest-700/50">
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-action" /> Switch Demo Account:
            </p>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
              <button
                onClick={() => {
                  switchDemoUser('mentor');
                  closeSidebar();
                }}
                className="py-1 px-1.5 bg-forest-700 hover:bg-forest-600 rounded text-center text-white transition-colors"
              >
                Mentor
              </button>
              <button
                onClick={() => {
                  switchDemoUser('learner');
                  closeSidebar();
                }}
                className="py-1 px-1.5 bg-forest-700 hover:bg-forest-600 rounded text-center text-white transition-colors"
              >
                Learner
              </button>
              <button
                onClick={() => {
                  switchDemoUser('admin');
                  closeSidebar();
                }}
                className="py-1 px-1.5 bg-purple-700 hover:bg-purple-600 rounded text-center text-white transition-colors"
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
