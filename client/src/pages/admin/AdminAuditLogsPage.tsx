import React from 'react';
import { FileText, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const AdminAuditLogsPage: React.FC = () => {
  const auditEntries = [
    { action: 'ROLE_AUTHORIZATION_VERIFIED', actor: 'system', target: 'Security Middleware', status: 'SUCCESS', time: 'Recently' },
    { action: 'USER_REGISTRATION', actor: 'Auth Controller', target: 'Elena Rostova', status: 'CREDITED_30', time: 'Recently' },
    { action: 'EXCHANGE_PROPOSAL_DISPATCH', actor: 'Exchange Service', target: 'React & TypeScript', status: 'PENDING', time: 'Recently' },
    { action: 'SESSION_COMPLETION_VERIFIED', actor: 'Session Controller', target: 'Google Meet Room', status: 'CREDITED_10', time: 'Recently' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <Header
        title="System Audit Logs"
        subtitle="Security event logs, administrative privilege operations, and immutable transaction audit trails"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/admin' },
            { label: 'Audit Logs' },
          ]}
        />

        {/* Status Banner */}
        <div className="p-6 rounded-2xl bg-purple-900/10 border border-purple-300 text-purple-950 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Module Status: Active Security Event Logging</h3>
              <Badge variant="purple" size="sm">Phase 4 Database Archival</Badge>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Administrative privilege operations and authentication events are logged to the backend console. Long-term persistent database journaling and automated SIEM ingestion are scheduled for Phase 4.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="p-6 bg-white">
          <div className="pb-4 border-b border-stone-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" /> Recent System Security Events
              </h3>
              <p className="text-xs text-stone-500">Live event stream of operations executed on the platform</p>
            </div>
            <Badge variant="forest" size="sm">
              <Activity className="w-3.5 h-3.5" /> Live Stream
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Origin / Actor</th>
                  <th className="pb-3">Target Object</th>
                  <th className="pb-3">Result Status</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-mono">
                {auditEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80">
                    <td className="py-3 font-semibold text-stone-900">{entry.action}</td>
                    <td className="py-3 text-stone-500">{entry.actor}</td>
                    <td className="py-3 text-purple-800 font-semibold">{entry.target}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-stone-400">{entry.time}</td>
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

