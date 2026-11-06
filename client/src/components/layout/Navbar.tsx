import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, BookOpen, LogIn, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'mentor') {
      navigate('/mentor/dashboard');
    } else {
      navigate('/learner/dashboard');
    }
  };

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
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-600">
              Knowledge Exchange
            </p>
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

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Button variant="forest" size="sm" onClick={handleGoToDashboard}>
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
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 sm:px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-stone-700 py-2 hover:text-forest-700"
          >
            <BookOpen className="w-4 h-4 text-forest-600" />
            Explore Skills
          </Link>
          <Link
            to="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-stone-700 py-2 hover:text-forest-700"
          >
            <Sparkles className="w-4 h-4 text-action" />
            Find Mentors
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-stone-700 py-2 hover:text-forest-700"
          >
            How It Works
          </a>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {user ? (
              <Button
                variant="forest"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoToDashboard();
                }}
              >
                Go to My Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
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
