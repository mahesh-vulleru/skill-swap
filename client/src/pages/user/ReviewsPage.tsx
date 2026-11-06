import React, { useState, useEffect } from 'react';
import { Star, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IReview, IUser } from '../../types';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [partners, setPartners] = useState<IUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review Form state
  const [selectedRevieweeId, setSelectedRevieweeId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [skillSwapped, setSkillSwapped] = useState('React & TypeScript');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/reviews/user/${user._id}`);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();

    api.get('/users').then((res) => {
      if (res.data?.success) {
        const others = (res.data.users || []).filter((u: IUser) => u._id !== user?._id);
        setPartners(others);
        if (others.length > 0) setSelectedRevieweeId(others[0]._id);
      }
    });
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevieweeId || !feedback.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        revieweeId: selectedRevieweeId,
        rating,
        feedback,
        skillSwapped,
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setFeedback('');
        fetchReviews();
        toastSuccess('Review submitted and credits/reputation updated!');
      }
    } catch (err: any) {
      toastError(err.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const badgeList = [
    { name: 'Top Mentor', desc: 'Maintained 4.9+ rating across 20+ sessions', icon: '🏆' },
    { name: 'Active Learner', desc: 'Completed 10+ hours of peer skill acquisition', icon: '⚡' },
    { name: 'Community Star', desc: 'Consistent 5-star feedback from knowledge partners', icon: '⭐' },
    { name: 'First Exchange', desc: 'Successfully hosted your inaugural swap session', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Reviews & Reputation"
        subtitle="Track community trust, unlocked achievement badges, and peer testimonials"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Reviews & Reputation' }]} />

        {/* Top Reputation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-5 sm:p-6 md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-forest-800 to-forest-700 text-white border-forest-600">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-action" /> Verified Community Standing
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                {user?.rating || 4.9} <span className="text-base sm:text-lg text-emerald-200">/ 5.0</span>
              </h2>
              <div className="flex items-center gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Based on verified completed sessions. High reputation unlocks priority matchmaking and badge perks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-forest-900/60 border border-emerald-400/20 text-center shrink-0 w-full sm:w-auto">
              <span className="text-xs uppercase font-bold text-emerald-300 tracking-wide">Reputation Score</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Plus_Jakarta_Sans']">
                {user?.reputationScore || 120}
              </div>
              <span className="text-[10px] text-action font-bold block mt-0.5">Top 5% of Mentors</span>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">Leave Peer Feedback</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Rate your recent partner after a session to help them build reputation and earn +2 bonus credits.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Write Review
            </Button>
          </Card>
        </div>

        {/* Achievement Badges Section */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-4 font-['Plus_Jakarta_Sans']">
            Unlocked Achievements & Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badgeList.map((badge, idx) => (
              <Card key={idx} className="p-4 sm:p-5 flex items-start gap-4 hover:border-forest-600 transition-all">
                <div className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-forest-50 border border-forest-100 shrink-0 select-none">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-stone-900 truncate">{badge.name}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{badge.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-2">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <Card className="p-4 sm:p-6">
          <div className="pb-4 border-b border-stone-100 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Peer Reviews Received</h3>
              <p className="text-xs text-stone-500">Verbatim feedback from your completed knowledge swaps</p>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              {reviews.length} Total
            </span>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">
                No reviews yet. Host a session to receive your first testimonial!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={rev.reviewer?.avatar}
                        name={rev.reviewer?.name || 'Reviewer'}
                        size="md"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{rev.reviewer?.name}</h4>
                        <span className="text-[10px] text-stone-400 truncate">{rev.reviewer?.location || 'Remote'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 italic mt-2 leading-relaxed">
                    "{rev.feedback}"
                  </p>

                  <div className="mt-3 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Skill Swapped: <strong className="text-forest-700">{rev.skillSwapped}</strong></span>
                    <span className="font-semibold text-emerald-700">Verified Session</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Leave Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Peer Review">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <Select
            label="Exchange Partner"
            value={selectedRevieweeId}
            onChange={(e) => setSelectedRevieweeId(e.target.value)}
            options={partners.map((p) => ({
              value: p._id,
              label: `${p.name} (${p.role})`,
            }))}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => {
                const filled = hoverRating !== null ? num <= hoverRating : num <= rating;
                return (
                  <button
                    key={num}
                    type="button"
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(num)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Rate ${num} stars`}
                  >
                    <Star
                      className={`w-6 h-6 sm:w-7 sm:h-7 ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-stone-600 ml-2">
                {hoverRating ?? rating} Stars
              </span>
            </div>
          </div>

          <Input
            label="Skill Swapped"
            type="text"
            required
            value={skillSwapped}
            onChange={(e) => setSkillSwapped(e.target.value)}
          />

          <Textarea
            label="Written Testimonial"
            rows={3}
            required
            placeholder="What made this learning exchange valuable?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
