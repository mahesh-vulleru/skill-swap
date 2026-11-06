import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Users, BookOpen, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IUser } from '../../types';

export const ScheduleSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

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
        if (res.data?.success) {
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

      if (res.data?.success) {
        setSuccess(true);
        toastSuccess('Session scheduled successfully!');
        setTimeout(() => {
          navigate('/my-sessions');
        }, 1200);
      }
    } catch (err: any) {
      toastError(err.message || 'Error scheduling session');
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

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Schedule Session' }]} />

        <Card className="p-5 sm:p-8">
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
                <Select
                  label="Exchange Partner"
                  required
                  value={selectedPartnerId}
                  onChange={(e) => {
                    setSelectedPartnerId(e.target.value);
                    const selected = partners.find((p) => p._id === e.target.value);
                    if (selected?.skillsOffered?.[0]) setSkill(selected.skillsOffered[0].name);
                  }}
                  options={partners.map((p) => ({
                    value: p._id,
                    label: `${p.name} (${p.location || 'Remote'}) — Role: ${p.role}`,
                  }))}
                />
              </div>

              {/* Skill & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Skill Topic"
                  type="text"
                  required
                  placeholder="e.g. React & TypeScript, Figma"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  leftIcon={<BookOpen className="w-4 h-4" />}
                />

                <Input
                  label="Specific Agenda / Session Goal"
                  type="text"
                  required
                  placeholder="e.g. Code review on custom hooks"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  leftIcon={<FileText className="w-4 h-4" />}
                />
              </div>

              {/* Date, Time, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                />

                <Input
                  label="Time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  leftIcon={<Clock className="w-4 h-4" />}
                />

                <Select
                  label="Duration"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  options={[
                    { value: 30, label: '30 Minutes' },
                    { value: 60, label: '60 Minutes (Standard)' },
                    { value: 90, label: '90 Minutes (Deep Dive)' },
                  ]}
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-forest-600" /> Meeting Mode
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
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
              <Textarea
                label="Pre-session Notes & Resource Links (Optional)"
                rows={3}
                placeholder="Share GitHub repos, Figma prototypes, or questions to review beforehand..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-stone-500 text-center sm:text-left">
                  ⚡ Completing a 60m mentorship session awards <strong className="text-action">10 Credits</strong>.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
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
