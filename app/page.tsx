'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { useEmailSignup } from '@/lib/hooks/useEmailSignup';

// ============================================================================
// FONTS
// ============================================================================

const geist = Geist({ subsets: ['latin'] });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] });

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  bg: '#0A0A0A',
  surface: '#0E0E0E',
  hairline: '#1A1A1A',
  hairlineDim: '#141414',
  hairlineBright: '#262626',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1A1',
  textMuted: '#525252',
  textFaint: '#333333',
  accent: '#00FF94',
};

// ============================================================================
// TYPES
// ============================================================================

interface StatCardProps {
  index: string;
  value: string;
  headline: string;
  description: string;
}

interface PillarCardProps {
  number: string;
  title: string;
  description: string;
}

// ============================================================================
// SHARED: LIVE STATUS DOT
// ============================================================================

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ backgroundColor: COLORS.accent }}
      />
      <span
        className="relative inline-flex h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: COLORS.accent }}
      />
    </span>
  );
}

// ============================================================================
// SHARED: SECTION LABEL (e.g. "01 / 06 ─ THE PROBLEM")
// ============================================================================

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div
      className={`${mono.className} flex items-center gap-4 mb-12 text-[11px] uppercase tracking-[0.24em]`}
      style={{ color: COLORS.textMuted }}
    >
      <span>{index}</span>
      <span
        className="h-px w-12"
        style={{ backgroundColor: COLORS.hairlineBright }}
      />
      <span style={{ color: COLORS.textSecondary }}>{title}</span>
    </div>
  );
}

// ============================================================================
// SHARED: CORNER BRACKETS (on hover)
// ============================================================================

