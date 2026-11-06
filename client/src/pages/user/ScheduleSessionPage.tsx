import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Users, BookOpen, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IUser } from '../../types';

export const ScheduleSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [partners, setPartners] = useState<IUser[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(searchParams.get('partnerId') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('2026-11-12');
  const [time, setTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [mode, setMode] = useState<'Google Meet' | 'Zoom' | 'SkillSwap Live Video'>('Google Meet');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/users')
      .then((res) => {
        if (res.data.success) {
          const others = (res.data.users || []).filter((u: IUser) => u._id !== user?._id);
          setPartners(others);
          if (!selectedPartnerId && others.length > 0) {
            setSelectedPartnerId(others[0]._id);
            if (!skill && others[0].skillsOffered?.[0]) {
              setSkill(others[0].skillsOffered[0].name);
            }
          }
        }
      })
      .catch(console.error);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !skill || !topic) return;

    setSubmitting(true);
    try {
      const res = await api.post('/sessions', {
        partnerId: selectedPartnerId,
        skill,
        topic,
        date,
        time,
        durationMinutes,
        mode,
        notes,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-sessions');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Error scheduling session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Schedule a 1-on-1 Learning Session"
        subtitle="Coordinate date, time, and Google Meet integration with your peer exchange partner"
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <Card className="p-8">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Session Successfully Scheduled!</h3>
              <p className="text-xs text-stone-500">Google Meet link generated and notification dispatched to partner. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Partner Select */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-forest-600" /> Exchange Partner
                </label>
                <select
                  required
                  value={selectedPartnerId}
                  onChange={(e) => {
                    setSelectedPartnerId(e.target.value);
                    const selected = partners.find((p) => p._id === e.target.value);
                    if (selected?.skillsOffered?.[0]) setSkill(selected.skillsOffered[0].name);
                  }}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                >
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.location}) — Role: {p.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-forest-600" /> Skill Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React & TypeScript, Figma"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-forest-600" /> Specific Agenda / Session Goal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Code review on custom hooks"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>
              </div>

              {/* Date, Time, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-forest-600" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-forest-600" /> Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes (Deep Dive)</option>
                  </select>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-forest-600" /> Meeting Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Google Meet', 'Zoom', 'SkillSwap Live Video'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        mode === m
                          ? 'bg-forest-50 border-forest-600 text-forest-900 ring-2 ring-forest-500/20'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  Pre-session Notes & Resource Links (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share GitHub repos, Figma prototypes, or questions to review beforehand..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  ⚡ Completing a 60m mentorship session awards <strong className="text-action">10 Credits</strong>.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Confirm & Schedule Session
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

