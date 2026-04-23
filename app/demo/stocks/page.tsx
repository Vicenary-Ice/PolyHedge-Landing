'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { AnalysisResult } from '@/components/ui/analysis-result';
import { useSearchLimit, supabase } from '@/lib/hooks/useSearchLimit';
import { SearchLimitOverlay } from '@/components/search-limit-overlay';
import posthog from 'posthog-js';

const geist = Geist({ subsets: ['latin'] });

export default function StockSearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const { searchCount, maxSearches, tierName, incrementSearch, isInitialized } = useSearchLimit();

  const addLog = (msg: string) => {
    setLogs((prev: string[]) => [...prev.slice(-4), `> ${msg}`]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !isInitialized) return;
    
    if (searchCount >= maxSearches) {
      posthog.capture('search_limit_reached', { tier: tierName, max_searches: maxSearches });
      setShowOverlay(true);
      addLog('ACCESS_DENIED: TRIAL_LIMIT_REACHED');
      return;
    }

    setIsSearching(true);
    setAnalysis(null);
    setError(null);
    setLogs([]);

    addLog('INITIALIZING SECURE TERMINAL CONNECTION...');
    await new Promise(r => setTimeout(r, 600));
    addLog(`SEARCHING DATABASE FOR TICKET: ${query.toUpperCase()}`);
    await new Promise(r => setTimeout(r, 800));
    addLog('CONTACTING AUTONOMOUS WEB AGENTS...');
    await new Promise(r => setTimeout(r, 600));
    addLog('SYNTHESIZING MARKET SIGNALS VIA MIROFISH...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ topic: query, type: 'stock' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to reach PolyHedge Intelligence`);
      }

      setAnalysis(data.analysis);
      addLog('ANALYSIS COMPLETE. DECRYPTING REPORT...');
      posthog.capture('stock_search_performed', { ticker: query.toUpperCase(), tier: tierName, searches_used: searchCount + 1 });
      incrementSearch();
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown network error';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage.toUpperCase()}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${geist.className} min-h-screen bg-black text-white p-8 flex flex-col items-center`}>
      {/* Background scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-5 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <Link href="/demo" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-12" style={{ color: '#444444' }}>
          <ArrowLeft size={16} /> BACK TO SELECTION
        </Link>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-2">
            <div className="text-accent text-sm font-bold tracking-widest uppercase" style={{ color: '#00FF94' }}>
              // TERMINAL: STOCK_DATA_ENV
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[#888888] text-[10px] font-mono uppercase tracking-[0.2em] mb-1">
                TIER: <span className="text-[#00FF94] font-bold">{tierName}</span> | 
                CONSUMED: <span className={searchCount >= maxSearches ? "text-red-500 font-bold" : "text-white"}>{Math.min(searchCount, maxSearches)}/{maxSearches}</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Institutional Equity Search</h1>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <input
            type="text"
            placeholder="Enter Stock Ticker (e.g. NVDA, AAPL, BTC)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border-2 border-border rounded-lg px-6 py-5 text-xl focus:outline-none focus:border-accent transition-colors pr-16"
            style={{ backgroundColor: '#111111', borderColor: '#1E1E1E' }}
            disabled={isSearching}
          />
          <button 
            type="submit"
            disabled={isSearching || !query}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-accent hover:scale-110 transition-transform disabled:opacity-50"
            style={{ color: '#00FF94' }}
          >
            {isSearching ? <Loader2 className="animate-spin" /> : <Search size={28} />}
          </button>
        </form>

        {/* Terminal Logs */}
        <div className="mb-12 min-h-[140px] font-mono text-sm bg-black/40 p-6 rounded border border-border/50" style={{ borderColor: 'rgba(30, 30, 30, 0.5)' }}>
          {logs.length === 0 && <span className="text-muted italic" style={{ color: '#444444' }}>Waiting for operator input...</span>}
          {logs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className={log.includes('ERROR') ? 'text-red-500' : 'text-accent/80'}
              style={{ color: log.includes('ERROR') ? undefined : 'rgba(0, 255, 148, 0.8)' }}
            >
              {log}
            </motion.div>
          ))}
          {isSearching && (
            <motion.div 
              animate={{ opacity: [0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-accent"
              style={{ color: '#00FF94' }}
            >
              &gt; PROCESSING...
            </motion.div>
          )}
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-red-500/10 border-2 border-red-500 rounded-lg text-red-500 font-bold"
            >
              {error} - Please verify your API key and network connection.
            </motion.div>
          )}

          {analysis && <AnalysisResult analysis={analysis} type="stock" />}
        </AnimatePresence>
        <SearchLimitOverlay isVisible={showOverlay} />
      </div>
    </div>
  );
}
