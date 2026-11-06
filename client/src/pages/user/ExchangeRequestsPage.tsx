import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Check, X, CalendarPlus, MessageSquare } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SkeletonRow } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IExchangeRequest } from '../../types';

export const ExchangeRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [exchanges, setExchanges] = useState<IExchangeRequest[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'received' | 'sent'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchExchanges = async () => {
    try {
      const res = await api.get('/exchanges');
      if (res.data?.success) {
        setExchanges(res.data.exchanges || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/exchanges/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        success(`Request ${newStatus} successfully.`);
        fetchExchanges();
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating request');
    }
  };

  const filteredExchanges = exchanges.filter((ex) => {
    if (filterTab === 'received' && ex.receiver._id !== user?._id) return false;
    if (filterTab === 'sent' && ex.sender._id !== user?._id) return false;
    if (statusFilter !== 'all' && ex.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Skill Exchange Requests"
        subtitle="Manage incoming and outgoing proposals to trade knowledge with community members"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Exchange Requests' }]} />

        {/* Controls: Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {(['all', 'received', 'sent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filterTab === tab
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab} Requests
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : filteredExchanges.length === 0 ? (
            <EmptyState
              title="No Exchange Requests Found"
              description="Explore the matching directory to connect with peers and propose knowledge exchanges!"
              action={{
                label: 'Find Swap Partners',
                onClick: () => navigate('/matches'),
              }}
            />
          ) : (
            filteredExchanges.map((exchange) => {
              const isReceiver = exchange.receiver._id === user?._id;
              const otherUser = isReceiver ? exchange.sender : exchange.receiver;

              return (
                <Card key={exchange._id} className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                      <Avatar
                        src={otherUser.avatar}
                        name={otherUser.name}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900 truncate">{otherUser.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            {isReceiver ? 'Sent to you' : 'Sent by you'}
                          </span>
                          <Badge
                            variant={
                              exchange.status === 'accepted'
                                ? 'emerald'
                                : exchange.status === 'pending'
                                ? 'amber'
                                : exchange.status === 'rejected'
                                ? 'rose'
                                : 'purple'
                            }
                            size="sm"
                          >
                            {exchange.status.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Trade terms */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 text-xs">
                          <span className="font-semibold text-stone-600">Offered:</span>
                          <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100 truncate max-w-[140px] sm:max-w-none">
                            {exchange.skillOffered}
                          </span>
                          <Repeat className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="font-semibold text-stone-600">Requested:</span>
                          <span className="font-bold text-action bg-orange-50 px-2 py-0.5 rounded border border-orange-100 truncate max-w-[140px] sm:max-w-none">
                            {exchange.skillWanted}
                          </span>
                        </div>

                        {exchange.message && (
                          <p className="text-xs text-stone-600 mt-2 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 max-w-2xl break-words">
                            "{exchange.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-end">
                      {isReceiver && exchange.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(exchange._id, 'accepted')}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(exchange._id, 'rejected')}
                            leftIcon={<X className="w-3.5 h-3.5" />}
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {exchange.status === 'accepted' && (
                        <Button
                          variant="forest"
                          size="sm"
                          onClick={() => navigate(`/schedule?partnerId=${otherUser._id}&skill=${encodeURIComponent(exchange.skillWanted)}`)}
                          leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                        >
                          Schedule Session
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/chat')}
                        title="Chat with partner"
                      >
                        <MessageSquare className="w-4 h-4 text-stone-500" />
                      </Button>
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
