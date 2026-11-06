import mongoose from 'mongoose';

/**
 * Escapes regex special characters to prevent ReDoS / RegExp Injection vulnerabilities.
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Checks if a value is a valid MongoDB ObjectId string.
 */
export const isValidObjectId = (id: unknown): id is string => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};

/**
 * Server-authoritative catalog of redeemable perks and their credit costs.
 * Never trust client-supplied costs.
 */
export interface PerkDefinition {
  title: string;
  cost: number;
  badge?: string;
  description: string;
}

export const PERK_CATALOG: Record<string, PerkDefinition> = {
  'Verified Mentor Badge': {
    title: 'Verified Mentor Badge',
    cost: 20,
    badge: 'Verified Mentor',
    description: 'Display a verified shield on your profile and appear higher in match rankings',
  },
  'Featured Profile (7 Days)': {
    title: 'Featured Profile (7 Days)',
    cost: 15,
    badge: 'Featured Swapper',
    description: 'Spotlight your offered skills at the top of the Explore directory',
  },
  'Priority Matchmaking': {
    title: 'Priority Matchmaking',
    cost: 10,
    badge: 'Priority Swapper',
    description: 'Instant priority routing when proposing new reciprocal skill exchanges',
  },
};
