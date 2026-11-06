import React, { useState, useEffect } from 'react';
import { Bell, Search, Coins, Check, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { api } from '../../services/api';
import { INotification } from '../../types';
import { Avatar } from '../common/Avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch {
        // Silently catch if not logged in or endpoint unavail
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/skills?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl lg:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-stone-900 font-['Plus_Jakarta_Sans'] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-stone-500 font-medium truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search skills, users, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200/90 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 w-56 lg:w-64 transition-all"
            />
          </form>

          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl md:hidden transition-colors"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Credits Balance Pill */}
          <Link
            to="/credits"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/70 text-action hover:bg-orange-100/70 transition-colors shadow-xs"
            title="View Learning Credits & Rewards"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-action" />
            <span className="text-xs font-bold whitespace-nowrap">
              {user?.credits ?? 0} <span className="hidden xs:inline">Credits</span>
            </span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-action text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-elevated border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            setNotifOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`p-3.5 hover:bg-stone-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-orange-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-stone-900">{notif.title}</h5>
                            <span className="text-[10px] text-stone-400">Recent</span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Mini Avatar & Link to Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 group ml-1 focus:outline-none"
            title="Go to profile"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="sm"
              className="group-hover:ring-2 group-hover:ring-action transition-all"
            />
          </Link>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="mt-3 pt-3 border-t border-stone-100 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search skills, users, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </header>
  );
};
