import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Clock,
  Star,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Coins,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IReview } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [skillType, setSkillType] = useState<'offer' | 'want'>('offer');

  // Edit form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [availability, setAvailability] = useState(user?.availability || '');

  // Add skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
      setLocation(user.location);
      setAvailability(user.availability);

      api.get(`/reviews/user/${user._id}`)
        .then((res) => {
          if (res.data.success) setReviews(res.data.reviews || []);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name, bio, location, availability });
    setIsEditModalOpen(false);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
    };

    if (skillType === 'offer') {
      const updated = [...(user?.skillsOffered || []), newSkill];
      await updateUserProfile({ skillsOffered: updated });
    } else {
      const updated = [...(user?.skillsWanted || []), newSkill];
      await updateUserProfile({ skillsWanted: updated });
    }

    setNewSkillName('');
    setIsAddSkillModalOpen(false);
  };

  const handleRemoveSkill = async (index: number, type: 'offer' | 'want') => {
    if (type === 'offer') {
      const updated = (user?.skillsOffered || []).filter((_, i) => i !== index);
      await updateUserProfile({ skillsOffered: updated });
    } else {
      const updated = (user?.skillsWanted || []).filter((_, i) => i !== index);
      await updateUserProfile({ skillsWanted: updated });
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header title="My Profile" subtitle="Manage your public information, skills portfolio, and peer reviews" />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Profile Header & Cover Card */}
        <div className="relative rounded-3xl bg-white border border-stone-200/80 shadow-elevated overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-r from-forest-800 to-forest-600">
            <img
              src={user?.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80'}
              alt="Cover"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-md"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Profile Meta Row */}
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-stone-900 font-['Plus_Jakarta_Sans']">{user?.name}</h2>
                    <Badge variant="forest">
                      {user?.role === 'learner_mentor' ? 'Learner & Mentor' : user?.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" /> {user?.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {user?.availability}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {user?.rating || 4.9} ({reviews.length} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-200/60 text-action flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-bold">{user?.credits || 0} Credits</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-bold">{user?.reputationScore || 100} Rep</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              {user?.bio}
            </p>

            {/* Achievement Badges Row */}
            <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide mr-2">Badges:</span>
              {user?.badges?.map((badge, idx) => (
                <Badge key={idx} variant="purple" size="md" icon={<Award className="w-3.5 h-3.5" />}>
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 2 Columns: Skills I Offer & Skills I Want */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills I Offer */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Skills I Offer (Mentorship)</h3>
                <p className="text-xs text-stone-500">Skills you teach to other members to earn credits</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSkillType('offer'); setIsAddSkillModalOpen(true); }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Offer
              </Button>
            </div>

            <div className="space-y-3">
              {user?.skillsOffered?.map((skill, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-stone-900">{skill.name}</h5>
                    <p className="text-xs text-stone-500 mt-0.5">{skill.category} • {skill.description || 'Experienced'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="forest" size="sm">{skill.level}</Badge>
                    <button
                      onClick={() => handleRemoveSkill(index, 'offer')}
                      className="p-1 rounded text-stone-400 hover:text-rose-500 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills I Want */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Skills I Want (Learning Goals)</h3>
                <p className="text-xs text-stone-500">Skills you want to learn from community mentors</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSkillType('want'); setIsAddSkillModalOpen(true); }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Goal
              </Button>
            </div>

            <div className="space-y-3">
              {user?.skillsWanted?.map((skill, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-stone-900">{skill.name}</h5>
                    <p className="text-xs text-stone-500 mt-0.5">{skill.category} • {skill.description || 'Eager to learn'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="orange" size="sm">{skill.level}</Badge>
                    <button
                      onClick={() => handleRemoveSkill(index, 'want')}
                      className="p-1 rounded text-stone-400 hover:text-rose-500 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Reviews Received Section */}
        <Card>
          <div className="pb-4 border-b border-stone-100 mb-6">
            <h3 className="text-lg font-bold text-stone-900">Verified Peer Reviews & Testimonials</h3>
            <p className="text-xs text-stone-500">Feedback from peers after completed exchange sessions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 col-span-2">
                No reviews yet. Complete your first session to receive reviews and boost your reputation!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.reviewer?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h6 className="text-xs font-bold text-stone-900">{rev.reviewer?.name}</h6>
                          <span className="text-[10px] text-stone-400">{rev.reviewer?.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
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
                    <p className="text-xs text-stone-600 italic leading-relaxed mt-2">"{rev.feedback}"</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] text-forest-700 font-bold">
                    Swapped: {rev.skillSwapped}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Availability Schedule</label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Bio / Expertise Statement</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        title={skillType === 'offer' ? 'Add Skill You Can Teach' : 'Add Skill You Want to Learn'}
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js, Figma, Spanish, Python"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            >
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Language">Language</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Experience Level</label>
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

