import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Video, Clock, CheckCircle2, XCircle, ExternalLink, CalendarPlus, AlertCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ISession } from '../../types';

export const MySessionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ISession[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      const res = await api.put(`/sessions/${sessionId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating session status');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="My Learning Sessions"
        subtitle="Manage upcoming 1-on-1 swaps, access Google Meet video rooms, and verify completed hours"
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Controls: Tabs & Book Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {(['upcoming', 'ongoing', 'completed', 'cancelled', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab} ({sessions.filter((s) => (tab === 'all' ? true : s.status === tab)).length})
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/schedule')}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            Schedule New Session
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarCheck className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-stone-800">No {activeTab} sessions found</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Schedule a 1-on-1 session with a peer or accept an exchange request to start collaborating.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/schedule')}
              >
                Book Session Now
              </Button>
            </Card>
          ) : (
            filteredSessions.map((session) => {
              const isMentor = session.mentor?._id === user?._id;
              const partner = isMentor ? session.learner : session.mentor;

              return (
                <Card key={session._id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={partner?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                        alt={partner?.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="forest" size="sm">
                            {session.skill}
                          </Badge>
                          <Badge
                            variant={
                              session.status === 'upcoming'
                                ? 'blue'
                                : session.status === 'completed'
                                ? 'emerald'
                                : session.status === 'ongoing'
                                ? 'orange'
                                : 'stone'
                            }
                            size="sm"
                          >
                            {session.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-bold text-stone-500">
                            {session.durationMinutes} mins • {session.mode}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-stone-900">{session.topic}</h3>

                        <p className="text-xs text-stone-500 mt-1">
                          {isMentor ? 'You are mentoring:' : 'Mentor:'}{' '}
                          <strong className="text-stone-800">{partner?.name}</strong> • Scheduled for{' '}
                          <strong className="text-forest-700">{session.date} at {session.time}</strong>
                        </p>

                        {session.notes && (
                          <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 max-w-2xl">
                            <strong>Notes:</strong> {session.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                      {session.status === 'upcoming' && (
                        <>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" /> Join {session.mode}
                          </a>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(session._id, 'completed')}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Mark Completed
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(session._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {session.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> +10 Credits Awarded
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/reviews')}
                          >
                            Leave Review
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

