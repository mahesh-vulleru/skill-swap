import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Coins,
  CalendarCheck,
  Award,
  ArrowRight,
  BookOpen,
  Video,
  Plus,
  Star,
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
import { ISession, IMatchResult } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcomingSessions, setUpcomingSessions] = useState<ISession[]>([]);
  const [matches, setMatches] = useState<IMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [sessRes, matchRes] = await Promise.all([
          api.get('/sessions?status=upcoming'),
          api.get('/matches'),
        ]);

        if (isMounted) {
          if (sessRes.data?.success) {
            setUpcomingSessions(sessRes.data.sessions.slice(0, 3));
          }
          if (matchRes.data?.success) {
            setMatches(matchRes.data.matches.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Knowledge Swapper'}!`}
        subtitle="Manage your peer learning exchanges, credits, and upcoming sessions"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Welcome Banner Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-forest-800 to-forest-600 text-white p-6 sm:p-8 shadow-elevated border border-forest-700/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/60 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-action" />
                Active Knowledge Exchange Hub
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                Ready to trade skills today?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                You have <span className="font-bold text-action">{user?.credits ?? 0} Learning Credits</span>. Schedule a 1-on-1 session to level up your craft or teach a peer to earn more credits.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/matches">
                <Button variant="primary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Find Match
                </Button>
              </Link>
              <Link to="/schedule">
                <Button variant="secondary" size="md" leftIcon={<CalendarCheck className="w-4 h-4" />}>
                  Book Session
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="flex items-center gap-4 p-5 hover:border-action/40">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-action flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Credit Balance</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {user?.credits ?? 0}
                </div>
                <Link to="/credits" className="text-[11px] font-bold text-action hover:underline mt-0.5 inline-block">
                  View Ledger & Perks →
                </Link>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-forest-600/40">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 flex-shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Upcoming Sessions</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {upcomingSessions.length}
                </div>
                <Link to="/my-sessions" className="text-[11px] font-bold text-forest-700 hover:underline mt-0.5 inline-block">
                  View Schedule →
                </Link>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-forest-600/40">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Skills Offered / Wanted</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {user?.skillsOffered?.length || 0} / {user?.skillsWanted?.length || 0}
                </div>
                <Link to="/profile" className="text-[11px] font-bold text-sky-700 hover:underline mt-0.5 inline-block">
                  Manage Skills →
                </Link>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-purple-600/40">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Reputation Score</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  {user?.reputationScore ?? 100}
                  <span className="text-xs font-bold text-amber-500 flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {user?.rating ?? 5.0}
                  </span>
                </div>
                <Link to="/reviews" className="text-[11px] font-bold text-purple-700 hover:underline mt-0.5 inline-block">
                  Reviews & Badges →
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* 2-Column Section: Skills Portfolio & Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left 2 Cols: Skills I Offer & Skills I Want */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">My Skill Portfolio</h3>
                  <p className="text-xs text-stone-500">Skills you teach to earn credits vs skills you want to learn</p>
                </div>
                <Link to="/profile">
                  <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Skill
                  </Button>
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills I Offer */}
                <div className="bg-forest-50/50 p-4 rounded-2xl border border-forest-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-forest-600"></span>
                    <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wide">Skills I Offer (Teach)</h4>
                  </div>
                  <div className="space-y-2">
                    {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                      user.skillsOffered.map((s, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200/70 shadow-xs flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-stone-900">{s.name}</div>
                            <span className="text-[10px] text-stone-500">{s.category}</span>
                          </div>
                          <Badge variant="forest" size="sm">{s.level}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 py-2">No offered skills listed yet.</p>
                    )}
                  </div>
                </div>

                {/* Skills I Want */}
                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-action"></span>
                    <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wide">Skills I Want (Learn)</h4>
                  </div>
                  <div className="space-y-2">
                    {user?.skillsWanted && user.skillsWanted.length > 0 ? (
                      user.skillsWanted.map((s, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200/70 shadow-xs flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-stone-900">{s.name}</div>
                            <span className="text-[10px] text-stone-500">{s.category}</span>
                          </div>
                          <Badge variant="orange" size="sm">{s.level}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 py-2">No wanted skills listed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommended Matching Partners Widget */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Recommended Swap Partners</h3>
                  <p className="text-xs text-stone-500">Peers with complementary skills ready for an exchange</p>
                </div>
                <Link to="/matches">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : matches.length === 0 ? (
                <EmptyState
                  title="No Matches Found Yet"
                  description="Add more skills you offer and want to your profile to let our matching algorithm find suitable exchange peers."
                  action={{
                    label: 'Update Profile Skills',
                    onClick: () => navigate('/profile'),
                  }}
                  className="mt-4"
                />
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.map((match, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-white hover:border-forest-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={match.user.avatar}
                              name={match.user.name}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate">{match.user.name}</h4>
                              <p className="text-[10px] text-stone-500 truncate">{match.user.location || 'Remote'}</p>
                            </div>
                          </div>
                          <Badge variant="forest" size="sm">
                            {match.matchPercentage}% Match
                          </Badge>
                        </div>

                        <div className="text-[11px] text-stone-600 space-y-1 mb-4">
                          <div className="truncate">
                            <strong className="text-forest-700">Offers:</strong> {match.matchedOfferSkill}
                          </div>
                          <div className="truncate">
                            <strong className="text-action">Wants:</strong> {match.matchedWantedSkill}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {match.user.rating || 4.9}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate('/matches')}
                        >
                          Request Swap
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Col: Upcoming Sessions & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Upcoming Sessions</h3>
                <Link to="/my-sessions" className="text-xs font-bold text-forest-700 hover:underline">
                  All ({upcomingSessions.length})
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-20 bg-stone-100 rounded-xl animate-pulse" />
                    <div className="h-20 bg-stone-100 rounded-xl animate-pulse" />
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl">
                    No upcoming sessions. Schedule one with a peer!
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session._id} className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <Badge variant="forest" size="sm">{session.skill}</Badge>
                        <span className="text-[11px] font-bold text-stone-600">{session.date} at {session.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 mb-1">{session.topic}</h4>
                      <p className="text-[11px] text-stone-500 mb-3 truncate">
                        Partner: {session.mentor?._id === user?._id ? session.learner?.name : session.mentor?.name}
                      </p>
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" /> Join {session.mode}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Action Banner */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-elevated">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-action" /> Need More Credits?
              </h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Teach a 1-hour session to earn 10 credits, or review a recent swap partner to earn bonus credits.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate('/schedule')}
              >
                Schedule Mentorship
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
