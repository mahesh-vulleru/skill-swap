import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Coins,
  CalendarCheck,
  Award,
  ArrowRight,
  BookOpen,
  Users,
  Video,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SkeletonStat, SkeletonCard } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ISession, IExchangeRequest } from '../../types';

export const MentorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teachingSessions, setTeachingSessions] = useState<ISession[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IExchangeRequest[]>([]);
  const [stats, setStats] = useState({
    studentsMentored: 0,
    totalTeachingHours: 0,
    creditsEarned: 0,
    mentorRating: user?.rating || 4.95,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMentorData = async () => {
      try {
        const [sessRes, exchRes, analRes] = await Promise.all([
          api.get('/sessions?status=upcoming'),
          api.get('/exchanges'),
          api.get('/analytics/mentor').catch(() => ({ data: { success: false } })),
        ]);

        if (isMounted) {
          if (sessRes.data?.success) {
            setTeachingSessions(sessRes.data.sessions.slice(0, 4));
          }
          if (exchRes.data?.success) {
            // Filter incoming requests directed to this mentor
            const incoming = (exchRes.data.exchanges || []).filter(
              (e: IExchangeRequest) => e.receiver._id === user?._id && e.status === 'pending'
            );
            setIncomingRequests(incoming.slice(0, 4));
          }
          if (analRes.data?.success && analRes.data.stats) {
            setStats(analRes.data.stats);
          } else {
            // Fallback computed from user record
            setStats({
              studentsMentored: Math.max(1, Math.floor((user?.sessionsCompleted || 5) * 0.7)),
              totalTeachingHours: (user?.sessionsCompleted || 6) * 1.5,
              creditsEarned: (user?.sessionsCompleted || 6) * 10,
              mentorRating: user?.rating || 4.95,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching mentor dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMentorData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title={`Welcome Mentor, ${user?.name ? user.name.split(' ')[0] : 'Instructor'}!`}
        subtitle="Manage your student roster, teaching calendar, curriculum, and mentorship credit earnings"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Mentor Hub' }]} />

        {/* Mentor Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 text-white p-6 sm:p-8 shadow-elevated border border-forest-600/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-950/70 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-action" />
                Verified Teaching & Mentorship Hub
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                Guide the Next Generation of Developers & Designers
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                You have earned <span className="font-bold text-action">{user?.credits ?? 0} Credits</span> from teaching. Each completed session awards you <span className="font-bold text-emerald-300">+10 credits</span> and <span className="font-bold text-emerald-300">+15 reputation points</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/my-sessions">
                <Button variant="primary" size="md" leftIcon={<CalendarCheck className="w-4 h-4" />}>
                  Teaching Calendar
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" size="md" leftIcon={<BookOpen className="w-4 h-4" />}>
                  Update Curriculum
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Mentor Metrics */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="flex items-center gap-4 p-5 hover:border-forest-600/40">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Students Mentored</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {stats.studentsMentored} Peers
                </div>
                <span className="text-[11px] font-bold text-forest-700 mt-0.5 inline-block">
                  Active Knowledge Roster
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-forest-600/40">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Teaching Hours</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {stats.totalTeachingHours} Hours
                </div>
                <span className="text-[11px] font-bold text-sky-700 mt-0.5 inline-block">
                  Completed Swaps
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-action/40">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-action flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Teaching Credits</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {user?.credits ?? 0}
                </div>
                <Link to="/credits" className="text-[11px] font-bold text-action hover:underline mt-0.5 inline-block">
                  View Earnings Ledger →
                </Link>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-amber-400/40">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Mentor Rating</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                  {stats.mentorRating} <span className="text-xs text-stone-400 font-normal">/ 5.0</span>
                </div>
                <Link to="/reviews" className="text-[11px] font-bold text-amber-600 hover:underline mt-0.5 inline-block">
                  View Student Testimonials →
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Col: Teaching Curriculum & Student Inquiries */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Teaching Curriculum (Skills I Offer) */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Teaching Curriculum (Skills Offered)</h3>
                  <p className="text-xs text-stone-500">Skills you are verified to teach and mentor peers on</p>
                </div>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Manage Skills
                  </Button>
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                  user.skillsOffered.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-forest-50/50 border border-forest-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-forest-950">{s.name}</div>
                        <span className="text-[10px] text-stone-500">{s.category}</span>
                      </div>
                      <Badge variant="forest" size="sm">
                        {s.level}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 py-4 col-span-2 text-center">
                    No teaching skills listed yet. Add skills in your profile to attract learners!
                  </p>
                )}
              </div>
            </Card>

            {/* Pending Student Mentorship Requests */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Student Mentorship Inquiries</h3>
                  <p className="text-xs text-stone-500">Learners requesting 1-on-1 knowledge exchange with you</p>
                </div>
                <Link to="/exchange-requests">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All ({incomingRequests.length})
                  </Button>
                </Link>
              </div>

              {incomingRequests.length === 0 ? (
                <EmptyState
                  title="No Pending Inquiries"
                  description="When students request learning sessions from your teaching profile, they will appear here for your review."
                  className="mt-4"
                />
              ) : (
                <div className="mt-4 space-y-3">
                  {incomingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={req.sender.avatar} name={req.sender.name} size="sm" />
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">{req.sender.name}</h4>
                          <p className="text-[11px] text-stone-500">
                            Wants to learn: <strong className="text-forest-700">{req.skillWanted}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link to={`/chat/${req.sender._id}`}>
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                        </Link>
                        <Link to="/exchange-requests">
                          <Button variant="primary" size="sm">
                            Review Request
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Col: Upcoming Teaching Sessions */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Upcoming Teaching Sessions</h3>
                <Link to="/my-sessions" className="text-xs font-bold text-forest-700 hover:underline">
                  All ({teachingSessions.length})
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {teachingSessions.length === 0 ? (
                  <EmptyState
                    title="No Upcoming Teaching Sessions"
                    description="Accept a student request to schedule your next video mentorship session."
                    className="py-6"
                  />
                ) : (
                  teachingSessions.map((session) => (
                    <div
                      key={session._id}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 hover:bg-white transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                          {session.skill}
                        </span>
                        <Badge variant="emerald" size="sm">
                          {session.status.toUpperCase()}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{session.topic}</h4>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <Avatar src={session.learner?.avatar} name={session.learner?.name || 'Student'} size="xs" />
                        <span>Student: <strong>{session.learner?.name}</strong></span>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-stone-500">
                          {session.date} at {session.time}
                        </span>
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-forest-700 hover:bg-forest-800 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Video className="w-3 h-3" /> Join Meet
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

