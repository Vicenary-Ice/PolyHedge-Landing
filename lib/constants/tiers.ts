export type TierName = 'Observer' | 'Trader' | 'Quant';

export interface TierDetails {
  name: TierName;
  maxSearches: number;
  priceId?: string; // We can add these later if we move to full server validation
}

export const SUBSCRIPTION_TIERS: Record<TierName, TierDetails> = {
  Observer: {
    name: 'Observer',
    maxSearches: 3,
  },
  Trader: {
    name: 'Trader',
    maxSearches: 50,
  },
  Quant: {
    name: 'Quant',
    maxSearches: 1000,
  },
};

export const DEFAULT_TIER: TierName = 'Observer';
export const TIER_STORAGE_KEY = 'polyhedge_user_tier_v1';
export const SEARCH_STORAGE_KEY = 'polyhedge_searches_v1';