function CornerBrackets() {
  const style = { borderColor: COLORS.accent };
  return (
    <>
      <span
        className="absolute top-0 left-0 h-2 w-2 border-t border-l opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={style}
      />
      <span
        className="absolute top-0 right-0 h-2 w-2 border-t border-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={style}
      />
      <span
        className="absolute bottom-0 left-0 h-2 w-2 border-b border-l opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={style}
      />
      <span
        className="absolute bottom-0 right-0 h-2 w-2 border-b border-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={style}
      />
    </>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

function TestimonialsCarousel() {
  const testimonials = [
    { name: 'Jordan Pierce', role: 'Prediction Market Trader', quote: 'PolyHedge gave us the infrastructure we needed. Real-time signals we can actually trust.', initials: 'JP' },
    { name: 'Alex Chen', role: 'Algorithmic Trader', quote: 'The three-pillar approach is unmatched. We went from blind to informed overnight.', initials: 'AC' },
    { name: 'Sam Khalil', role: 'Hedge Fund Manager', quote: 'Alternative data done right. This is how traders move markets.', initials: 'SK' },
    { name: 'Morgan Hayes', role: 'Prop Trader', quote: 'The accuracy compounds with every prediction. We saw edge in week one.', initials: 'MH' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const current = testimonials[currentIndex];

  return (
    <div
      className="relative border p-10 md:p-14"
      style={{ borderColor: COLORS.hairline }}
    >
      <div
        className={`${mono.className} absolute top-4 left-4 text-[10px] uppercase tracking-[0.24em]`}
        style={{ color: COLORS.textFaint }}
      >
        / TESTIMONIAL·{String(currentIndex + 1).padStart(2, '0')}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <p
            className="text-2xl md:text-3xl font-light leading-[1.35] tracking-tight mb-10"
            style={{ color: COLORS.textPrimary }}
          >
            &ldquo;{current.quote}&rdquo;
          </p>

          <div
            className="flex items-center gap-4 pt-6 border-t"
            style={{ borderColor: COLORS.hairline }}
          >
            <div
              className={`${mono.className} flex h-10 w-10 items-center justify-center border text-xs`}
              style={{
                borderColor: COLORS.hairlineBright,
                color: COLORS.textPrimary,
              }}
            >
              {current.initials}
            </div>
            <div>
              <div className="text-sm" style={{ color: COLORS.textPrimary }}>
                {current.name}
              </div>
              <div
                className={`${mono.className} text-[11px] uppercase tracking-[0.18em] mt-0.5`}
                style={{ color: COLORS.textMuted }}
              >
                {current.role}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination lines */}
      <div className="flex gap-2 mt-10">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="h-px w-12 transition-colors"
            style={{
              backgroundColor:
                i === currentIndex ? COLORS.accent : COLORS.hairlineBright,
            }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

function LoadingOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="flex flex-col items-center">
        <div
          className={`${mono.className} mb-6 text-[10px] uppercase tracking-[0.4em]`}
          style={{ color: COLORS.textMuted }}
        >
          Initializing
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold tracking-tight mb-8"
          style={{ color: COLORS.textPrimary }}
        >
          PolyHedge
          <span style={{ color: COLORS.accent }}>.</span>
        </motion.div>
        <div
          className="relative h-px w-56 overflow-hidden"
          style={{ backgroundColor: COLORS.hairline }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ backgroundColor: COLORS.accent }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STAT CARD (hairline grid style)
// ============================================================================

function StatCard({ index, value, headline, description }: StatCardProps) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="border-t pt-8"
      style={{ borderColor: COLORS.hairline }}
    >
      <div
        className={`${mono.className} text-[11px] uppercase tracking-[0.24em] mb-6`}
        style={{ color: COLORS.textMuted }}
      >
        / {index}
      </div>
      <div
        className="text-5xl md:text-6xl font-semibold tracking-tight mb-5"
        style={{ color: COLORS.accent }}
      >
        {value}
      </div>
      <div
        className="text-base font-medium mb-2"
        style={{ color: COLORS.textPrimary }}
      >
        {headline}
      </div>
      <p
        className="text-sm leading-relaxed max-w-sm"
        style={{ color: COLORS.textSecondary }}
      >
        {description}
      </p>
    </motion.div>
  );
}

// ============================================================================
// PILLAR CARD
// ============================================================================

function PillarCard({ number, title, description }: PillarCardProps) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative border p-8 transition-colors duration-300"
      style={{ borderColor: COLORS.hairline, backgroundColor: COLORS.surface }}
    >
      <CornerBrackets />

      <div
        className={`${mono.className} text-[11px] uppercase tracking-[0.24em] mb-8`}
        style={{ color: COLORS.textMuted }}
      >
        / {number}
      </div>
      <h3
        className="text-lg font-semibold tracking-tight mb-4"
        style={{ color: COLORS.textPrimary }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: COLORS.textSecondary }}
      >
        {description}
      </p>
    </motion.div>
  );
}

// ============================================================================
// SIGNAL BAR
// ============================================================================

function SignalBar({ strength }: { strength: number }) {
  return (
    <div
      className="relative h-px w-full overflow-hidden"
      style={{ backgroundColor: COLORS.hairline }}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${strength * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        className="absolute inset-y-0 left-0"
        style={{ backgroundColor: COLORS.accent }}
      />
    </div>
  );
}

// ============================================================================
// WAITLIST FORM
// ============================================================================

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const { signup, loading, error, success } = useEmailSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup(email);
    if (result) setEmail('');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch border"
        style={{
          borderColor: error ? '#5F2121' : COLORS.hairlineBright,
        }}
      >
        <div
          className={`${mono.className} hidden md:flex items-center px-4 text-xs`}
          style={{
            color: COLORS.textMuted,
            borderRight: `1px solid ${COLORS.hairline}`,
          }}
        >
          &gt; EMAIL
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className={`${geist.className} flex-1 px-4 py-4 text-sm bg-transparent focus:outline-none disabled:opacity-50`}
          style={{ color: COLORS.textPrimary }}
        />
        <button
          type="submit"
          disabled={loading}
          className={`${mono.className} px-6 text-xs uppercase tracking-[0.18em] font-medium transition-colors disabled:opacity-50 flex items-center gap-2`}
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.bg,
          }}
        >
          {loading ? 'Sending' : 'Join waitlist'}
          {!loading && <ArrowRight size={14} strokeWidth={2.5} />}
        </button>
      </form>
      <div
        className={`${mono.className} mt-4 text-[11px] uppercase tracking-[0.2em] min-h-[14px]`}
      >
        {error && <span style={{ color: '#FF8080' }}>/ ERROR · {error}</span>}
        {success && (
          <span style={{ color: COLORS.accent }}>
            / CONFIRMED · You&apos;re on the list
          </span>
        )}
        {!error && !success && (
          <span style={{ color: COLORS.textFaint }}>
            / NO SPAM · UNSUBSCRIBE ANYTIME
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TICKER BAR
// ============================================================================

function TickerBar() {
  const segments = [
    ['NYSE:AAPL', '0.847'],
    ['FED·HOLD', '0.732'],
    ['FDA·APPROVAL', '0.614'],
    ['SCOTUS·Q2', '0.589'],
    ['FEEDS·ACTIVE', '847'],
    ['COVERAGE', 'NYSE / ALL ≥ $1B'],
  ];

  const Row = () => (
    <div className="flex items-center gap-10 px-6">
      {segments.map(([label, value], i) => (
        <span key={i} className="flex items-center gap-2">
          <span
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: COLORS.accent }}
          />
          <span style={{ color: COLORS.textMuted }}>{label}</span>
          <span style={{ color: COLORS.textSecondary }}>{value}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`${mono.className} fixed top-0 left-0 right-0 z-40 w-full overflow-hidden border-b`}
      style={{
        backgroundColor: COLORS.bg,
        borderColor: COLORS.hairline,
      }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: marquee 60s linear infinite;
          white-space: nowrap;
          display: inline-flex;
        }
      `}</style>
      <div
        className="py-1.5 text-[10px] uppercase tracking-[0.18em]"
        style={{ color: COLORS.textMuted }}
      >
        <div className="ticker-track">
          <Row />
          <Row />
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NAVBAR
// ============================================================================

function Navbar({ activeSection }: { activeSection: string }) {
  const items = [
    { id: 'features', label: 'Features' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'demo', label: 'Demo' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'pricing', label: 'Access' },
  ];

  return (
    <nav
      className="fixed top-7 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-10 py-4 border-b backdrop-blur"
      style={{
        backgroundColor: 'rgba(10,10,10,0.72)',
        borderColor: COLORS.hairline,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-1.5 w-1.5"
          style={{ backgroundColor: COLORS.accent }}
        />
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: COLORS.textPrimary }}
        >
          PolyHedge
        </span>
        <span
          className={`${mono.className} hidden md:inline text-[10px] uppercase tracking-[0.24em] ml-2`}
          style={{ color: COLORS.textFaint }}
        >
          / v0.1
        </span>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {items.map((item) => {
          const active = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`${mono.className} hidden md:flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors`}
              style={{
                color: active ? COLORS.textPrimary : COLORS.textMuted,
              }}
            >
              {active && (
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: COLORS.accent }}
                />
              )}
              {item.label}
            </a>
          );
        })}
        <a
          href="/auth?intent=demo"
          className={`${mono.className} ml-2 md:ml-4 flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-medium transition-transform hover:-translate-y-0.5`}
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.bg,
          }}
        >
          Access demo
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </a>
      </div>
    </nav>
  );
}

// ============================================================================
// TERMINAL DASHBOARD (hero-adjacent live readout)
// ============================================================================

function TerminalDashboard() {
  const rows = [
    { ticker: 'AAPL·EARNINGS', category: 'EQUITY', value: '0.847', strength: 0.84 },
    { ticker: 'FED·RATE·HOLD', category: 'MACRO', value: '0.732', strength: 0.73 },
    { ticker: 'FDA·APPROVAL', category: 'REGULATORY', value: '0.614', strength: 0.61 },
    { ticker: 'SCOTUS·Q2', category: 'LEGAL', value: '0.589', strength: 0.58 },
  ];

  return (
    <div
      className="relative border"
      style={{
        borderColor: COLORS.hairline,
        backgroundColor: COLORS.surface,
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: COLORS.hairline }}
      >
        <div
          className={`${mono.className} flex items-center gap-3 text-[11px] uppercase tracking-[0.24em]`}
          style={{ color: COLORS.textMuted }}
        >
          <LiveDot />
          <span>TERMINAL · LIVE</span>
        </div>
        <div
          className={`${mono.className} text-[10px] uppercase tracking-[0.24em]`}
          style={{ color: COLORS.textFaint }}
        >
          847 FEEDS · NYSE
        </div>
      </div>

      {/* Table header */}
      <div
        className={`${mono.className} grid grid-cols-12 gap-4 px-6 py-3 border-b text-[10px] uppercase tracking-[0.24em]`}
        style={{
          borderColor: COLORS.hairline,
          color: COLORS.textFaint,
        }}
      >
        <div className="col-span-5">Signal</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-2">Value</div>
        <div className="col-span-2 text-right">Strength</div>
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, i) => (
          <div
            key={row.ticker}
            className={`${mono.className} grid grid-cols-12 gap-4 items-center px-6 py-4 text-sm border-b`}
            style={{
              borderColor:
                i === rows.length - 1 ? 'transparent' : COLORS.hairlineDim,
              color: COLORS.textSecondary,
            }}
          >
            <div className="col-span-5" style={{ color: COLORS.textPrimary }}>
              {row.ticker}
            </div>
            <div
              className="col-span-3 text-[11px] uppercase tracking-[0.18em]"
              style={{ color: COLORS.textMuted }}
            >
              {row.category}
            </div>
            <div
              className="col-span-2 font-medium"
              style={{ color: COLORS.accent }}
            >
              {row.value}
            </div>
            <div className="col-span-2">
              <SignalBar strength={row.strength} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer chips */}
      <div
        className="flex flex-wrap gap-2 px-6 py-4 border-t"
        style={{ borderColor: COLORS.hairline }}
      >
        {['WEB AGENTS', 'MIROFISH', 'MASS OUTREACH', '847 FEEDS'].map((tag) => (
          <span
            key={tag}
            className={`${mono.className} text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border`}
            style={{
              borderColor: COLORS.hairline,
              color: COLORS.textMuted,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SIGNAL COMPOSER (interactive demo widget)
// ============================================================================

const COMPOSER_N = 60;

type PillarKey = 'p1' | 'p2' | 'p3';

function buildCurve(type: PillarKey, seed: number) {
  // Deterministic per-event pillar contribution curves (range ~0 → ~0.35)
  return Array.from({ length: COMPOSER_N }, (_, i) => {
    const t = i / (COMPOSER_N - 1);
    if (type === 'p1') {
      // Web agents: stable baseline, slight noise
      return 0.26 + 0.08 * Math.sin(t * 4 + seed) + 0.04 * Math.sin(t * 11 + seed * 2.3);
    }
    if (type === 'p2') {
      // MiroFish: sigmoid-like rise, simulation converges
      return (
        0.04 +
        0.30 * (1 - Math.exp(-t * 2.6)) +
        0.025 * Math.sin(t * 9 + seed * 1.7)
      );
    }
    // Outreach: late-arriving ground-truth boost
    const onset = 0.45;
    return t > onset
      ? 0.22 * ((t - onset) / (1 - onset)) + 0.015 * Math.sin(t * 14)
      : 0;
  });
}

function SignalComposer() {
  const events = [
    { id: 'AAPL·Q2·EARNINGS', category: 'Equity', seed: 0.1 },
    { id: 'FED·RATE·HOLD·DEC', category: 'Macro', seed: 0.9 },
    { id: 'FDA·APPROVAL·QTR4', category: 'Regulatory', seed: 1.6 },
    { id: 'SCOTUS·RULING·Q2', category: 'Legal', seed: 2.4 },
  ];

  const [eventIdx, setEventIdx] = useState(0);
  const [pillars, setPillars] = useState({ p1: true, p2: true, p3: true });
  const [probe, setProbe] = useState(0.72);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const seed = events[eventIdx].seed;
  const p1 = useMemo(() => buildCurve('p1', seed), [seed]);
  const p2 = useMemo(() => buildCurve('p2', seed), [seed]);
  const p3 = useMemo(() => buildCurve('p3', seed), [seed]);

  const combined = useMemo(
    () =>
      Array.from({ length: COMPOSER_N }, (_, i) => {
        let s = 0;
        if (pillars.p1) s += p1[i];
        if (pillars.p2) s += p2[i];
        if (pillars.p3) s += p3[i];
        return Math.min(s, 0.98);
      }),
    [p1, p2, p3, pillars],
  );

  const activeCount = [pillars.p1, pillars.p2, pillars.p3].filter(Boolean).length;
  const finalAccuracy = combined[COMPOSER_N - 1];
  const probeIdx = Math.max(
    0,
    Math.min(COMPOSER_N - 1, Math.round(probe * (COMPOSER_N - 1))),
  );
  const probeValue = combined[probeIdx];
  const probeDaysOut = Math.round((1 - probe) * 60);

  // Build SVG paths
  const VB_W = 1000;
  const VB_H = 300;
  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 24;
  const PAD_B = 32;
  const plotW = VB_W - PAD_L - PAD_R;
  const plotH = VB_H - PAD_T - PAD_B;

  const pathFromArray = (arr: number[]) => {
    const xStep = plotW / (COMPOSER_N - 1);
    return arr
      .map((v, i) => {
        const x = PAD_L + i * xStep;
        const y = PAD_T + (1 - v) * plotH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const combinedPath = useMemo(() => pathFromArray(combined), [combined]);
  const p1Path = useMemo(() => pathFromArray(p1), [p1]);
  const p2Path = useMemo(() => pathFromArray(p2), [p2]);
  const p3Path = useMemo(() => pathFromArray(p3), [p3]);

  const probeX = PAD_L + probe * plotW;
  const probeY = PAD_T + (1 - probeValue) * plotH;

  const updateProbe = (clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRatio = (clientX - rect.left) / rect.width;
    const chartStart = PAD_L / VB_W;
    const chartEnd = (VB_W - PAD_R) / VB_W;
    const normalized = (xRatio - chartStart) / (chartEnd - chartStart);
    setProbe(Math.max(0, Math.min(1, normalized)));
  };

  const pillarDefs: { key: PillarKey; label: string; sublabel: string }[] = [
    { key: 'p1', label: 'P·01  Web Agents', sublabel: 'Real-time scrape' },
    { key: 'p2', label: 'P·02  MiroFish', sublabel: 'Swarm simulation' },
    { key: 'p3', label: 'P·03  Outreach', sublabel: 'Ground-truth channel' },
  ];

  return (
    <div
      className="relative border select-none"
      style={{
        borderColor: COLORS.hairline,
        backgroundColor: COLORS.surface,
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: COLORS.hairline }}
      >
        <div
          className={`${mono.className} flex items-center gap-3 text-[11px] uppercase tracking-[0.24em]`}
          style={{ color: COLORS.textMuted }}
        >
          <LiveDot />
          <span>Signal Composer · Interactive</span>
        </div>
        <div
          className={`${mono.className} text-[10px] uppercase tracking-[0.24em]`}
          style={{ color: COLORS.textFaint }}
        >
          {activeCount} / 3 Pillars Active
        </div>
      </div>

      {/* Event selector tabs */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b"
        style={{ borderColor: COLORS.hairline }}
      >
        {events.map((ev, i) => {
          const active = i === eventIdx;
          return (
            <button
              key={ev.id}
              onClick={() => setEventIdx(i)}
              className={`${mono.className} text-left px-5 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors border-r`}
              style={{
                borderColor: COLORS.hairline,
                color: active ? COLORS.textPrimary : COLORS.textMuted,
                backgroundColor: active
                  ? 'rgba(0,255,148,0.04)'
                  : 'transparent',
              }}
            >
              <span
                className="block mb-1"
                style={{ color: active ? COLORS.accent : COLORS.textFaint }}
              >
                / {ev.category}
              </span>
              <span>{ev.id}</span>
            </button>
          );
        })}
      </div>

      {/* Readouts */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 border-b"
        style={{ borderColor: COLORS.hairline }}
      >
        <div
          className="p-6 border-r"
          style={{ borderColor: COLORS.hairline }}
        >
          <div
            className={`${mono.className} text-[10px] uppercase tracking-[0.24em] mb-3`}
            style={{ color: COLORS.textFaint }}
          >
            / Probe · T−{probeDaysOut}d
          </div>
          <div
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: COLORS.accent }}
          >
            {probeValue.toFixed(3)}
          </div>
        </div>
        <div
          className="p-6 border-r"
          style={{ borderColor: COLORS.hairline }}
        >
          <div
            className={`${mono.className} text-[10px] uppercase tracking-[0.24em] mb-3`}
            style={{ color: COLORS.textFaint }}
          >
            / Final confidence
          </div>
          <div
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: COLORS.textPrimary }}
          >
            {finalAccuracy.toFixed(3)}
          </div>
        </div>
        <div className="p-6 col-span-2 md:col-span-1">
          <div
            className={`${mono.className} text-[10px] uppercase tracking-[0.24em] mb-3`}
            style={{ color: COLORS.textFaint }}
          >
            / Instruction
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{ color: COLORS.textSecondary }}
          >
            Drag the crosshair. Toggle pillars. Watch the signal recompose.
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pt-6 pb-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto cursor-crosshair touch-none"
          onPointerDown={(e) => {
            setIsDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            updateProbe(e.clientX);
          }}
          onPointerMove={(e) => {
            if (isDragging) updateProbe(e.clientX);
          }}
          onPointerUp={(e) => {
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => setIsDragging(false)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((y) => {
            const yPos = PAD_T + (1 - y) * plotH;
            return (
              <g key={y}>
                <line
                  x1={PAD_L}
                  x2={VB_W - PAD_R}
                  y1={yPos}
                  y2={yPos}
                  stroke={COLORS.hairlineDim}
                  strokeDasharray="2 4"
                />
                <text
                  x={PAD_L - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  className={mono.className}
                  fontSize="9"
                  fill={COLORS.textFaint}
                  style={{ letterSpacing: '0.08em' }}
                >
                  {y.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((x) => {
            const xPos = PAD_L + x * plotW;
            const days = Math.round((1 - x) * 60);
            return (
              <text
                key={x}
                x={xPos}
                y={VB_H - PAD_B + 18}
                textAnchor="middle"
                className={mono.className}
                fontSize="9"
                fill={COLORS.textFaint}
                style={{ letterSpacing: '0.08em' }}
              >
                T−{days}d
              </text>
            );
          })}

          {/* Individual pillar lines (faded, only when active) */}
          {pillars.p1 && (
            <path
              d={p1Path}
              fill="none"
              stroke={COLORS.textMuted}
              strokeWidth={1}
              strokeOpacity={0.45}
              strokeDasharray="3 3"
            />
          )}
          {pillars.p2 && (
            <path
              d={p2Path}
              fill="none"
              stroke={COLORS.textMuted}
              strokeWidth={1}
              strokeOpacity={0.45}
              strokeDasharray="3 3"
            />
          )}
          {pillars.p3 && (
            <path
              d={p3Path}
              fill="none"
              stroke={COLORS.textMuted}
              strokeWidth={1}
              strokeOpacity={0.45}
              strokeDasharray="3 3"
            />
          )}

          {/* Area under combined */}
          <motion.path
            key={`area-${eventIdx}-${pillars.p1}-${pillars.p2}-${pillars.p3}`}
            d={`${combinedPath} L ${VB_W - PAD_R} ${VB_H - PAD_B} L ${PAD_L} ${VB_H - PAD_B} Z`}
            fill={COLORS.accent}
            fillOpacity={0.08}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Combined signal line */}
          <motion.path
            key={`combined-${eventIdx}-${pillars.p1}-${pillars.p2}-${pillars.p3}`}
            d={combinedPath}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={1.75}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />

          {/* Probe vertical line */}
          <line
            x1={probeX}
            x2={probeX}
            y1={PAD_T}
            y2={VB_H - PAD_B}
            stroke={COLORS.accent}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />

          {/* Probe dot */}
          <circle
            cx={probeX}
            cy={probeY}
            r={5}
            fill={COLORS.bg}
            stroke={COLORS.accent}
            strokeWidth={1.5}
          />

          {/* Chart border */}
          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill="none"
            stroke={COLORS.hairline}
          />
        </svg>

        {/* Chart legend */}
        <div
          className={`${mono.className} mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.22em]`}
          style={{ color: COLORS.textMuted }}
        >
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-px w-6"
              style={{ backgroundColor: COLORS.accent }}
            />
            Combined
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-px w-6 opacity-50"
              style={{
                backgroundImage: `linear-gradient(to right, ${COLORS.textMuted} 50%, transparent 0%)`,
                backgroundSize: '6px 1px',
                backgroundRepeat: 'repeat-x',
              }}
            />
            Per-pillar contribution
          </span>
        </div>
      </div>

      {/* Pillar toggles */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 border-t"
        style={{ borderColor: COLORS.hairline }}
      >
        {pillarDefs.map((p, i) => {
          const on = pillars[p.key];
          const last = i === pillarDefs.length - 1;
          return (
            <button
              key={p.key}
              onClick={() =>
                setPillars({ ...pillars, [p.key]: !pillars[p.key] })
              }
              className={`${mono.className} group flex items-center justify-between px-6 py-5 text-left text-[11px] uppercase tracking-[0.18em] transition-colors`}
              style={{
                borderRight: !last ? `1px solid ${COLORS.hairline}` : 'none',
                color: on ? COLORS.textPrimary : COLORS.textMuted,
                backgroundColor: on ? 'rgba(0,255,148,0.03)' : 'transparent',
              }}
            >
              <span className="flex items-center gap-4">
                <span
                  className="relative flex h-4 w-7 items-center transition-colors"
                  style={{
                    backgroundColor: on ? COLORS.accent : COLORS.hairlineBright,
                  }}
                >
                  <motion.span
                    animate={{ x: on ? 14 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute h-3 w-3"
                    style={{
                      backgroundColor: on ? COLORS.bg : COLORS.textMuted,
                    }}
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span>{p.label}</span>
                  <span
                    className="text-[9px] normal-case tracking-[0.12em]"
                    style={{ color: COLORS.textFaint }}
                  >
                    {p.sublabel}
                  </span>
                </span>
              </span>
              <span
                style={{
                  color: on ? COLORS.accent : COLORS.textFaint,
                }}
              >
                {on ? 'ON' : 'OFF'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Page() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  return (
    <>
      <style>{`
        html, body {
          background-color: ${COLORS.bg};
          scroll-behavior: smooth;
        }

        /* Subtle grid texture */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 1;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
        }
      `}</style>

      <div className={geist.className}>
        <AnimatePresence>
          {!loadingComplete && (
            <LoadingOverlay onComplete={() => setLoadingComplete(true)} />
          )}
        </AnimatePresence>

        <TickerBar />
        <Navbar activeSection={activeSection} />

        {/* =================================================================
            HERO
            ================================================================= */}
        <section
          id="hero"
          className="relative w-full min-h-screen flex items-center overflow-hidden pt-40 pb-24"
          style={{ backgroundColor: COLORS.bg }}
        >
          <DottedSurface />

          {/* fade to background so dots don't fight the type */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 70%, rgba(10,10,10,1) 100%)',
            }}
          />

          <motion.div
            className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Live status line */}
            <div
              className={`${mono.className} flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] mb-10`}
              style={{ color: COLORS.textMuted }}
            >
              <LiveDot />
              <span>System operational</span>
              <span style={{ color: COLORS.textFaint }}>/</span>
              <span>847 data feeds active</span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-[-0.02em] leading-[1.02] max-w-5xl"
              style={{ color: COLORS.textPrimary }}
            >
              The data infrastructure{' '}
              <span style={{ color: COLORS.textMuted }}>
                traders have been waiting for.
              </span>
            </h1>

            <p
              className="mt-8 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: COLORS.textSecondary }}
            >
              Proprietary alternative data. Three collection pillars. One
              unified intelligence platform.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center gap-3">
              <a
                href="/auth?intent=demo"
                className={`${mono.className} group flex items-center gap-3 px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-transform hover:-translate-y-0.5`}
                style={{
                  backgroundColor: COLORS.accent,
                  color: COLORS.bg,
                }}
              >
                Access demo
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </a>
              <a
                href="/auth?intent=pricing"
                className={`${mono.className} group flex items-center gap-3 px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium border transition-colors`}
                style={{
                  borderColor: COLORS.hairlineBright,
                  color: COLORS.textPrimary,
                }}
              >
                Get started
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>

            {/* Micro stats row */}
            <div
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-8 max-w-4xl"
              style={{ borderColor: COLORS.hairline }}
            >
              {[
                ['Coverage', 'NYSE · ≥$1B'],
                ['Feeds', '847 · Live'],
                ['Pillars', '3 · Proprietary'],
                ['Competitors', '0'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div
                    className={`${mono.className} text-[10px] uppercase tracking-[0.24em] mb-2`}
                    style={{ color: COLORS.textFaint }}
                  >
                    / {label}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* =================================================================
            THE PROBLEM
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="features"
        >
          <motion.div
            className="max-w-5xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="01 / 07" title="The Problem" />

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-16 max-w-4xl"
              style={{ color: COLORS.textPrimary }}
            >
              Institutional traders have Bloomberg.
              <br />
              <span style={{ color: COLORS.textMuted }}>
                Everyone else has nothing.
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
              <p
                className="text-base leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                Professional equities traders with Bloomberg terminals enjoy
                real-time market data, news flows, and alternative data
                integrations — hundreds of vendors, dozens of alt-data shops,
                the full edge. Prediction market traders and day traders have
                little to no equivalent infrastructure.
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                This is the gap PolyHedge fills. We&apos;re building the
                Bloomberg equivalent for prediction markets and day traders.
                Our subscription data provides traders with an edge over the
                rest of the market.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =================================================================
            THE PLATFORM
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="platform"
        >
          <motion.div
            className="max-w-6xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="02 / 07" title="The Platform" />

            <div className="grid md:grid-cols-12 gap-12 mb-16 items-end">
              <h2
                className="md:col-span-7 text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05]"
                style={{ color: COLORS.textPrimary }}
              >
                One platform.
                <br />
                <span style={{ color: COLORS.textMuted }}>Every signal.</span>
              </h2>
              <p
                className="md:col-span-5 text-base leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                Real-time signal synthesis from proprietary alternative data.
                Full NYSE coverage plus emerging prediction market categories,
                surfaced through a terminal-style UI built for traders.
              </p>
            </div>

            <TerminalDashboard />
          </motion.div>
        </section>

        {/* =================================================================
            DATA ARCHITECTURE
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="architecture"
        >
          <motion.div
            className="max-w-6xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="03 / 07" title="Data Architecture" />

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-20 max-w-4xl"
              style={{ color: COLORS.textPrimary }}
            >
              Three pillars.
              <br />
              <span style={{ color: COLORS.textMuted }}>Zero overlap.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PillarCard
                number="P·01 — Web Agents"
                title="Autonomous web agents"
                description="Autonomous AI agents continuously monitor the internet in real time — regulatory filings, government databases, court records, academic publications, financial media, social sentiment, and job postings. Every relevant data point captured and structured the moment it becomes available."
              />
              <PillarCard
                number="P·02 — MiroFish"
                title="Swarm intelligence"
                description="MiroFish is an open-source AI prediction engine that creates digital parallels of real-world events, simulating how they unfold across multiple scenarios. Outcomes are stress-tested via collective intelligence to produce continuously updated probability-weighted outputs."
              />
              <PillarCard
                number="P·03 — Outreach"
                title="Proprietary mass outreach"
                description="A homegrown platform that systematically contacts industry specialists, supply chain participants, and domain experts at scale — capturing ground-level intelligence no scraper can access. The institutional-grade automated version of hedge fund channel checks."
              />
            </div>
          </motion.div>
        </section>

        {/* =================================================================
            LIVE DEMO · SIGNAL COMPOSER (Interactive)
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="demo"
        >
          <motion.div
            className="max-w-6xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="04 / 07" title="Live Demo" />

            <div className="grid md:grid-cols-12 gap-12 mb-16 items-end">
              <h2
                className="md:col-span-7 text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05]"
                style={{ color: COLORS.textPrimary }}
              >
                Compose a signal.
                <br />
                <span style={{ color: COLORS.textMuted }}>
                  Watch the edge emerge.
                </span>
              </h2>
              <p
                className="md:col-span-5 text-base leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                Pick an event. Toggle which of our three pillars contribute.
                Scrub the timeline to probe the signal at any point leading up
                to the event. This is a live sample of how our subscribers
                interact with the terminal.
              </p>
            </div>

            <SignalComposer />
          </motion.div>
        </section>

        {/* =================================================================
            COVERAGE
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative overflow-hidden z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="coverage"
        >
          <motion.div
            className="max-w-6xl mx-auto relative"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="05 / 07" title="Coverage" />

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-20 max-w-4xl"
              style={{ color: COLORS.textPrimary }}
            >
              What we cover.
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 border-t border-l"
              style={{ borderColor: COLORS.hairline }}
            >
              <div
                className="p-10 border-b border-r"
                style={{ borderColor: COLORS.hairline }}
              >
                <div
                  className={`${mono.className} text-[11px] uppercase tracking-[0.24em] mb-8`}
                  style={{ color: COLORS.accent }}
                >
                  / Equities
                </div>
                <h3
                  className="text-2xl font-semibold tracking-tight mb-6"
                  style={{ color: COLORS.textPrimary }}
                >
                  Stock markets
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.textSecondary }}
                >
                  Full NYSE coverage with signals mapped to earnings surprises,
                  corporate events, supply chain shifts, regulatory actions,
                  and executive movements. Real-time ingestion of institutional
                  filings, SEC releases, media sentiment, and insider trading
                  activity. Every public equity market above $1B market cap.
                </p>
              </div>
              <div
                className="p-10 border-b border-r"
                style={{ borderColor: COLORS.hairline }}
              >
                <div
                  className={`${mono.className} text-[11px] uppercase tracking-[0.24em] mb-8`}
                  style={{ color: COLORS.accent }}
                >
                  / Prediction
                </div>
                <h3
                  className="text-2xl font-semibold tracking-tight mb-6"
                  style={{ color: COLORS.textPrimary }}
                >
                  Prediction markets
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.textSecondary }}
                >
                  Niche objective non-manipulable market categories currently
                  in selection. Categories span geopolitics, regulatory
                  outcomes, scientific breakthroughs, and financial events.
                  Announcement of the initial category suite coming soon.
                  Founding clients get early access to our selection criteria.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =================================================================
            EDGE · STATS
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="edge"
        >
          <motion.div
            className="max-w-6xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="06 / 07" title="Edge" />

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-20 max-w-4xl"
              style={{ color: COLORS.textPrimary }}
            >
              Why this matters.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <StatCard
                index="M·01"
                value="$1T"
                headline="Prediction markets growing"
                description="Prediction markets approaching $1T annual volume with no Bloomberg equivalent. We are building that infrastructure."
              />
              <StatCard
                index="M·02"
                value="03"
                headline="Proprietary data sources"
                description="Three independent proprietary sources unified into one probability-adjusted signal with compounding accuracy."
              />
              <StatCard
                index="M·03"
                value="↑"
                headline="Feedback loops built-in"
                description="Every simulation output feeds back into the model. Accuracy compounds with every prediction across every market."
              />
              <StatCard
                index="M·04"
                value="00"
                headline="Direct competitors"
                description="No existing competitors have built alternative data infrastructure purpose-designed for prediction markets."
              />
            </div>
          </motion.div>
        </section>

        {/* =================================================================
            TESTIMONIALS
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="testimonials"
        >
          <motion.div
            className="max-w-4xl mx-auto"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionLabel index="07 / 07" title="Social Proof" />

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-20 max-w-4xl"
              style={{ color: COLORS.textPrimary }}
            >
              Trusted by traders.
            </h2>

            <TestimonialsCarousel />
          </motion.div>
        </section>

        {/* =================================================================
            EARLY ACCESS
            ================================================================= */}
        <section
          className="w-full py-28 md:py-40 px-6 md:px-10 relative z-10"
          style={{ backgroundColor: COLORS.bg }}
          data-section
          id="pricing"
        >
          <motion.div
            className="max-w-3xl mx-auto text-center"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div
              className={`${mono.className} flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.24em] mb-10`}
              style={{ color: COLORS.textMuted }}
            >
              <LiveDot />
              <span>Early access · Founding wave</span>
            </div>

            <h2
              className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-8"
              style={{ color: COLORS.textPrimary }}
            >
              Get in before the edge is gone.
            </h2>
            <p
              className="text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto"
              style={{ color: COLORS.textSecondary }}
            >
              Onboarding our first wave of traders and institutional clients.
              Join the waitlist for founding member pricing.
            </p>

            <WaitlistForm />
          </motion.div>
        </section>

        {/* =================================================================
            FOOTER
            ================================================================= */}
        <footer
          className="w-full px-6 md:px-10 py-12 border-t relative z-10"
          style={{
            backgroundColor: COLORS.bg,
            borderColor: COLORS.hairline,
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5"
                style={{ backgroundColor: COLORS.accent }}
              />
              <span
                className="text-sm font-semibold tracking-tight"
                style={{ color: COLORS.textPrimary }}
              >
                PolyHedge
              </span>
            </div>

            <div
              className={`${mono.className} text-[10px] uppercase tracking-[0.24em]`}
              style={{ color: COLORS.textFaint }}
            >
              / Alternative data for traders · © 2026
            </div>

            <div
              className={`${mono.className} flex gap-6 text-[11px] uppercase tracking-[0.18em]`}
            >
              <a href="#privacy" style={{ color: COLORS.textMuted }}>
                Privacy
              </a>
              <a href="#terms" style={{ color: COLORS.textMuted }}>
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
