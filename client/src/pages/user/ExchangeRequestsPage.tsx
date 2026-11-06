import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Check, X, CalendarPlus, Clock, ArrowRight, MessageSquare, Plus } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IExchangeRequest } from '../../types';

export const ExchangeRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exchanges, setExchanges] = useState<IExchangeRequest[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'received' | 'sent'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchExchanges = async () => {
    try {
      const res = await api.get('/exchanges');
      if (res.data.success) {
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
      if (res.data.success) {
        fetchExchanges();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating request');
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

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Controls: Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            {(['all', 'received', 'sent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterTab === tab
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab} Requests
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
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
          {filteredExchanges.length === 0 ? (
            <Card className="p-12 text-center">
              <Repeat className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-stone-800">No Exchange Requests Found</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Explore the matching directory to connect with peers and propose knowledge exchanges!
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/matches')}
              >
                Find Swap Partners
              </Button>
            </Card>
          ) : (
            filteredExchanges.map((exchange) => {
              const isReceiver = exchange.receiver._id === user?._id;
              const otherUser = isReceiver ? exchange.sender : exchange.receiver;

              return (
                <Card key={exchange._id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-stone-900">{otherUser.name}</h4>
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
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          <span className="font-semibold text-stone-600">Offered:</span>
                          <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                            {exchange.skillOffered}
                          </span>
                          <Repeat className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-semibold text-stone-600">Requested:</span>
                          <span className="font-bold text-action bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                            {exchange.skillWanted}
                          </span>
                        </div>

                        {exchange.message && (
                          <p className="text-xs text-stone-600 mt-2 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 max-w-2xl">
                            "{exchange.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
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

