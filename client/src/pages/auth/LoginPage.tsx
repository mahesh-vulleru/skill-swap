import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const destination = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'mentor' | 'learner' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoUser(role);
      if (role === 'admin') navigate('/admin');
      else navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    info('Demo password for all accounts is: password123', 'Password Hint');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-5 h-5 text-action" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-forest-900 font-['Plus_Jakarta_Sans']">
            Skill<span className="text-action">Swap</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-['Plus_Jakarta_Sans']">
          Welcome back to SkillSwap
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Sign in to access your active exchanges and scheduled sessions
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Buttons */}
          <div className="mb-6 p-3.5 rounded-xl bg-forest-50 border border-forest-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-action" />
              Quick 1-Click Demo Logins:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('mentor')}
                className="py-1.5 px-2 bg-white hover:bg-forest-100 border border-forest-200 rounded-lg text-xs font-bold text-forest-800 transition-colors shadow-xs active:scale-95"
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('learner')}
                className="py-1.5 px-2 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors shadow-xs active:scale-95"
              >
                Learner
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-1.5 px-2 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 transition-colors shadow-xs active:scale-95"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-forest-700 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to SkillSwap
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-action hover:underline">
              Register now for 30 free credits
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
