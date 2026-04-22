'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  SUBSCRIPTION_TIERS, 
  DEFAULT_TIER, 
  TIER_STORAGE_KEY, 
  SEARCH_STORAGE_KEY,
  TierName 
} from '../constants/tiers';

export function useSearchLimit() {
  const [searchCount, setSearchCount] = useState<number>(0);
  const [tier, setTier] = useState<TierName>(DEFAULT_TIER);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Reset credits as requested by the user for this session
    localStorage.removeItem('polyhedge_searches_v1');
    
    // Original initialization logic
    const savedCount = localStorage.getItem(SEARCH_STORAGE_KEY);
    const savedTier = localStorage.getItem(TIER_STORAGE_KEY) as TierName;

    if (savedCount) {
      setSearchCount(parseInt(savedCount, 10));
    }
    if (savedTier && SUBSCRIPTION_TIERS[savedTier]) {
      setTier(savedTier);
    }
    setIsInitialized(true);
  }, []);

  // Update localStorage when count changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SEARCH_STORAGE_KEY, searchCount.toString());
      localStorage.setItem(TIER_STORAGE_KEY, tier);
    }
  }, [searchCount, tier, isInitialized]);

  const incrementSearch = useCallback(() => {
    setSearchCount((prev) => prev + 1);
  }, []);

  const resetSearches = useCallback(() => {
    setSearchCount(0);
    localStorage.setItem(SEARCH_STORAGE_KEY, '0');
  }, []);

  const upgradeTier = useCallback((newTier: TierName) => {
    if (SUBSCRIPTION_TIERS[newTier]) {
      setTier(newTier);
    }
  }, []);

  const currentTierDetails = SUBSCRIPTION_TIERS[tier];
  const maxSearches = currentTierDetails.maxSearches;
  const isLimitReached = searchCount >= maxSearches;
  const remainingSearches = Math.max(0, maxSearches - searchCount);

  return {
    searchCount,
    tier,
    tierName: currentTierDetails.name,
    remainingSearches,
    isLimitReached,
    incrementSearch,
    resetSearches,
    upgradeTier,
    isInitialized,
    maxSearches
  };
}
