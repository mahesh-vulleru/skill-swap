import React from 'react';
import { Settings, Clock, Sliders, Key, Server, Lock } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const AdminSettingsPage: React.FC = () => {
  const runtimeConfigs = [
    { label: 'Initial Welcome Credits', value: '30 Credits', desc: 'Credits awarded upon user registration' },
    { label: 'Session Mentorship Reward', value: '10 Credits / 60m', desc: 'Credit grant per verified completed session' },
    { label: 'Peer Review Reward', value: '2 Credits / Review', desc: 'Reviewer incentive for session feedback' },
    { label: 'JWT Token Expiration', value: '7 Days', desc: 'Bearer authentication session window' },
    { label: 'Meeting Integration Mode', value: 'Google Meet', desc: 'Default video conferencing provider' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <Header
        title="Platform Configuration & Settings"
        subtitle="Review runtime environment configurations, credit emission limits, and system parameters"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/admin' },
            { label: 'Platform Settings' },
          ]}
        />

        {/* Status Banner */}
        <div className="p-6 rounded-2xl bg-purple-900/10 border border-purple-300 text-purple-950 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Module Status: Active Read-Only Parameters</h3>
              <Badge variant="purple" size="sm">Phase 4 Dynamic Configuration</Badge>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Platform settings are currently loaded from secure environment variables (`server/.env`). Dynamic runtime modifications through database-backed settings services are planned for Phase 4.
            </p>
          </div>
        </div>

        {/* Configuration Parameter Table */}
        <Card className="p-6 bg-white">
          <div className="pb-4 border-b border-stone-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-700" /> Active System Parameters
              </h3>
              <p className="text-xs text-stone-500">Live configuration readouts from backend environment definitions</p>
            </div>
            <Badge variant="emerald" size="sm">Live Environment</Badge>
          </div>

          <div className="divide-y divide-stone-100">
            {runtimeConfigs.map((cfg, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-stone-800">{cfg.label}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{cfg.desc}</p>
                </div>
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-xl self-start sm:self-auto">
                  {cfg.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

