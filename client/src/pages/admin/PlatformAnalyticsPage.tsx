import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Repeat,
  CalendarCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { IAnalyticsData } from '../../types';

export const PlatformAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<IAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/platform')
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#0F4C3A', '#FF6B00', '#2563EB', '#7C3AED', '#DC2626', '#059669'];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Platform Analytics & Performance"
        subtitle="Deep dive into knowledge swap retention, credit liquidity, and curriculum demand"
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5">
            <span className="text-xs font-bold text-stone-400 uppercase">Total Completed Sessions</span>
            <div className="text-2xl font-extrabold text-stone-900 mt-1 font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{data?.stats.completedSessions || 1}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24% MoM
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">Zero drop-off rate</p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-bold text-stone-400 uppercase">Avg Satisfaction Score</span>
            <div className="text-2xl font-extrabold text-amber-500 mt-1 font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{data?.stats.avgRating || 4.95} ★</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">Post-session peer reviews</p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-bold text-stone-400 uppercase">Total Skills Catalog</span>
            <div className="text-2xl font-extrabold text-stone-900 mt-1 font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>{data?.stats.totalSkills || 6}</span>
              <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full">
                6 Categories
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">Programming & Design leading</p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-bold text-stone-400 uppercase">Credit Circulation</span>
            <div className="text-2xl font-extrabold text-action mt-1 font-['Plus_Jakarta_Sans'] flex items-center justify-between">
              <span>1,240 CR</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                High Velocity
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">Egalitarian learning economy</p>
          </Card>
        </div>

        {/* Growth Trends Multi-Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900">Platform Growth & Monthly Active Exchanges</h3>
              <p className="text-xs text-stone-500">Comparison of newly registered users, exchange proposals and executed sessions</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-forest-700"></span> Exchanges</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-action"></span> Sessions</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600"></span> New Users</span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyActivity || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="exchanges" stroke="#0F4C3A" strokeWidth={2} fill="#0F4C3A" fillOpacity={0.15} name="Exchanges" />
                <Area type="monotone" dataKey="sessions" stroke="#FF6B00" strokeWidth={2} fill="#FF6B00" fillOpacity={0.15} name="Sessions" />
                <Area type="monotone" dataKey="newUsers" stroke="#7C3AED" strokeWidth={2} fill="#7C3AED" fillOpacity={0.15} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Demanded Skills Table */}
        <Card className="p-6">
          <div className="pb-4 border-b border-stone-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Highest In-Demand Skills</h3>
              <p className="text-xs text-stone-500">Skills with highest learner demand vs available mentor supply</p>
            </div>
            <Badge variant="orange" size="sm">High Demand</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="pb-3">Skill Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Active Learners</th>
                  <th className="pb-3">Verified Mentors</th>
                  <th className="pb-3">Satisfaction Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {(data?.topSkills || []).map((skill) => (
                  <tr key={skill._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 font-bold text-stone-900">{skill.title}</td>
                    <td className="py-3">
                      <Badge variant="forest" size="sm">{skill.category}</Badge>
                    </td>
                    <td className="py-3 font-bold text-action">{skill.learnerCount} Learners</td>
                    <td className="py-3 font-bold text-forest-700">{skill.mentorCount} Mentors</td>
                    <td className="py-3 font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {skill.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

