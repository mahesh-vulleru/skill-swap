import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Star, MessageSquare, Send } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { SkeletonCard } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IMatchResult } from '../../types';

export const FindPartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [matches, setMatches] = useState<IMatchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Best Match' | 'Nearby' | 'Same Interests'>('All');
  const [loading, setLoading] = useState(true);

  // Exchange Request Modal
  const [selectedPartner, setSelectedPartner] = useState<IMatchResult | null>(null);
  const [skillOffered, setSkillOffered] = useState('');
  const [skillWanted, setSkillWanted] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    api.get('/matches')
      .then((res) => {
        if (res.data?.success) {
          setMatches(res.data.matches || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = activeTab === 'All'
    ? matches
    : matches.filter((m) => m.matchType === activeTab);

  const handleOpenRequestModal = (partner: IMatchResult) => {
    setSelectedPartner(partner);
    setSkillWanted(partner.matchedOfferSkill);
    setSkillOffered(partner.matchedWantedSkill);
    setRequestMessage(`Hi ${partner.user.name}, I noticed we have reciprocal learning interests! I'd love to exchange skills with you.`);
    setRequestSuccess(false);
  };

  const handleSendExchangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    setSendingRequest(true);
    try {
      const res = await api.post('/exchanges', {
        receiverId: selectedPartner.user._id,
        skillOffered,
        skillWanted,
        message: requestMessage,
      });

      if (res.data?.success) {
        setRequestSuccess(true);
        success(`Exchange request sent to ${selectedPartner.user.name}!`);
        setTimeout(() => {
          setSelectedPartner(null);
          navigate('/exchange-requests');
        }, 1200);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to send exchange request');
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Skill Matching & Partner Discovery"
        subtitle="AI-assisted reciprocal compatibility scoring to find your ideal knowledge swap partner"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Find Partners' }]} />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-stone-200 pb-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['All', 'Best Match', 'Nearby', 'Same Interests'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab === 'All' ? `All Matches (${matches.length})` : tab}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            title="No Matching Partners in this Category"
            description="Try selecting 'All Matches' to view other potential knowledge partners or update your profile skills."
            action={{
              label: 'View All Matches',
              onClick: () => setActiveTab('All'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMatches.map((match, idx) => (
              <Card
                key={idx}
                className="flex flex-col justify-between hover:border-forest-600 transition-all p-5 sm:p-6 group"
              >
                <div>
                  {/* Header: Avatar, Name, Compatibility Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={match.user.avatar}
                        name={match.user.name}
                        size="md"
                        className="group-hover:ring-2 group-hover:ring-action transition-all"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-stone-900 group-hover:text-forest-700 transition-colors truncate">
                          {match.user.name}
                        </h3>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" /> {match.user.location || 'Remote'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <Badge variant={match.matchPercentage >= 90 ? 'orange' : 'forest'} size="sm">
                        <Sparkles className="w-3 h-3" /> {match.matchPercentage}% Match
                      </Badge>
                    </div>
                  </div>

                  {/* Compatibility Progress Meter */}
                  <div className="w-full bg-stone-100 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        match.matchPercentage >= 90 ? 'bg-action' : 'bg-forest-600'
                      }`}
                      style={{ width: `${match.matchPercentage}%` }}
                    />
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                    {match.user.bio || 'Passionate skill swapper ready to exchange knowledge.'}
                  </p>

                  {/* Reciprocal Skill Swap Box */}
                  <div className="p-3.5 rounded-xl bg-forest-50/60 border border-forest-100 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wide">They Offer:</span>
                      <span className="font-semibold text-stone-900 truncate max-w-[150px]">{match.matchedOfferSkill}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-forest-200/50">
                      <span className="text-[11px] font-bold text-action uppercase tracking-wide">They Want:</span>
                      <span className="font-semibold text-stone-900 truncate max-w-[150px]">{match.matchedWantedSkill}</span>
                    </div>
                  </div>

                  {/* Badges & Stats */}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {match.user.rating || 4.9}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {match.user.sessionsCompleted || 10}+ sessions completed
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/chat/${match.user._id}`)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenRequestModal(match)}
                  >
                    Send Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Exchange Request Modal */}
      <Modal
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        title={`Send Exchange Request to ${selectedPartner?.user.name}`}
      >
        {requestSuccess ? (
          <div className="p-6 text-center text-forest-700 font-bold text-sm">
            🎉 Exchange request sent successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSendExchangeRequest} className="space-y-4">
            <Input
              label="Skill You Will Teach (Offer)"
              type="text"
              required
              value={skillOffered}
              onChange={(e) => setSkillOffered(e.target.value)}
            />
            <Input
              label="Skill You Want to Learn (Request)"
              type="text"
              required
              value={skillWanted}
              onChange={(e) => setSkillWanted(e.target.value)}
            />
            <Textarea
              label="Personal Message"
              rows={3}
              required
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              showCount
              maxLength={300}
            />
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setSelectedPartner(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={sendingRequest}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Exchange Proposal
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
