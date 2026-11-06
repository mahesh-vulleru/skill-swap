import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle2, CalendarPlus } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SkeletonRow } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ISession } from '../../types';

export const MySessionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [sessions, setSessions] = useState<ISession[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);

  // Cancellation dialog state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<ISession | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      if (res.data?.success) {
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
      if (res.data?.success) {
        success(`Session status updated to ${newStatus}.`);
        fetchSessions();
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating session status');
    }
  };

  const confirmCancelSession = async () => {
    if (!sessionToCancel) return;
    try {
      await handleUpdateStatus(sessionToCancel._id, 'cancelled');
      setCancelModalOpen(false);
      setSessionToCancel(null);
    } catch {
      toastError('Failed to cancel session');
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

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'My Sessions' }]} />

        {/* Controls: Tabs & Book Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {(['upcoming', 'ongoing', 'completed', 'cancelled', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
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
            className="self-end sm:self-auto"
          >
            Schedule New Session
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : filteredSessions.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} sessions found`}
              description="Schedule a 1-on-1 session with a peer or accept an exchange request to start collaborating."
              action={{
                label: 'Book Session Now',
                onClick: () => navigate('/schedule'),
              }}
            />
          ) : (
            filteredSessions.map((session) => {
              const isMentor = session.mentor?._id === user?._id;
              const partner = isMentor ? session.learner : session.mentor;

              return (
                <Card key={session._id} className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                      <Avatar
                        src={partner?.avatar}
                        name={partner?.name || 'Partner'}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
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
                          <span className="text-xs font-bold text-stone-500 whitespace-nowrap">
                            {session.durationMinutes} mins • {session.mode}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">{session.topic}</h3>

                        <p className="text-xs text-stone-500 mt-1">
                          {isMentor ? 'You are mentoring:' : 'Mentor:'}{' '}
                          <strong className="text-stone-800">{partner?.name}</strong> • Scheduled for{' '}
                          <strong className="text-forest-700">{session.date} at {session.time}</strong>
                        </p>

                        {session.notes && (
                          <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 max-w-2xl break-words">
                            <strong>Notes:</strong> {session.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-end">
                      {session.status === 'upcoming' && (
                        <>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
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
                            onClick={() => {
                              setSessionToCancel(session);
                              setCancelModalOpen(true);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {session.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> +10 Credits Awarded
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/reviews?sessionId=${session._id}&revieweeId=${partner?._id}&skill=${encodeURIComponent(
                                  session.skill
                                )}`
                              )
                            }
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

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={cancelModalOpen}
        title="Cancel Session"
        message={`Are you sure you want to cancel the scheduled session on "${sessionToCancel?.topic}"? This cannot be undone.`}
        confirmText="Yes, Cancel Session"
        variant="danger"
        onConfirm={confirmCancelSession}
        onCancel={() => {
          setCancelModalOpen(false);
          setSessionToCancel(null);
        }}
      />
    </div>
  );
};
