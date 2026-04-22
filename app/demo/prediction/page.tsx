'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { AnalysisResult } from '@/components/ui/analysis-result';
import { useSearchLimit } from '@/lib/hooks/useSearchLimit';
import { SearchLimitOverlay } from '@/components/search-limit-overlay';

const geist = Geist({ subsets: ['latin'] });

export default function PredictionSearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const { searchCount, maxSearches, tierName, incrementSearch, isInitialized, resetSearches } = useSearchLimit();

  const addLog = (msg: string) => {
    setLogs((prev: string[]) => [...prev.slice(-4), `> ${msg}`]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !isInitialized) return;

    if (searchCount >= maxSearches) {
      setShowOverlay(true);
      addLog('ACCESS_DENIED: PROBABILITY_LIMIT_REACHED');
      return;
    }

    setIsSearching(true);
    setAnalysis(null);
    setError(null);
    setLogs([]);

    addLog('ACCESSING GLOBAL PREDICTION NETWORK...');
    await new Promise(r => setTimeout(r, 600));
    addLog(`SCANNING TOPIC SECTORS: ${query.toUpperCase()}`);
    await new Promise(r => setTimeout(r, 800));
    addLog('PULSING SWARM INTELLIGENCE CHANNELS...');
    await new Promise(r => setTimeout(r, 600));
    addLog('CALCULATING PROBABILITY VECTORS...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query, type: 'prediction' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to reach PolyHedge Intelligence`);
      }

      setAnalysis(data.analysis);
      addLog('SIGNAL ACQUIRED. GENERATING ODDS REPORT...');
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
              // TERMINAL: PREDICTION_MARKETS_ENV
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[#888888] text-[10px] font-mono uppercase tracking-[0.2em] mb-1">
                TIER: <span className="text-[#00FF94] font-bold">{tierName}</span> | 
                CONSUMED: <span className={searchCount >= maxSearches ? "text-red-500 font-bold" : "text-white"}>{Math.min(searchCount, maxSearches)}/{maxSearches}</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Predictive Event Search</h1>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <input
            type="text"
            placeholder="Enter Topic (e.g. US Election 2024, Fed Rate Decision, SpaceX Launch)..."
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
          {logs.length === 0 && <span className="text-muted italic" style={{ color: '#444444' }}>Waiting for event parameters...</span>}
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
              &gt; CALIBRATING VECTORS...
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
              {error} - Ensure your connection to the PolyHedge global mesh is stable.
            </motion.div>
          )}

          {analysis && <AnalysisResult analysis={analysis} type="prediction" />}
        </AnimatePresence>
        <SearchLimitOverlay isVisible={showOverlay} />
      </div>
    </div>
  );
}
