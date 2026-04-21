'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Geist } from 'next/font/google';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { TickerBar, Navbar } from '@/components/navigation';
import { WaitlistForm } from '@/components/waitlist-form';
import Link from 'next/link';

// Font imports
const geist = Geist({ subsets: ['latin'] });

// ============================================================================
// TYPES
// ============================================================================

interface StatCardProps {
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
// TESTIMONIALS CAROUSEL COMPONENT
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
    const interval = setInterval(() => setCurrentIndex((prev: number) => (prev + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);
  const current = testimonials[currentIndex];
  return (
    <motion.div key={`testimonial-${currentIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="text-center">
      <p className={`${geist.className} text-lg italic text-secondary mb-6`} style={{ color: '#FFFFFF' }}>"{current.quote}"</p>
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}>{current.initials}</div>
        <div className="text-left"><p className="text-white font-bold text-sm">{current.name}</p><p className="text-muted text-xs" style={{ color: '#FFFFFF' }}>{current.role}</p></div>
      </div>
    </motion.div>
  );
}


// ============================================================================
// LOADING OVERLAY COMPONENT
// ============================================================================

function LoadingOverlay({ onComplete }: { onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const text = 'PolyHedge';
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false });

  useEffect(() => {
    if (!isInView) return;

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        // Wait for typing + 1.5s delay + 2s slide duration
        setTimeout(() => {
          onComplete();
        }, 4700);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isInView, onComplete]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 0 }}
      animate={{ y: -1200 }}
      transition={{ delay: displayedText.length * 0.11 + 1.5, duration: 2, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        // Overlay is fully out, content below will start fading in
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className={`${geist.className} text-6xl font-bold text-white`}>
        {displayedText}
      </div>
    </motion.div>
  );
}


// ============================================================================
// TYPEWRITER HEADLINE
// ============================================================================

function TypewriterHeadline({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    const startTimer = setTimeout(() => {
      let charIndex = 0;
      const interval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(interval);
          setShowCursor(true);
        }
      }, 50);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [isInView, text, delay]);

  return (
    <div ref={ref} className={`${geist.className} text-5xl md:text-6xl font-bold text-white leading-tight`}>
      {displayedText}
      {showCursor && <span className="text-accent animate-pulse">▌</span>}
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ value, headline, description }: StatCardProps) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="bg-card border border-border rounded p-8"
      style={{ backgroundColor: '#111111', borderColor: '#1E1E1E' }}
    >
      <div className={`${geist.className} text-4xl font-bold text-accent mb-3`} style={{ color: '#00FF94' }}>
        {value}
      </div>
      <h3 className="text-white font-bold mb-2">{headline}</h3>
      <p className="text-secondary text-sm" style={{ color: '#FFFFFF' }}>
        {description}
      </p>
    </motion.div>
  );
}

// ============================================================================
// PILLAR CARD COMPONENT
// ============================================================================

function PillarCard({ number, title, description }: PillarCardProps) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="bg-card border-2 border-border rounded p-8 relative"
      style={{
        backgroundColor: '#111111',
        borderColor: '#1E1E1E',
        borderTop: '2px solid #00FF94',
      }}
    >
      <div className={`${geist.className} text-sm font-bold mb-4`} style={{ color: '#00FF94' }}>
        {number}
      </div>
      <h3 className="text-white font-bold mb-4 text-lg">{title}</h3>
      <p className="text-secondary text-sm" style={{ color: '#FFFFFF' }}>
        {description}
      </p>
    </motion.div>
  );
}




// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Page() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Scroll-spy observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <>
      <style>{`
        html {
          background-color: #0A0A0A;
          scroll-behavior: smooth;
        }

        body {
          background-color: #0A0A0A;
        }

        /* Scanline overlay */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 9999;
          opacity: 0.04;
        }

        /* Noise grain filter */
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9998;
          opacity: 0.02;
        }

        .text-accent {
          color: #00FF94;
        }

        .bg-card {
          background-color: #111111;
        }

        .border-border {
          border-color: #1E1E1E;
        }

        .text-secondary {
          color: #888888;
        }

        .text-muted {
          color: #444444;
        }

        /* Glow effects for cards */
        .glow-card {
          transition: all 0.3s ease;
          border: 2px solid #1E1E1E;
        }

        .glow-card:hover {
          border-color: #00FF94;
          box-shadow: 0 0 20px rgba(0, 255, 148, 0.15);
        }

        /* Glow effects for buttons */
        .glow-btn {
          transition: all 0.3s ease;
        }

        .glow-btn:hover {
          box-shadow: 0 0 25px rgba(0, 255, 148, 0.4);
        }

        /* Data row glow on hover */
        .data-row-glow {
          transition: all 0.2s ease;
        }

        .data-row-glow:hover {
          background-color: rgba(0, 255, 148, 0.05);
          border-color: #00FF94 !important;
        }

        /* Navigation link styles */
        .nav-link {
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          color: #FFFFFF;
        }
      `}</style>

      <div className={geist.className}>
        <AnimatePresence>
          {!loadingComplete && <LoadingOverlay onComplete={() => {
            setLoadingComplete(true);
          }} />}
        </AnimatePresence>

        <>
          <TickerBar />
          <Navbar activeSection={activeSection} />

            {/* ================================================================
                HERO SECTION
                ================================================================ */}
            <section
              id="hero"
              className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden pt-32"
              style={{ backgroundColor: '#0A0A0A' }}
            >
              <DottedSurface />
              <FloatingParticles />
              <motion.div
                className="relative z-20 max-w-4xl mx-auto px-8 text-center -mt-64"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                <TypewriterHeadline
                  text="THE DATA INFRASTRUCTURE
TRADERS HAVE
BEEN WAITING FOR."
                  delay={2500}
                />
                <motion.p
                  className={`mt-6 text-lg text-secondary max-w-2xl mx-auto`}
                  style={{ color: '#FFFFFF' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Proprietary alternative data. Three collection pillars. One unified intelligence platform.
                </motion.p>
                <motion.div
                  className="mt-12 flex gap-6 justify-center flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Link 
                    href="/pricing"
                    className={`${geist.className} px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 glow-btn`}
                    style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}
                  >
                    &gt; GET ACCESS →
                  </Link>
                  <Link 
                    href="/pricing"
                    className={`${geist.className} px-10 py-4 rounded-full font-bold text-lg border-2 flex items-center justify-center glow-btn`}
                    style={{ borderColor: '#00FF94', color: '#FFFFFF' }}
                  >
                    VIEW PLANS
                  </Link>
                </motion.div>
              </motion.div>
            </section>

            {/* ================================================================
                THE PROBLEM SECTION
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="features">
              <motion.div
                className="max-w-4xl mx-auto"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // THE PROBLEM
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-8`}>
                  Institutional traders have Bloomberg. Everyone else has nothing.
                </h2>
                <div className="space-y-6">
                  <p className="text-secondary text-lg" style={{ color: '#FFFFFF' }}>
                    Professional stock market traders with access to Bloomberg terminals enjoy real-time market data, news flows, and alternative data integrations. They have hundreds of vendors to choose from as well as numerous alternative data companies to help give them an edge. But prediction market traders as well as day traders have little to no equivalent infrastructure.
                  </p>
                  <p className="text-secondary text-lg" style={{ color: '#FFFFFF' }}>
                    This is the gap PolyHedge fills. We're building the Bloomberg equivalent for prediction markets and day traders. Our data, available via a subscription, provides prediction market traders and day traders with an edge over the rest of the market.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* ================================================================
                THE PLATFORM SECTION
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="platform">
              <motion.div
                className="max-w-4xl mx-auto"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // THE PLATFORM
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-12`}>One Platform. Every Signal.</h2>

                {/* Terminal-style dashboard mockup */}
                <div
                  className={`${geist.className} p-8 rounded border-2 mb-8 bg-black`}
                  style={{ backgroundColor: '#111111', borderColor: '#1E1E1E', borderTop: '2px solid #00FF94' }}
                >
                  <div className="text-accent text-sm mb-6" style={{ color: '#00FF94' }}>
                    &gt; TERMINAL DASHBOARD
                  </div>

                  {/* Top row of signals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="border-l-2 pl-4" style={{ borderColor: '#00FF94' }}>
                      <div className="text-accent text-xs mb-2" style={{ color: '#00FF94' }}>
                        AAPL EARNINGS
                      </div>
                      <div className="text-white text-2xl font-bold mb-2">0.847</div>
                      <div className="text-muted text-xs" style={{ color: '#FFFFFF' }}>
                        SIGNAL STRENGTH: ████████░░
                      </div>
                    </div>
                    <div className="border-l-2 pl-4" style={{ borderColor: '#00FF94' }}>
                      <div className="text-accent text-xs mb-2" style={{ color: '#00FF94' }}>
                        FED RATE HOLD
                      </div>
                      <div className="text-white text-2xl font-bold mb-2">0.732</div>
                      <div className="text-muted text-xs" style={{ color: '#FFFFFF' }}>
                        SIGNAL STRENGTH: ███████░░░
                      </div>
                    </div>
                    <div className="border-l-2 pl-4" style={{ borderColor: '#00FF94' }}>
                      <div className="text-accent text-xs mb-2" style={{ color: '#00FF94' }}>
                        FDA APPROVAL
                      </div>
                      <div className="text-white text-2xl font-bold mb-2">0.614</div>
                      <div className="text-muted text-xs" style={{ color: '#FFFFFF' }}>
                        SIGNAL STRENGTH: ██████░░░░
                      </div>
                    </div>
                  </div>

                  {/* Data sources */}
                  <div className="border-t pt-6" style={{ borderColor: '#1E1E1E' }}>
                    <div className="text-accent text-xs mb-4" style={{ color: '#00FF94' }}>
                      DATA SOURCES ACTIVE
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-muted text-xs px-3 py-1 rounded border" style={{ color: '#FFFFFF', borderColor: '#1E1E1E' }}>
                        WEB AGENTS
                      </span>
                      <span className="text-muted text-xs px-3 py-1 rounded border" style={{ color: '#FFFFFF', borderColor: '#1E1E1E' }}>
                        MIROFISH
                      </span>
                      <span className="text-muted text-xs px-3 py-1 rounded border" style={{ color: '#FFFFFF', borderColor: '#1E1E1E' }}>
                        MASS OUTREACH
                      </span>
                      <span className="text-muted text-xs px-3 py-1 rounded border" style={{ color: '#FFFFFF', borderColor: '#1E1E1E' }}>
                        847 FEEDS
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-secondary text-lg mb-8" style={{ color: '#FFFFFF' }}>
                  Real-time signal synthesis from proprietary alternative data sources. NYSE coverage plus emerging prediction market categories. Terminal-style UI built for traders. <a href="#demo" className="text-accent underline" style={{ color: '#00FF94' }}>Request demo →</a>
                </p>
              </motion.div>
            </section>

            {/* ================================================================
                DATA ARCHITECTURE SECTION
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="architecture">
              <motion.div
                className="max-w-6xl mx-auto"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // DATA ARCHITECTURE
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-16`}>Three Pillars. Zero Overlap.</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <PillarCard
                    number="01"
                    title="AUTONOMOUS WEB AGENTS"
                    description="Autonomous AI agents continuously monitor the internet in real time — regulatory filings, government databases, court records, academic publications, financial media, social sentiment, and job postings. Every relevant data point is captured and structured the moment it becomes available."
                  />
                  <PillarCard
                    number="02"
                    title="SWARM INTELLIGENCE VIA MIROFISH"
                    description="MiroFish is an open-source AI prediction engine and swarm intelligence platform that creates digital parallels of real-world events, simulating how they unfold across multiple scenarios. Outcomes are stress-tested using collective intelligence to produce continuously updated probability-weighted outputs."
                  />
                  <PillarCard
                    number="03"
                    title="PROPRIETARY MASS OUTREACH"
                    description="A homegrown outreach platform systematically contacts industry specialists, supply chain participants, and domain experts at scale — capturing ground-level intelligence that no scraper can access. The institutional-grade automated version of hedge fund channel checks."
                  />
                </div>
              </motion.div>
            </section>

