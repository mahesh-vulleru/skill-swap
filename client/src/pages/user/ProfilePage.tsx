import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  Award,
  Plus,
  Trash2,
  Edit3,
  Coins,
  MessageSquare,
  CalendarCheck,
  Repeat,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IReview, IUser } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { id: paramUserId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const isOwnProfile = !paramUserId || paramUserId === user?._id;
  const [publicUser, setPublicUser] = useState<IUser | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(false);

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [skillType, setSkillType] = useState<'offer' | 'want'>('offer');

  // Delete skill confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<{ index: number; type: 'offer' | 'want'; name: string } | null>(null);

  // Edit form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [availability, setAvailability] = useState(user?.availability || '');

  // Add skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  // Load profile data
  useEffect(() => {
    if (isOwnProfile) {
      if (user) {
        setName(user.name);
        setBio(user.bio);
        setLocation(user.location);
        setAvailability(user.availability);

        api.get(`/reviews/user/${user._id}`)
          .then((res) => {
            if (res.data?.success) setReviews(res.data.reviews || []);
          })
          .catch(console.error);
      }
    } else if (paramUserId) {
      setLoadingPublic(true);
      api.get(`/users/${paramUserId}`)
        .then((res) => {
          if (res.data?.success) {
            setPublicUser(res.data.user);
          }
        })
        .catch((err) => {
          console.error('Failed to load user profile:', err);
          toastError('User profile could not be loaded.');
        })
        .finally(() => setLoadingPublic(false));

      api.get(`/reviews/user/${paramUserId}`)
        .then((res) => {
          if (res.data?.success) setReviews(res.data.reviews || []);
        })
        .catch(console.error);
    }
  }, [paramUserId, user, isOwnProfile]);

  const activeProfile = isOwnProfile ? user : publicUser;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name, bio, location, availability });
      success('Profile details updated successfully!');
      setIsEditModalOpen(false);
    } catch {
      toastError('Failed to update profile.');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
    };

    try {
      if (skillType === 'offer') {
        const updated = [...(user?.skillsOffered || []), newSkill];
        await updateUserProfile({ skillsOffered: updated });
        success(`Added "${newSkill.name}" to your offered skills!`);
      } else {
        const updated = [...(user?.skillsWanted || []), newSkill];
        await updateUserProfile({ skillsWanted: updated });
        success(`Added "${newSkill.name}" to your learning goals!`);
      }

      setNewSkillName('');
      setIsAddSkillModalOpen(false);
    } catch {
      toastError('Failed to add skill.');
    }
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      if (skillToDelete.type === 'offer') {
        const updated = (user?.skillsOffered || []).filter((_, i) => i !== skillToDelete.index);
        await updateUserProfile({ skillsOffered: updated });
      } else {
        const updated = (user?.skillsWanted || []).filter((_, i) => i !== skillToDelete.index);
        await updateUserProfile({ skillsWanted: updated });
      }
      success(`Removed skill "${skillToDelete.name}".`);
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    } catch {
      toastError('Failed to remove skill.');
    }
  };

  if (loadingPublic) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header title="User Profile" />
        <div className="p-8 text-center text-stone-500">User not found or unavailable.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title={isOwnProfile ? 'My Profile' : `${activeProfile.name}'s Profile`}
        subtitle={isOwnProfile ? 'Manage your public information, skills portfolio, and peer reviews' : 'Community member profile & knowledge exchange portfolio'}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: isOwnProfile ? 'Profile' : activeProfile.name }]} />

        {/* Profile Header & Cover Card */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-stone-200/80 shadow-elevated overflow-hidden">
          {/* Cover Photo */}
          <div className="h-36 sm:h-48 md:h-60 w-full relative overflow-hidden bg-gradient-to-r from-forest-800 to-forest-600">
            <img
              src={activeProfile.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80'}
              alt="Cover"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute top-4 right-4">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-md shadow-sm"
                  onClick={() => setIsEditModalOpen(true)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => navigate(`/chat/${activeProfile._id}`)}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Chat
                  </Button>
                  <Button
                    variant="forest"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => navigate(`/schedule?partnerId=${activeProfile._id}`)}
                    leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
                  >
                    Schedule Session
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Meta Row */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 sm:-mt-16 md:-mt-20 gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                <Avatar
                  src={activeProfile.avatar}
                  name={activeProfile.name || 'User'}
                  size="2xl"
                  className="ring-4 ring-white shadow-xl bg-white rounded-full"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-['Plus_Jakarta_Sans'] truncate">
                      {activeProfile.name}
                    </h2>
                    <Badge variant="forest">
                      {activeProfile.role === 'learner_mentor' ? 'Learner & Mentor' : activeProfile.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" /> {activeProfile.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {activeProfile.availability || 'Flexible'}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {activeProfile.rating ?? 4.9} ({reviews.length} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {isOwnProfile && (
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-orange-50 border border-orange-200/60 text-action flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-bold">{activeProfile.credits ?? 0} Credits</span>
                  </div>
                )}
                <div className="px-3 sm:px-4 py-2 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-bold">{activeProfile.reputationScore ?? 100} Rep</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {activeProfile.bio || 'No bio provided yet.'}
            </p>

            {/* Achievement Badges Row */}
            <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide mr-2">Badges:</span>
              {activeProfile.badges && activeProfile.badges.length > 0 ? (
                activeProfile.badges.map((badge, idx) => (
                  <Badge key={idx} variant="purple" size="md" icon={<Award className="w-3.5 h-3.5" />}>
                    {badge}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-stone-400 italic">No badges earned yet</span>
              )}
            </div>
          </div>
        </div>

        {/* 2 Columns: Skills I Offer & Skills I Want */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Skills Offered */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {isOwnProfile ? 'Skills I Offer (Mentorship)' : `${activeProfile.name.split(' ')[0]}'s Offered Skills`}
                </h3>
                <p className="text-xs text-stone-500">Skills available to learn from this member</p>
              </div>
              {isOwnProfile && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setSkillType('offer'); setIsAddSkillModalOpen(true); }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Offer
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {activeProfile.skillsOffered && activeProfile.skillsOffered.length > 0 ? (
                activeProfile.skillsOffered.map((skill, index) => (
                  <div key={index} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-stone-900">{skill.name}</h5>
                      <p className="text-xs text-stone-500 mt-0.5">{skill.category} • {skill.description || 'Experienced'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="forest" size="sm">{skill.level}</Badge>
                      {isOwnProfile && (
                        <button
                          onClick={() => {
                            setSkillToDelete({ index, type: 'offer', name: skill.name });
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-500 transition-colors"
                          title="Remove skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 py-3 text-center">No offered skills listed yet.</p>
              )}
            </div>
          </Card>

          {/* Skills Wanted */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {isOwnProfile ? 'Skills I Want (Learning Goals)' : `Skills ${activeProfile.name.split(' ')[0]} Wants to Learn`}
                </h3>
                <p className="text-xs text-stone-500">Skills targeted for peer knowledge acquisition</p>
              </div>
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setSkillType('want'); setIsAddSkillModalOpen(true); }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Goal
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {activeProfile.skillsWanted && activeProfile.skillsWanted.length > 0 ? (
                activeProfile.skillsWanted.map((skill, index) => (
                  <div key={index} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-stone-900">{skill.name}</h5>
                      <p className="text-xs text-stone-500 mt-0.5">{skill.category} • {skill.description || 'Eager to learn'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="orange" size="sm">{skill.level}</Badge>
                      {isOwnProfile && (
                        <button
                          onClick={() => {
                            setSkillToDelete({ index, type: 'want', name: skill.name });
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-500 transition-colors"
                          title="Remove skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 py-3 text-center">No learning goals listed yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Reviews Received Section */}
        <Card>
          <div className="pb-4 border-b border-stone-100 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">Verified Peer Reviews & Testimonials</h3>
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
                        <Avatar
                          src={rev.reviewer?.avatar}
                          name={rev.reviewer?.name || 'Reviewer'}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-stone-900 truncate">{rev.reviewer?.name}</h6>
                          <span className="text-[10px] text-stone-400 truncate">{rev.reviewer?.location || 'Remote'}</span>
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

      {/* Edit Profile Modal (Own Profile Only) */}
      {isOwnProfile && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile Details">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Location"
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Availability"
              type="text"
              placeholder="e.g. Weekday evenings, Weekends"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
            <Textarea
              label="Bio"
              rows={4}
              placeholder="Tell others what you do and what you are eager to learn..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Skill Modal (Own Profile Only) */}
      {isOwnProfile && (
        <Modal
          isOpen={isAddSkillModalOpen}
          onClose={() => setIsAddSkillModalOpen(false)}
          title={skillType === 'offer' ? 'Add Offered Skill to Teach' : 'Add Learning Goal Skill'}
        >
          <form onSubmit={handleAddSkill} className="space-y-4">
            <Input
              label="Skill Name"
              type="text"
              required
              placeholder="e.g. Next.js, Figma, Italian..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />
            <Select
              label="Category"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              options={[
                { value: 'Programming', label: 'Programming' },
                { value: 'Design', label: 'Design' },
                { value: 'Business', label: 'Business' },
                { value: 'Language', label: 'Language' },
                { value: 'Video Editing', label: 'Video Editing' },
                { value: 'Data Science', label: 'Data Science' },
              ]}
            />
            <Select
              label="Proficiency Level"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value as any)}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'Expert', label: 'Expert' },
              ]}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSkillModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant={skillType === 'offer' ? 'primary' : 'secondary'} size="sm">
                Add Skill
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Skill Confirmation */}
      {isOwnProfile && (
        <ConfirmationDialog
          isOpen={deleteConfirmOpen}
          title="Remove Skill"
          message={`Are you sure you want to remove "${skillToDelete?.name}" from your ${skillToDelete?.type === 'offer' ? 'offered skills' : 'learning goals'}?`}
          confirmText="Yes, Remove"
          variant="danger"
          onConfirm={confirmDeleteSkill}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setSkillToDelete(null);
          }}
        />
      )}
    </div>
  );
};
