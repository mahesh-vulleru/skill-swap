import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, User, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('learner_mentor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
      });
      success('Account created! Welcome to SkillSwap with 30 bonus credits.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
          Create Your Knowledge Account
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Get 30 welcome credits instantly to start booking skill exchange sessions
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              helperText="Must be at least 6 characters long"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                How would you like to participate?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('learner')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'learner'
                      ? 'bg-forest-50 border-forest-600 text-forest-800 ring-2 ring-forest-500/20'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'mentor'
                      ? 'bg-forest-50 border-forest-600 text-forest-800 ring-2 ring-forest-500/20'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Mentor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('learner_mentor')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'learner_mentor'
                      ? 'bg-action text-white border-action shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Both (Swap)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account & Claim 30 Credits
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-forest-700 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
