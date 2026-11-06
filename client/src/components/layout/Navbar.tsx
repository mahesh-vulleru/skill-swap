import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, BookOpen, Users, LogIn, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:bg-forest-700 transition-colors">
            <ArrowLeftRight className="w-6 h-6 text-action" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-forest-900 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
              Skill<span className="text-action">Swap</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-600">Knowledge Exchange</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <Link to="/skills" className="hover:text-forest-700 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-forest-600" />
            Explore Skills
          </Link>
          <a href="#how-it-works" className="hover:text-forest-700 transition-colors">
            How It Works
          </a>
          <Link to="/matches" className="hover:text-forest-700 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-action" />
            Find Mentors
          </Link>
          <a href="#community" className="hover:text-forest-700 transition-colors">
            Community
          </a>
        </nav>

        {/* Auth CTA & Demo Switcher */}
        <div className="hidden md:flex items-center gap-4">
          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 font-medium px-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" /> Demo:
            </span>
            <button
              onClick={() => { switchDemoUser('mentor'); navigate('/dashboard'); }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-forest-50 text-forest-800 font-semibold shadow-xs"
              title="Log in as Elena (Top Mentor)"
            >
              Mentor
            </button>
            <button
              onClick={() => { switchDemoUser('learner'); navigate('/dashboard'); }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-800 font-semibold shadow-xs"
              title="Log in as Marcus (Learner/Mentor)"
            >
              Learner
            </button>
            <button
              onClick={() => { switchDemoUser('admin'); navigate('/admin'); }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-purple-800 font-semibold shadow-xs"
              title="Log in as Admin"
            >
              Admin
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Button variant="forest" size="sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 space-y-3">
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-stone-700 py-2"
          >
            Explore Skills
          </Link>
          <Link
            to="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-stone-700 py-2"
          >
            Find Partners
          </Link>
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {user ? (
              <Button variant="forest" size="md" onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}>
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  Sign In
                </Button>
                <Button variant="primary" size="md" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

