'use client';

import { useState, useEffect, useCallback } from 'react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import {
  SUBSCRIPTION_TIERS,
  DEFAULT_TIER,
  TIER_STORAGE_KEY,
  TierName,
} from '../constants/tiers';

export { supabase };

export function useSearchLimit() {
  const [searchCount, setSearchCount] = useState<number>(0);
  const [tier, setTier] = useState<TierName>(DEFAULT_TIER);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTier = localStorage.getItem(TIER_STORAGE_KEY) as TierName;
    if (savedTier && SUBSCRIPTION_TIERS[savedTier]) {
      setTier(savedTier);
    }

    if (!hasSupabaseConfig) {
      setSearchCount(0);
      setIsInitialized(true);
      return;
    }

    // onAuthStateChange fires immediately with INITIAL_SESSION — more reliable than getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session?.user) {
            // Read tier from user metadata (source of truth across devices)
            const tierFromMetadata = session.user.user_metadata?.tier as TierName;
            if (tierFromMetadata && SUBSCRIPTION_TIERS[tierFromMetadata]) {
              setTier(tierFromMetadata);
              localStorage.setItem(TIER_STORAGE_KEY, tierFromMetadata);
            }

            const { data } = await supabase
              .from('search_usage')
              .select('search_count')
              .eq('user_id', session.user.id)
              .single();
            setSearchCount(data?.search_count ?? 0);
          }
          setIsInitialized(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const incrementSearch = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setSearchCount((count) => count + 1);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const newCount = searchCount + 1;
    setSearchCount(newCount);

    await supabase.from('search_usage').upsert(
      { user_id: session.user.id, search_count: newCount, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  }, [searchCount]);

  const resetSearches = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setSearchCount(0);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setSearchCount(0);
    await supabase.from('search_usage').upsert(
      { user_id: session.user.id, search_count: 0, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  }, []);

  const upgradeTier = useCallback((newTier: TierName) => {
    if (SUBSCRIPTION_TIERS[newTier]) {
      setTier(newTier);
      localStorage.setItem(TIER_STORAGE_KEY, newTier);
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
    maxSearches,
  };
}
