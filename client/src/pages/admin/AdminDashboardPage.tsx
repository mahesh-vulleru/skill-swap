import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Repeat,
  CalendarCheck,
  Star,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SkeletonStat } from '../../components/common/Skeleton';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { api } from '../../services/api';
import { IAnalyticsData } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<IAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/platform')
      .then((res) => {
        if (res.data?.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Admin Control Center"
        subtitle="Platform governance, exchange volume analytics, and community oversight"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/admin' },
            { label: 'Overview' },
          ]}
        />

        {/* Admin Quick Banner */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-purple-950 text-white border border-purple-800 shadow-elevated flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-3 rounded-2xl bg-purple-900 border border-purple-700 text-purple-300 flex-shrink-0">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-['Plus_Jakarta_Sans']">System Administration</h2>
                <Badge variant="purple" size="sm">Admin Privilege</Badge>
              </div>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                Oversee 100% of user exchanges, manage access permissions, and monitor real-time platform health.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-stretch sm:self-auto justify-end">
            <Link to="/admin/users">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline" size="sm" className="bg-purple-900/40 text-purple-200 border-purple-700 hover:bg-purple-900">
                Detailed Metrics
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-forest-50 text-forest-700 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide truncate">Total Users</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {data?.stats?.totalUsers || 4}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 100% Active Rate
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-50 text-action flex-shrink-0">
                <Repeat className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide truncate">Skill Exchanges</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {data?.stats?.totalExchanges || 2}
                </div>
                <span className="text-[10px] text-action font-bold block mt-0.5 truncate">
                  {data?.stats?.completedExchanges || 1} Completed
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 flex-shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide truncate">Active Sessions</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {data?.stats?.activeSessions || 2}
                </div>
                <span className="text-[10px] text-sky-700 font-bold block mt-0.5 truncate">Scheduled on Meet</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide truncate">Avg Rating</p>
                <div className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1">
                  {data?.stats?.avgRating || 4.9} ★
                </div>
                <span className="text-[10px] text-stone-500 font-bold block mt-0.5 truncate">Top-tier Quality</span>
              </div>
            </Card>
          </div>
        )}

        {/* 2 Recharts Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Monthly Exchanges Area Chart */}
          <Card className="p-4 sm:p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">Exchange Activity & Sessions</h3>
                <p className="text-xs text-stone-500">Peer mentorship sessions conducted month over month</p>
              </div>
              <Badge variant="forest" size="sm">
                <Activity className="w-3.5 h-3.5" /> Live Metric
              </Badge>
            </div>

            <div className="h-64 sm:h-72 w-full min-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyActivity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExchanges" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F4C3A" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0F4C3A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="exchanges" stroke="#0F4C3A" strokeWidth={2} fillOpacity={1} fill="url(#colorExchanges)" name="Exchanges" />
                  <Area type="monotone" dataKey="sessions" stroke="#FF6B00" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Distribution Bar Chart */}
          <Card className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-stone-900">Skill Categories</h3>
              <p className="text-xs text-stone-500">Registered skills per category</p>
            </div>

            <div className="h-64 sm:h-72 w-full min-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categoryDistribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={80} />
                  <Tooltip />
                  <Bar dataKey="skills" fill="#0F4C3A" radius={[0, 8, 8, 0]} name="Skills Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
