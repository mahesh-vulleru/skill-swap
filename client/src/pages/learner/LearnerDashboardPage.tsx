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
  Search,
  CheckCircle2,
  Clock,
  Compass,
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

export const LearnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [learningSessions, setLearningSessions] = useState<ISession[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<IMatchResult[]>([]);
  const [stats, setStats] = useState({
    activeMentors: 0,
    totalLearningHours: 0,
    creditsAvailable: user?.credits || 0,
    skillsInProgress: user?.skillsWanted?.length || 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLearnerData = async () => {
      try {
        const [sessRes, matchRes, analRes] = await Promise.all([
          api.get('/sessions?status=upcoming'),
          api.get('/matches'),
          api.get('/analytics/learner').catch(() => ({ data: { success: false } })),
        ]);

        if (isMounted) {
          if (sessRes.data?.success) {
            setLearningSessions(sessRes.data.sessions.slice(0, 4));
          }
          if (matchRes.data?.success) {
            setRecommendedMentors(matchRes.data.matches.slice(0, 4));
          }
          if (analRes.data?.success && analRes.data.stats) {
            setStats(analRes.data.stats);
          } else {
            setStats({
              activeMentors: Math.max(1, Math.floor((user?.sessionsCompleted || 4) * 0.8)),
              totalLearningHours: (user?.sessionsCompleted || 4) * 1.5,
              creditsAvailable: user?.credits || 30,
              skillsInProgress: user?.skillsWanted?.length || 2,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching learner dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLearnerData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title={`Welcome Learner, ${user?.name ? user.name.split(' ')[0] : 'Student'}!`}
        subtitle="Discover expert peer mentors, manage upcoming study sessions, and track learning progress"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Learner Hub' }]} />

        {/* Learner Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-forest-800 via-forest-700 to-emerald-700 text-white p-6 sm:p-8 shadow-elevated border border-forest-600/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-950/70 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <Compass className="w-3.5 h-3.5 text-action" />
                Personalized Learning & Mentorship Discovery
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                Level Up Your Craft with Expert Peer Mentors
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                You have <span className="font-bold text-action">{user?.credits ?? 0} Learning Credits</span> available. Browse top-rated mentors to schedule a 1-on-1 hands-on session today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/skills">
                <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
                  Explore Skills Catalog
                </Button>
              </Link>
              <Link to="/matches">
                <Button variant="secondary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Find Mentors
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Learner Metrics */}
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
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Active Mentors</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {stats.activeMentors} Instructors
                </div>
                <span className="text-[11px] font-bold text-forest-700 mt-0.5 inline-block">
                  Verified Learning Network
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-sky-500/40">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Learning Hours</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {stats.totalLearningHours} Hours
                </div>
                <span className="text-[11px] font-bold text-sky-700 mt-0.5 inline-block">
                  Skill Progression
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-action/40">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-action flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Available Credits</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {user?.credits ?? 0}
                </div>
                <Link to="/credits" className="text-[11px] font-bold text-action hover:underline mt-0.5 inline-block">
                  View Credit Balance →
                </Link>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:border-emerald-500/40">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">Target Skills</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {user?.skillsWanted?.length || 0} Topics
                </div>
                <Link to="/profile" className="text-[11px] font-bold text-emerald-700 hover:underline mt-0.5 inline-block">
                  Manage Learning Goals →
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Col: Target Skills & Recommended Mentors */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Target Skills to Learn */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">My Target Learning Goals</h3>
                  <p className="text-xs text-stone-500">Skills you want to master through peer mentorship</p>
                </div>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Edit Goals
                  </Button>
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.skillsWanted && user.skillsWanted.length > 0 ? (
                  user.skillsWanted.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900">{s.name}</div>
                        <span className="text-[10px] text-stone-500">{s.category}</span>
                      </div>
                      <Link to={`/matches?skill=${encodeURIComponent(s.name)}`}>
                        <Badge variant="orange" size="sm">
                          Find Mentors →
                        </Badge>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 py-4 col-span-2 text-center">
                    No learning goals listed yet. Add skills in your profile to discover matched mentors!
                  </p>
                )}
              </div>
            </Card>

            {/* Recommended Mentors */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Recommended Peer Mentors</h3>
                  <p className="text-xs text-stone-500">Experienced instructors with complementary skill matches</p>
                </div>
                <Link to="/matches">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All ({recommendedMentors.length})
                  </Button>
                </Link>
              </div>

              {recommendedMentors.length === 0 ? (
                <EmptyState
                  title="No Matching Mentors Found"
                  description="Add more skills you want to learn in your profile to find suitable mentors."
                  action={{
                    label: 'Update Learning Goals',
                    onClick: () => navigate('/profile'),
                  }}
                  className="mt-4"
                />
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedMentors.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-white hover:border-forest-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={match.user.avatar} name={match.user.name} size="sm" />
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
                            <strong className="text-forest-700">Teaches:</strong> {match.matchedOfferSkill}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {match.user.rating || 4.9}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Link to={`/chat/${match.user._id}`}>
                            <Button variant="outline" size="sm">
                              Chat
                            </Button>
                          </Link>
                          <Link to={`/schedule?partnerId=${match.user._id}&skill=${encodeURIComponent(match.matchedOfferSkill)}`}>
                            <Button variant="primary" size="sm">
                              Book
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Col: Upcoming Study Sessions */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Upcoming Study Sessions</h3>
                <Link to="/my-sessions" className="text-xs font-bold text-forest-700 hover:underline">
                  All ({learningSessions.length})
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {learningSessions.length === 0 ? (
                  <EmptyState
                    title="No Scheduled Sessions"
                    description="Book a 1-on-1 mentorship session with a peer to begin your learning sprint."
                    action={{
                      label: 'Book Session',
                      onClick: () => navigate('/schedule'),
                    }}
                    className="py-6"
                  />
                ) : (
                  learningSessions.map((session) => (
                    <div
                      key={session._id}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 hover:bg-white transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-action bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {session.skill}
                        </span>
                        <Badge variant="emerald" size="sm">
                          {session.status.toUpperCase()}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{session.topic}</h4>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <Avatar src={session.mentor?.avatar} name={session.mentor?.name || 'Mentor'} size="xs" />
                        <span>Mentor: <strong>{session.mentor?.name}</strong></span>
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
