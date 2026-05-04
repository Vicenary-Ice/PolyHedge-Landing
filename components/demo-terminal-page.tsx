'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import posthog from 'posthog-js';
import { SearchLimitOverlay } from '@/components/search-limit-overlay';
import { supabase, useSearchLimit } from '@/lib/hooks/useSearchLimit';
import {
  ACCENT,
  CHART_HEIGHT,
  CHART_WIDTH,
  CONFIG,
  DemoType,
  SignalModel,
  SourceConfig,
  buildSignalModel,
  clamp,
  subjectFor,
  subjectMeta,
} from '@/components/demo-terminal-model';

const geist = Geist({ subsets: ['latin'] });
const mono = Geist_Mono({ subsets: ['latin'] });

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const DESIGN_WIDTH = 1040;
const DESIGN_HEIGHT = 790;
const RAIL_WIDTH = 56;
const VIEWPORT_GUTTER = 36;

function useTerminalScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const availableWidth = window.innerWidth - RAIL_WIDTH - VIEWPORT_GUTTER;
      const availableHeight = window.innerHeight - VIEWPORT_GUTTER;
      setScale(Math.min(1, availableWidth / DESIGN_WIDTH, availableHeight / DESIGN_HEIGHT));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}

function pathFor(values: number[]) {
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - (clamp(value, 0, 100) / 100) * CHART_HEIGHT;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function SideRail({ type }: { type: DemoType }) {
  const copy = CONFIG[type];

  return (
    <aside className={`${mono.className} fixed left-0 top-0 z-30 h-dvh w-14 overflow-hidden border-r border-white/16 bg-black/80 text-[#8d928d]`}>
      <div className="absolute left-1/2 top-7 h-3 w-3 -translate-x-1/2 rounded-full bg-[#00FF94] shadow-[0_0_18px_rgba(0,255,148,0.42)]" />
      <div className="absolute left-1/2 top-[142px] -translate-x-1/2 rotate-90 whitespace-nowrap text-[11px] uppercase tracking-[0.24em]">
        {copy.date}
      </div>
      <div className="absolute left-1/2 top-[292px] h-[34vh] w-px -translate-x-1/2 bg-white/20" />
      {copy.rail ? (
        <div className="absolute bottom-[220px] left-1/2 -translate-x-1/2 rotate-90 whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
          {copy.rail}
        </div>
      ) : null}
      <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 text-[#00FF94]">
        <span className="block h-3 w-3 border-l border-t border-current" />
        <span className="mt-2 block h-3 w-3 border-b border-r border-current opacity-80" />
      </div>
    </aside>
  );
}

function TopMeta({ tierName, searchCount, maxSearches }: { tierName: string; searchCount: number; maxSearches: number }) {
  return (
    <div className={`${mono.className} whitespace-nowrap text-right text-[12px] uppercase tracking-[0.2em] text-[#858a85]`}>
      Tier: <span className="text-[#00FF94]">{tierName}</span>
      <span className="mx-4 text-white/35">|</span>
      Consumed: <span className="text-[#00FF94]">{Math.min(searchCount, maxSearches)}/{maxSearches}</span>
    </div>
  );
}

function SearchForm({
  type,
  query,
  setQuery,
  isSearching,
  onSubmit,
}: {
  type: DemoType;
  query: string;
  setQuery: (value: string) => void;
  isSearching: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const copy = CONFIG[type];

  return (
    <form
      onSubmit={onSubmit}
      className={`flex h-[52px] w-full border border-white/24 bg-black/42 transition duration-200 focus-within:border-white/45 ${
        type === 'stock' ? '' : 'pl-0'
      }`}
    >
      {type === 'stock' ? (
        <div className={`${mono.className} grid h-full w-[48px] shrink-0 place-items-center text-lg text-[#00FF94]`}>
          &gt;
        </div>
      ) : null}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={isSearching}
        placeholder={copy.placeholder}
        className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-[16px] text-white outline-none ring-0 placeholder:text-[#777b77] [box-shadow:none] focus:border-0 focus:outline-none focus:ring-0 focus-visible:!outline-none focus-visible:!ring-0"
      />
      <button
        type="submit"
        disabled={isSearching || !query.trim()}
        aria-label="Run search"
        className="grid h-full w-[58px] shrink-0 place-items-center border-l border-white/18 text-[#00FF94] outline-none ring-0 transition duration-200 hover:bg-[#00FF94]/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 focus-visible:!outline-none focus-visible:!ring-0"
      >
        {type === 'stock' ? <ArrowUpRight size={25} strokeWidth={1.7} /> : <Search size={27} strokeWidth={1.7} />}
      </button>
    </form>
  );
}

function SourceToggle({
  source,
  active,
  disabled,
  onToggle,
}: {
  source: SourceConfig;
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const Icon = source.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`grid h-[52px] w-full grid-cols-[24px_minmax(0,1fr)_34px_42px] items-center gap-3 border px-3 text-left transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 focus-visible:!outline-none ${
        active ? 'border-white/18 bg-black/45 text-white' : 'border-white/10 bg-black/20 text-white/48'
      }`}
    >
      <span className="grid place-items-center">
        <Icon size={20} strokeWidth={1.6} className={active ? 'text-[#00FF94]' : 'text-white/35'} />
      </span>
      <span className={`${mono.className} min-w-0 truncate text-[13px] uppercase tracking-[0.08em]`}>{source.label}</span>
      <span className={`${mono.className} text-center text-[12px] uppercase tracking-[0.12em] ${active ? 'text-[#00FF94]' : 'text-white/32'}`}>
        {active ? 'ON' : 'OFF'}
      </span>
      <span
        className={`relative block h-[22px] w-[42px] rounded-full border transition-colors duration-200 ${
          active
            ? 'border-[#00FF94]/45 bg-[linear-gradient(90deg,rgba(0,255,148,0.05),rgba(0,255,148,0.18))]'
            : 'border-white/16 bg-white/5'
        }`}
      >
        <span
          className={`absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full transition-all duration-200 ${
            active
              ? 'left-[22px] bg-[radial-gradient(circle_at_38%_35%,#dfffee_0%,#6bffbd_34%,#00ff94_76%)] shadow-[0_0_10px_rgba(0,255,148,0.32)]'
              : 'left-[3px] bg-white/28 shadow-none'
          }`}
        />
      </span>
    </button>
  );
}

function SignalChart({
  type,
  model,
  isSearching,
}: {
  type: DemoType;
  model: SignalModel;
  isSearching: boolean;
}) {
  const config = CONFIG[type];
  const path = pathFor(model.chartValues);
  const fillPath = `${path} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
  const probeX = (model.probeIndex / Math.max(model.chartValues.length - 1, 1)) * CHART_WIDTH;
  const probeY = CHART_HEIGHT - (clamp(model.probeValue, 0, 100) / 100) * CHART_HEIGHT;
  const xStops = [70, 250, 425, 585, 730, 850];
  const labelWidth = 126;
  const labelX = clamp(probeX + 78, 0, CHART_WIDTH - labelWidth + 58);
  const labelY = clamp(probeY - 45, 12, CHART_HEIGHT - 50);
  const chartBottom = CHART_HEIGHT + 26;
  const yTicks = [
    { label: '1.00', value: 0 },
    { label: '0.75', value: CHART_HEIGHT * 0.25 },
    { label: '0.50', value: CHART_HEIGHT * 0.5 },
    { label: '0.25', value: CHART_HEIGHT * 0.75 },
    { label: '0.00', value: CHART_HEIGHT },
  ];

  return (
    <div className="relative aspect-[980/316] w-full min-w-0 overflow-hidden">
      <svg viewBox="0 0 980 316" className="block h-full w-full overflow-hidden" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id={`terminal-grid-${type}`} width="135" height="66" patternUnits="userSpaceOnUse">
            <path d="M 135 0 L 0 0 0 66" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1" strokeDasharray="3 5" />
          </pattern>
          <linearGradient id={`terminal-area-${type}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.32" />
            <stop offset="72%" stopColor={ACCENT} stopOpacity="0.07" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
          <filter id={`terminal-glow-${type}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(58 25)">
          <rect width={CHART_WIDTH} height={CHART_HEIGHT} fill={`url(#terminal-grid-${type})`} opacity="0.9" />
          <line x1="0" x2={CHART_WIDTH} y1={CHART_HEIGHT} y2={CHART_HEIGHT} stroke="rgba(255,255,255,0.2)" />
          <path d={fillPath} fill={`url(#terminal-area-${type})`} />
          <path
            d={path}
            fill="none"
            stroke={ACCENT}
            strokeWidth="3"
            filter={`url(#terminal-glow-${type})`}
            strokeLinecap="round"
            className={isSearching ? 'animate-pulse' : ''}
          />
          <line x1={probeX} x2={probeX} y1="0" y2={CHART_HEIGHT} stroke={ACCENT} strokeDasharray="7 7" strokeWidth="1.25" opacity="0.9" />
          <circle cx={probeX} cy={probeY} r="12" fill="black" stroke="rgba(255,255,255,0.82)" strokeWidth="3" />
          <circle cx={probeX} cy={probeY} r="5" fill={ACCENT} />
          <circle cx={CHART_WIDTH} cy={CHART_HEIGHT - (model.confidence / 100) * CHART_HEIGHT} r="5" fill={ACCENT} opacity="0.9" />
          <g className={`${mono.className} text-[13px] uppercase tracking-[0.08em]`}>
            {yTicks.map((tick) => (
              <text key={tick.label} x="-45" y={tick.value + 4} fill="#a8aca8">
                {tick.label}
              </text>
            ))}
            {config.xLabels.map((label, index) => (
              <text key={label} x={xStops[index]} y={chartBottom} fill="#8e938e">
                {label}
              </text>
            ))}
          </g>
        </g>
        <g className={`${mono.className} uppercase`}>
          <rect
            x={labelX}
            y={labelY}
            width={labelWidth}
            height="60"
            fill="rgba(0,0,0,0.82)"
            stroke="rgba(255,255,255,0.22)"
          />
          <text x={labelX + 14} y={labelY + 21} fill="#9da29d" fontSize="12">
            Probe {config.probeLabel}
          </text>
          <text x={labelX + 14} y={labelY + 47} fill={ACCENT} fontSize="22">
            {model.probeRatio}
          </text>
        </g>
      </svg>
      {isSearching ? (
        <div className={`${mono.className} pointer-events-none absolute inset-x-[6%] top-[8%] h-[76%] overflow-hidden`}>
          <div className="h-full w-28 animate-[pulse_1.1s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(0,255,148,0.08),transparent)]" />
        </div>
      ) : null}
    </div>
  );
}

function TerminalSearchPage({
  type,
  query,
  setQuery,
  isSearching,
  onSubmit,
  analysis,
  activeSources,
  onToggleSource,
  tierName,
  searchCount,
  maxSearches,
}: {
  type: DemoType;
  query: string;
  setQuery: (value: string) => void;
  isSearching: boolean;
  onSubmit: (event: React.FormEvent) => void;
  analysis: string | null;
  activeSources: string[];
  onToggleSource: (id: string) => void;
  tierName: string;
  searchCount: number;
  maxSearches: number;
}) {
  const config = CONFIG[type];
  const subject = subjectFor(type, query);
  const scale = useTerminalScale();
  const model = useMemo(
    () => buildSignalModel(type, analysis, isSearching, activeSources),
    [type, analysis, isSearching, activeSources],
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden px-[clamp(18px,3vw,42px)] py-[clamp(16px,2.2vh,28px)]">
      <div className="mx-auto overflow-visible" style={{ width: DESIGN_WIDTH * scale }}>
      <div className="flex w-[1040px] origin-top-left flex-col" style={{ transform: `scale(${scale})` }}>
        <div className="flex items-start justify-between gap-5">
          <Link href="/demo" className={`${mono.className} inline-flex w-fit items-center gap-3 text-[12px] uppercase tracking-[0.12em] text-[#858a85] transition hover:text-white`}>
            <ArrowLeft size={15} /> Back to selection
          </Link>
          <TopMeta tierName={tierName} searchCount={searchCount} maxSearches={maxSearches} />
        </div>

        <section className="mt-[clamp(28px,5vh,48px)] w-full max-w-[760px]">
          <div className={`${mono.className} mb-3 text-[15px] uppercase tracking-[0.1em] text-[#00FF94]`}>// {config.env}</div>
          <h1 className="whitespace-nowrap text-[clamp(42px,5.2vw,62px)] font-light leading-[0.96] tracking-[-0.052em] text-[#f4f4f2]">
            {config.title}
          </h1>
          <div className="mt-5">
            <SearchForm type={type} query={query} setQuery={setQuery} isSearching={isSearching} onSubmit={onSubmit} />
          </div>
        </section>

        <section className="mx-auto mt-[clamp(20px,3.2vh,34px)] w-full max-w-[1040px] border border-white/22 bg-black/45 px-5 py-5 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          <div className="grid h-[154px] grid-cols-[minmax(360px,1.3fr)_minmax(250px,0.85fr)_minmax(260px,0.9fr)] border-b border-white/16 pb-6">
            <div className="grid min-w-0 grid-rows-[22px_62px_18px] border-r border-white/16 pl-5 pr-8 pt-6">
              <div className={`${mono.className} text-[12px] uppercase tracking-[0.2em] text-[#8f948f]`}>
                {type === 'stock' ? 'Ticker' : 'Event'}
              </div>
              <div className={`${type === 'stock' ? 'text-[clamp(46px,6.2vw,62px)] tracking-[0.08em]' : 'text-[clamp(38px,4.55vw,48px)] tracking-[-0.04em]'} flex min-w-0 items-center truncate font-light leading-none text-white`}>
                {subject}
              </div>
              <div className={`${mono.className} truncate text-[12px] uppercase tracking-[0.2em] text-[#8f948f]`}>
                {subjectMeta(type, subject)}
              </div>
            </div>
            <div className="grid min-w-0 grid-rows-[22px_62px_18px] border-r border-white/16 pl-10 pr-8 pt-6">
              <div className={`${mono.className} text-[12px] uppercase tracking-[0.2em] text-[#8f948f]`}>{config.signalLabel}</div>
              <div className={`${mono.className} flex items-center text-[clamp(42px,4.8vw,54px)] leading-none text-[#00FF94]`}>{model.confidence}%</div>
              <div className={`${mono.className} text-[12px] uppercase tracking-[0.16em] text-[#00FF94]`}>{config.signalSubLabel}</div>
            </div>
            <div className="grid min-w-0 grid-rows-[22px_62px_18px] pl-10 pr-5 pt-6">
              <div className={`${mono.className} text-[12px] uppercase tracking-[0.2em] text-[#8f948f]`}>{config.statusLabel}</div>
              <div className={`${mono.className} inline-flex h-[48px] w-fit min-w-[176px] items-center justify-center self-center whitespace-nowrap border border-[#00FF94] px-6 text-[clamp(18px,2vw,21px)] uppercase tracking-[0.08em] text-[#00FF94]`}>
                {model.status}
              </div>
              <div className={`${mono.className} truncate text-[11px] uppercase tracking-[0.16em] text-[#8f948f]`}>{model.secondaryStatus}</div>
            </div>
          </div>

          <div className="grid min-h-0 grid-cols-[clamp(260px,25vw,280px)_minmax(0,1fr)] gap-6 pt-5">
            <aside>
              <div className={`${mono.className} mb-3 text-[12px] uppercase tracking-[0.15em] text-[#9ca19c]`}>Sources</div>
              <div className="space-y-2.5">
                {config.sources.map((source) => (
                  <SourceToggle
                    key={source.id}
                    source={source}
                    active={activeSources.includes(source.id)}
                    disabled={activeSources.length === 1 && activeSources.includes(source.id)}
                    onToggle={() => onToggleSource(source.id)}
                  />
                ))}
              </div>
              <div className={`${mono.className} mt-6 text-[12px] uppercase tracking-[0.2em] text-[#9ca19c]`}>
                {activeSources.length} / {config.sources.length} Active
              </div>
            </aside>
            <SignalChart type={type} model={model} isSearching={isSearching} />
          </div>
        </section>

        <div className={`${mono.className} pt-[clamp(18px,2.4vh,30px)] text-center text-[11px] uppercase tracking-[0.24em] text-[#7d827d]`}>
          Past performance is not indicative of future results. Intelligence is probabilistic.
        </div>
      </div>
      </div>
    </main>
  );
}

export function DemoTerminalPage({ type }: { type: DemoType }) {
  const config = CONFIG[type];
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeSources, setActiveSources] = useState(() => config.sources.map((source) => source.id));
  const { searchCount, maxSearches, tierName, incrementSearch, isInitialized } = useSearchLimit();

  const toggleSource = (id: string) => {
    setActiveSources((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((sourceId) => sourceId !== id);
      }
      return [...current, id];
    });
  };

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const topic = query.trim();
    if (!topic || !isInitialized) return;

    if (searchCount >= maxSearches) {
      setShowOverlay(true);
      return;
    }

    setIsSearching(true);
    setAnalysis(null);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ topic, type }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}: Failed to reach PolyHedge Intelligence`);

      setAnalysis(data.analysis);
      if (posthogKey) {
        posthog.capture(type === 'stock' ? 'stock_search_performed' : 'prediction_search_performed', {
          query: topic,
          tier: tierName,
          searches_used: searchCount + 1,
        });
      }
      void incrementSearch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown network error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${geist.className} h-dvh overflow-hidden bg-[#020403] text-white [&_a:focus-visible]:!outline-none [&_button:focus-visible]:!outline-none [&_input:focus-visible]:!outline-none`}>
      <style>{`
        button[aria-label="Open Next.js Dev Tools"] {
          display: none !important;
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 opacity-[0.075] [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_46%_24%,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_76%_58%,rgba(0,255,148,0.035),transparent_34%)]" />
      <SideRail type={type} />
      <div className="relative ml-14 h-dvh w-[calc(100vw-3.5rem)]">
        <TerminalSearchPage
          type={type}
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
          onSubmit={runSearch}
          analysis={analysis}
          activeSources={activeSources}
          onToggleSource={toggleSource}
          tierName={tierName}
          searchCount={searchCount}
          maxSearches={maxSearches}
        />
      </div>

      {error ? (
        <div className={`${mono.className} fixed bottom-6 left-1/2 z-50 max-w-xl -translate-x-1/2 border border-red-500 bg-black px-5 py-3 text-[12px] text-red-300`}>
          {error}
        </div>
      ) : null}
      <SearchLimitOverlay isVisible={showOverlay} />
    </div>
  );
}
