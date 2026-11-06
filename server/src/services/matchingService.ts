import { User, IUser } from '../models/User';
import { isValidObjectId } from '../utils/security';

export interface IMatchResult {
  user: Partial<IUser>;
  matchPercentage: number;
  matchType: 'Best Match' | 'Nearby' | 'Same Interests';
  matchedOfferSkill: string;
  matchedWantedSkill: string;
}

export const computeMatches = async (currentUserId?: string): Promise<IMatchResult[]> => {
  let currentUser: IUser | null = null;
  if (currentUserId && isValidObjectId(currentUserId)) {
    currentUser = await User.findById(currentUserId);
  }

  const allUsers = await User.find({
    status: 'active',
    ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
  }).select('-password');

  const myWants = currentUser?.skillsWanted || [];
  const myOffers = currentUser?.skillsOffered || [];

  const myWantedNames = myWants.map((s) => s.name.trim().toLowerCase());
  const myOfferedNames = myOffers.map((s) => s.name.trim().toLowerCase());
  const myWantedCats = new Set(myWants.map((s) => s.category.trim().toLowerCase()));
  const myOfferedCats = new Set(myOffers.map((s) => s.category.trim().toLowerCase()));

  const results: IMatchResult[] = allUsers.map((candidate) => {
    const candidateOffers = candidate.skillsOffered || [];
    const candidateWants = candidate.skillsWanted || [];

    const candidateOfferNames = candidateOffers.map((s) => s.name.trim().toLowerCase());
    const candidateWantNames = candidateWants.map((s) => s.name.trim().toLowerCase());
    const candidateOfferCats = new Set(candidateOffers.map((s) => s.category.trim().toLowerCase()));

    // 1. Check for mutual direct skill exchange (highest compatibility)
    const directOfferMatch = candidateOffers.find((co) =>
      myWantedNames.some((mw) => mw.includes(co.name.toLowerCase()) || co.name.toLowerCase().includes(mw))
    );
    const directWantMatch = candidateWants.find((cw) =>
      myOfferedNames.some((mo) => mo.includes(cw.name.toLowerCase()) || cw.name.toLowerCase().includes(mo))
    );

    const isMutualMatch = Boolean(directOfferMatch && directWantMatch);
    const isOneWayOfferMatch = Boolean(directOfferMatch);

    // 2. Check category overlap
    const hasCategoryOverlap = Array.from(candidateOfferCats).some((cat) => myWantedCats.has(cat));

    // 3. Check location proximity
    const hasLocationMatch = Boolean(
      currentUser?.location &&
      candidate.location &&
      currentUser.location.trim().toLowerCase() === candidate.location.trim().toLowerCase()
    );

    // 4. Calculate realistic compatibility percentage (0 - 100)
    let score = 50; // Baseline platform active score

    if (isMutualMatch) {
      score = 90;
    } else if (isOneWayOfferMatch) {
      score = 80;
    } else if (hasCategoryOverlap) {
      score = 70;
    }

    // Rating quality bonus: +0 to +6 based on verified peer rating
    const ratingBonus = Math.min(6, Math.max(0, Math.round((candidate.rating - 4.0) * 6)));
    // Reputation bonus: +0 to +4
    const repBonus = Math.min(4, Math.floor(candidate.reputationScore / 50));

    score = Math.min(99, Math.max(50, score + ratingBonus + repBonus));

    // 5. Determine dominant match type
    let matchType: 'Best Match' | 'Nearby' | 'Same Interests' = 'Best Match';
    if (hasLocationMatch && !isMutualMatch) {
      matchType = 'Nearby';
    } else if (hasCategoryOverlap && !isMutualMatch && !isOneWayOfferMatch) {
      matchType = 'Same Interests';
    } else {
      matchType = 'Best Match';
    }

    // Determine reciprocal skill labels
    const matchedOfferSkill = directOfferMatch?.name ||
      candidateOffers[0]?.name ||
      'Software Architecture';

    const matchedWantedSkill = directWantMatch?.name ||
      candidateWants[0]?.name ||
      'UI/UX Design Systems';

    return {
      user: candidate,
      matchPercentage: score,
      matchType,
      matchedOfferSkill,
      matchedWantedSkill,
    };
  });

  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
};
