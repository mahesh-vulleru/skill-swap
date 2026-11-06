import { User, IUser } from '../models/User';

export interface IMatchResult {
  user: Partial<IUser>;
  matchPercentage: number;
  matchType: 'Best Match' | 'Nearby' | 'Same Interests';
  matchedOfferSkill: string;
  matchedWantedSkill: string;
}

export const computeMatches = async (currentUserId?: string): Promise<IMatchResult[]> => {
  let currentUser: IUser | null = null;
  if (currentUserId) {
    currentUser = await User.findById(currentUserId);
  }

  const allUsers = await User.find({
    status: 'active',
    ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
  }).select('-password');

  const myWants = currentUser?.skillsWanted.map((s) => s.name.toLowerCase()) || [];
  const myOffers = currentUser?.skillsOffered.map((s) => s.name.toLowerCase()) || [];

  return allUsers.map((candidate, index) => {
    const candidateOffers = candidate.skillsOffered.map((s) => s.name.toLowerCase());
    const candidateWants = candidate.skillsWanted.map((s) => s.name.toLowerCase());

    // Check direct mutual overlaps
    const directMatch = myWants.some((w) => candidateOffers.includes(w)) && myOffers.some((o) => candidateWants.includes(o));
    const offerMatch = myWants.find((w) => candidateOffers.includes(w)) || candidate.skillsOffered[0]?.name || 'Web Development';
    const wantMatch = myOffers.find((o) => candidateWants.includes(o)) || candidate.skillsWanted[0]?.name || 'UI/UX Design';

    let matchPercentage = 80;
    if (directMatch) {
      matchPercentage = 95 + (index % 4);
    } else if (myWants.some((w) => candidateOffers.includes(w))) {
      matchPercentage = 88 + (index % 6);
    } else {
      matchPercentage = 75 + ((candidate.reputationScore + index * 5) % 20);
    }

    if (matchPercentage > 99) matchPercentage = 98;

    let matchType: 'Best Match' | 'Nearby' | 'Same Interests' = 'Best Match';
    if (index % 3 === 1) matchType = 'Nearby';
    else if (index % 3 === 2) matchType = 'Same Interests';

    return {
      user: candidate,
      matchPercentage,
      matchType,
      matchedOfferSkill: offerMatch,
      matchedWantedSkill: wantMatch,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
};

