import React, { useState, useEffect } from 'react';
import { Star, Award, MessageSquare, ThumbsUp, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IReview, IUser } from '../../types';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [partners, setPartners] = useState<IUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review Form state
  const [selectedRevieweeId, setSelectedRevieweeId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [skillSwapped, setSkillSwapped] = useState('React & TypeScript');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/reviews/user/${user._id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();

    api.get('/users').then((res) => {
      if (res.data.success) {
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

      if (res.data.success) {
        setIsModalOpen(false);
        setFeedback('');
        fetchReviews();
        alert('Review submitted and credits/reputation updated!');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const badgeList = [
    { name: 'Top Mentor', desc: 'Maintained 4.9+ rating across 20+ sessions', icon: '🏆', color: 'purple' },
    { name: 'Active Learner', desc: 'Completed 10+ hours of peer skill acquisition', icon: '⚡', color: 'forest' },
    { name: 'Community Star', desc: 'Consistent 5-star feedback from knowledge partners', icon: '⭐', color: 'orange' },
    { name: 'First Exchange', desc: 'Successfully hosted your inaugural swap session', icon: '🎯', color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Reviews & Reputation"
        subtitle="Track community trust, unlocked achievement badges, and peer testimonials"
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Reputation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-forest-800 to-forest-700 text-white border-forest-600">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-action" /> Verified Community Standing
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                {user?.rating || 4.9} <span className="text-lg text-emerald-200">/ 5.0</span>
              </h2>
              <div className="flex items-center gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-emerald-100/90 mt-1">
                Based on verified completed sessions. High reputation unlocks priority matchmaking and badge perks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-forest-900/60 border border-emerald-400/20 text-center shrink-0 w-full sm:w-auto">
              <span className="text-xs uppercase font-bold text-emerald-300 tracking-wide">Reputation Score</span>
              <div className="text-3xl font-extrabold text-white mt-1 font-['Plus_Jakarta_Sans']">
                {user?.reputationScore || 120}
              </div>
              <span className="text-[10px] text-action font-bold block mt-0.5">Top 5% of Mentors</span>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">Leave Peer Feedback</h3>
              <p className="text-xs text-stone-500">
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
          <h3 className="text-lg font-bold text-stone-900 mb-4 font-['Plus_Jakarta_Sans']">
            Unlocked Achievements & Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badgeList.map((badge, idx) => (
              <Card key={idx} className="p-5 flex items-start gap-4 hover:border-forest-600 transition-all">
                <div className="text-3xl p-2.5 rounded-2xl bg-forest-50 border border-forest-100 shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{badge.name}</h4>
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
        <Card className="p-6">
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
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                        alt={rev.reviewer?.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{rev.reviewer?.name}</h4>
                        <span className="text-[10px] text-stone-400">{rev.reviewer?.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
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
                    <span>Verified Session</span>
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
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Exchange Partner</label>
            <select
              value={selectedRevieweeId}
              onChange={(e) => setSelectedRevieweeId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
            >
              {partners.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      num <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-stone-600 ml-2">{rating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Skill Swapped</label>
            <input
              type="text"
              required
              value={skillSwapped}
              onChange={(e) => setSkillSwapped(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Written Testimonial</label>
            <textarea
              rows={3}
              required
              placeholder="What made this learning exchange valuable?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>

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

