import React from 'react';
import { Flag, ShieldAlert, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';

export const AdminModerationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <Header
        title="Community Reports & Moderation"
        subtitle="Review community abuse flags, chat complaints, and dispute resolution"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/admin' },
            { label: 'Reports & Moderation' },
          ]}
        />

        {/* Operational Status Banner */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">Module Status: Pending Backend Integration (Phase 4)</h3>
                <Badge variant="amber" size="sm">Phase 4 Milestone</Badge>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                Automated user flagging, dispute resolution workflows, and content filtering models are scheduled for deployment in Phase 4. Currently, all active user accounts and sessions are regulated directly through the User Management console.
              </p>
            </div>
          </div>

          <Button
            variant="forest"
            size="sm"
            onClick={() => navigate('/admin/users')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="flex-shrink-0"
          >
            Go to User Management
          </Button>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3 bg-white">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Flag className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Active Queue: 0 Pending</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              No outstanding user abuse reports or severe platform policy violations detected.
            </p>
          </Card>

          <Card className="p-5 space-y-3 bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Direct Actions Available</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Admins can immediately suspend suspicious accounts via <strong className="text-purple-700">User Management</strong>.
            </p>
          </Card>

          <Card className="p-5 space-y-3 bg-white">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Dispute Escalation</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Session cancellations and credit disputes will be automatically ingested into this queue in Phase 4.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