            {/* ================================================================
                COVERAGE SECTION
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black relative overflow-hidden" style={{ backgroundColor: '#0A0A0A' }} data-section id="coverage">
              {/* Background ticker - NYSE symbols */}
              <div className="absolute inset-0 overflow-hidden opacity-8 z-0">
                <style>{`
                  @keyframes symbolScroll {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  .symbol-scroll {
                    animation: symbolScroll 60s linear infinite;
                  }
                `}</style>
                <div className={`${geist.className} symbol-scroll whitespace-nowrap text-muted text-sm`} style={{ color: '#FFFFFF' }}>
                  AAPL • MSFT • GOOGL • AMZN • NVDA • TSLA • META • NFLX • ADBE • CRM • INTU • PYPL • ORCL • AVGO • QCOM • ASML • AMAT • MU • AMD • NXPI • JKHY • PAYX • VRSN • TTWO • CDNS • SNPS • TEAM • FTNT • OKTA • SPLK • ZM • DDOG • SNOW • CRWD • ESTC • AAPL • MSFT • GOOGL • AMZN • NVDA • TSLA • META • NFLX • ADBE • CRM • INTU • PYPL • ORCL • AVGO • QCOM • ASML • AMAT • MU • AMD • NXPI • JKHY • PAYX • VRSN • TTWO • CDNS • SNPS • TEAM • FTNT • OKTA • SPLK • ZM • DDOG • SNOW • CRWD • ESTC •
                </div>
              </div>

              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // COVERAGE
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-12`}>What We Cover</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Stock Markets */}
                  <div>
                    <h3 className={`${geist.className} text-2xl font-bold text-white mb-6`}>STOCK MARKETS</h3>
                    <p className="text-secondary text-base mb-6" style={{ color: '#FFFFFF' }}>
                      Full NYSE coverage with signals mapped to earnings surprises, corporate events, supply chain shifts, regulatory actions, and executive movements. Real-time ingestion of institutional filings, SEC releases, media sentiment, and insider trading activity. Every public equity market above $1B market cap.
                    </p>
                  </div>

                  {/* Prediction Markets */}
                  <div>
                    <h3 className={`${geist.className} text-2xl font-bold text-white mb-6`}>PREDICTION MARKETS</h3>
                    <p className="text-secondary text-base mb-6" style={{ color: '#FFFFFF' }}>
                      Niche objective non-manipulable market categories currently in selection. Categories span geopolitics, regulatory outcomes, scientific breakthroughs, and financial events. Announcement of initial category suite coming soon. Founding clients get early access to our selection criteria.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* ================================================================
                EDGE SECTION - STATS GRID
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="edge">
              <motion.div
                className="max-w-6xl mx-auto"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // EDGE
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-16`}>Why This Matters</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StatCard
                    value="$1T"
                    headline="Prediction Markets Growing"
                    description="Prediction markets approaching $1 trillion in annual volume with no Bloomberg equivalent. We are building that infrastructure."
                  />
                  <StatCard
                    value="3"
                    headline="Proprietary Data Sources"
                    description="Three independent proprietary data sources unified into one probability-adjusted signal with compounding accuracy."
                  />
                  <StatCard
                    value="↑"
                    headline="Feedback Loops Built In"
                    description="Every simulation output feeds back into the model. Accuracy compounds with every prediction across every market."
                  />
                  <StatCard
                    value="0"
                    headline="Direct Competitors"
                    description="No existing competitors have built alternative data infrastructure purpose-designed for prediction markets."
                  />
                </div>
              </motion.div>
            </section>

            {/* ================================================================
                TESTIMONIALS SECTION
                ================================================================ */}
            <section className="w-full py-24 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="testimonials">
              <motion.div
                className="max-w-4xl mx-auto"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // SOCIAL PROOF
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-16`}>Trusted by Traders</h2>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    <TestimonialsCarousel />
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  <div className="flex justify-center gap-4 mt-12">
                    <button className="text-accent hover:text-white transition" style={{ color: '#00FF94' }}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="text-accent hover:text-white transition" style={{ color: '#00FF94' }}>
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* ================================================================
                TRIAL ACCESS SECTION
                ================================================================ */}
            <section className="w-full py-32 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="pricing">
              <motion.div
                className="max-w-2xl mx-auto text-center"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${geist.className} text-sm font-bold mb-8 text-muted`} style={{ color: '#FFFFFF' }}>
                  // IMMEDIATE ACCESS
                </div>
                <h2 className={`${geist.className} text-5xl font-bold text-white mb-6`}>Deploy Your Edge in Seconds.</h2>
                <p className="text-secondary text-lg mb-12" style={{ color: '#FFFFFF' }}>
                  No more waiting. Access our terminal today and get 3 complimentary institutional searches.
                </p>

                <motion.a 
                  href="/demo"
                  whileHover={{ scale: 1.05 }}
                  className={`${geist.className} inline-flex items-center gap-2 px-10 py-5 bg-[#00FF94] text-[#0A0A0A] rounded-full font-bold text-lg group`}
                >
                  START FREE TRIAL
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </motion.div>
            </section>

            {/* ================================================================
                FOOTER
                ================================================================ */}
            <footer
              className={`${geist.className} w-full py-12 px-8 bg-black border-t`}
              style={{ backgroundColor: '#0A0A0A', borderColor: '#1E1E1E' }}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                {/* Left: Logo */}
                <div className="text-white font-bold text-lg">
                  PolyHedge<span className="text-accent">_</span>
                </div>

                {/* Center: Tagline */}
                <div className="text-center text-muted text-sm" style={{ color: '#FFFFFF' }}>
                  // ALTERNATIVE DATA FOR TRADERS
                </div>

                {/* Right: Links and Social */}
                <div className="flex gap-6 items-center justify-end flex-wrap">
                  <Link href="/privacy" className="text-muted hover:text-white text-sm transition" style={{ color: '#FFFFFF' }}>
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-muted hover:text-white text-sm transition" style={{ color: '#FFFFFF' }}>
                    Terms of Service
                  </Link>
                </div>
              </div>
            </footer>
          </>
        </div>
    </>
  );
}
