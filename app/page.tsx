'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Space_Mono, Inter } from 'next/font/google';

// Font imports
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'] });

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
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);
  const current = testimonials[currentIndex];
  return (
    <motion.div key={`testimonial-${currentIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="text-center">
      <p className={`${spaceMono.className} text-lg italic text-secondary mb-6`} style={{ color: '#FFFFFF' }}>"{current.quote}"</p>
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}>{current.initials}</div>
        <div className="text-left"><p className="text-white font-bold text-sm">{current.name}</p><p className="text-muted text-xs" style={{ color: '#FFFFFF' }}>{current.role}</p></div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FLOATING PARTICLES COMPONENT
// ============================================================================

function FloatingParticles() {
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    size: Math.random() * 2 + 2,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 5,
    color: Math.random() > 0.5 ? '#FFFFFF' : '#00FF94',
    opacity: Math.random() * 0.2 + 0.2,
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            zIndex: 5,
          }}
          animate={{
            y: [-100, 100],
            x: [0, Math.random() * 20 - 10],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
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
        // Wait 600ms, then trigger exit
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    }, 110);

    return () => clearInterval(interval);
  }, [isInView, onComplete]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 0 }}
      animate={{ y: -1200 }}
      transition={{ delay: displayedText.length * 0.11 + 0.6, duration: 0.8, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        // Overlay is fully out, content below will start fading in
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className={`${spaceMono.className} text-6xl font-bold text-white`}>
        {displayedText}
      </div>
    </motion.div>
  );
}

// ============================================================================
// GLITCH EFFECT FOR LOGO
// ============================================================================

function GlitchLogo() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Trigger glitch on mount only
    setIsGlitching(true);
    const timer = setTimeout(() => setIsGlitching(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      animate={isGlitching ? { x: [-4, 4, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`${spaceMono.className} font-bold text-white text-lg`}
    >
      PolyHedge<span className="text-accent">_</span>
    </motion.div>
  );
}

// ============================================================================
// TYPEWRITER HEADLINE
// ============================================================================

function TypewriterHeadline({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

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
  }, [isInView, text]);

  return (
    <div ref={ref} className={`${spaceMono.className} text-5xl md:text-6xl font-bold text-white leading-tight`}>
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
      <div className={`${spaceMono.className} text-4xl font-bold text-accent mb-3`} style={{ color: '#00FF94' }}>
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
      <div className={`${spaceMono.className} text-sm font-bold mb-4`} style={{ color: '#00FF94' }}>
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
// CANVAS BACKGROUND GRID
// ============================================================================

function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let offset = 0;
    let animationFrameId: number;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 148, 0.08)';
      ctx.lineWidth = 1;

      const gridSize = 50;
      offset += 0.3;

      // Horizontal lines
      for (let y = -gridSize + (offset % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let x = -gridSize + (offset % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}

// ============================================================================
// TICKER BAR COMPONENT
// ============================================================================

function TickerBar() {
  const tickerContent = `NYSE:AAPL SIGNAL: 0.847   •   FED RATE DECISION: 73.2% HOLD   •   FDA APPROVAL [PENDING]: 61.4%   •   SCOTUS RULING [Q2]: 58.9% AFFIRM   •   DATA SOURCES: 847 ACTIVE   •   MARKETS COVERED: ALL NYSE`;

  return (
    <div
      className={`${spaceMono.className} fixed top-0 left-0 right-0 z-40 w-full overflow-hidden bg-black border-b`}
      style={{ backgroundColor: '#0A0A0A', borderColor: '#1E1E1E' }}
    >
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-content {
          animation: marquee 30s linear infinite;
          white-space: nowrap;
        }
      `}</style>
      <div className="ticker-content text-sm py-2 px-4" style={{ color: '#00FF94' }}>
        {tickerContent}   •   {tickerContent}
      </div>
    </div>
  );
}

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================

function Navbar({ activeSection }: { activeSection: string }) {
  return (
    <nav
      className={`fixed top-12 left-0 right-0 z-30 bg-black border-b flex items-center justify-between px-8 py-4`}
      style={{ backgroundColor: '#0A0A0A', borderColor: '#1E1E1E' }}
    >
      <GlitchLogo />
      <div className="flex items-center gap-8">
        <a
          href="#features"
          className="nav-link transition"
          style={{
            color: activeSection === 'features' ? '#FFFFFF' : '#888888',
            borderBottom: activeSection === 'features' ? '2px solid #00FF94' : 'none',
            paddingBottom: '2px',
          }}
        >
          Features
        </a>
        <a
          href="#coverage"
          className="nav-link transition"
          style={{
            color: activeSection === 'coverage' ? '#FFFFFF' : '#888888',
            borderBottom: activeSection === 'coverage' ? '2px solid #00FF94' : 'none',
            paddingBottom: '2px',
          }}
        >
          Coverage
        </a>
        <a
          href="#pricing"
          className="nav-link transition"
          style={{
            color: activeSection === 'pricing' ? '#FFFFFF' : '#888888',
            borderBottom: activeSection === 'pricing' ? '2px solid #00FF94' : 'none',
            paddingBottom: '2px',
          }}
        >
          Pricing
        </a>
        <motion.a
          href="#demo"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          className={`${spaceMono.className} px-6 py-2 border-2 rounded-full text-black font-bold text-sm flex items-center gap-2`}
          style={{ borderColor: '#00FF94', color: '#0A0A0A', backgroundColor: '#00FF94' }}
        >
          &gt; ACCESS DEMO
          <ExternalLink size={14} />
        </motion.a>
      </div>
    </nav>
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

      <div className={inter.className}>
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
              <HeroBackground />
              <FloatingParticles />
              <motion.div
                className="relative z-10 max-w-4xl mx-auto px-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <TypewriterHeadline
                  text="THE DATA INFRASTRUCTURE
SERIOUS TRADERS HAVE
BEEN WAITING FOR."
                />
                <motion.p
                  className={`mt-6 text-lg text-secondary max-w-2xl mx-auto`}
                  style={{ color: '#FFFFFF' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  Proprietary alternative data. Three collection pillars. One unified intelligence platform.
                </motion.p>
                <motion.div
                  className="mt-12 flex gap-6 justify-center flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <motion.a
                    href="#demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className={`${spaceMono.className} px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2`}
                    style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}
                  >
                    &gt; ACCESS DEMO →
                  </motion.a>
                  <motion.a
                    href="#features"
                    whileHover={{ scale: 1.05 }}
                    className={`${spaceMono.className} px-10 py-4 rounded-full font-bold text-lg border-2`}
                    style={{ borderColor: '#00FF94', color: '#FFFFFF' }}
                  >
                    GET STARTED
                  </motion.a>
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
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // THE PROBLEM
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-8`}>
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
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // THE PLATFORM
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-12`}>One Platform. Every Signal.</h2>

                {/* Terminal-style dashboard mockup */}
                <div
                  className={`${spaceMono.className} p-8 rounded border-2 mb-8 bg-black`}
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
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // DATA ARCHITECTURE
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-16`}>Three Pillars. Zero Overlap.</h2>

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
                <div className={`${spaceMono.className} symbol-scroll whitespace-nowrap text-muted text-sm`} style={{ color: '#FFFFFF' }}>
                  AAPL • MSFT • GOOGL • AMZN • NVDA • TSLA • META • NFLX • ADBE • CRM • INTU • PYPL • ORCL • AVGO • QCOM • ASML • AMAT • MU • AMD • NXPI • JKHY • PAYX • VRSN • TTWO • CDNS • SNPS • TEAM • FTNT • OKTA • SPLK • ZM • DDOG • SNOW • CRWD • ESTC • AAPL • MSFT • GOOGL • AMZN • NVDA • TSLA • META • NFLX • ADBE • CRM • INTU • PYPL • ORCL • AVGO • QCOM • ASML • AMAT • MU • AMD • NXPI • JKHY • PAYX • VRSN • TTWO • CDNS • SNPS • TEAM • FTNT • OKTA • SPLK • ZM • DDOG • SNOW • CRWD • ESTC •
                </div>
              </div>

              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // COVERAGE
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-12`}>What We Cover</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Stock Markets */}
                  <div>
                    <h3 className={`${spaceMono.className} text-2xl font-bold text-white mb-6`}>STOCK MARKETS</h3>
                    <p className="text-secondary text-base mb-6" style={{ color: '#FFFFFF' }}>
                      Full NYSE coverage with signals mapped to earnings surprises, corporate events, supply chain shifts, regulatory actions, and executive movements. Real-time ingestion of institutional filings, SEC releases, media sentiment, and insider trading activity. Every public equity market above $1B market cap.
                    </p>
                  </div>

                  {/* Prediction Markets */}
                  <div>
                    <h3 className={`${spaceMono.className} text-2xl font-bold text-white mb-6`}>PREDICTION MARKETS</h3>
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
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // EDGE
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-16`}>Why This Matters</h2>

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
                <div className={`${spaceMono.className} text-sm font-bold mb-6 text-muted`} style={{ color: '#FFFFFF' }}>
                  // SOCIAL PROOF
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-16`}>Trusted by Traders</h2>

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
                EARLY ACCESS SECTION
                ================================================================ */}
            <section className="w-full py-32 px-8 bg-black" style={{ backgroundColor: '#0A0A0A' }} data-section id="pricing">
              <motion.div
                className="max-w-2xl mx-auto text-center"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`${spaceMono.className} text-sm font-bold mb-8 text-muted`} style={{ color: '#FFFFFF' }}>
                  // EARLY ACCESS
                </div>
                <h2 className={`${spaceMono.className} text-5xl font-bold text-white mb-6`}>Get In Before The Edge Is Gone.</h2>
                <p className="text-secondary text-lg mb-12" style={{ color: '#FFFFFF' }}>
                  Onboarding our first wave of traders and institutional clients. Join the waitlist for founding member pricing.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = ((e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement)?.value;
                    console.log('Waitlist submission:', email);
                    // TODO: Integrate with Mailchimp or Resend API
                    alert('Thanks! Check your email for next steps.');
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="flex flex-col md:flex-row gap-4 justify-center items-center"
                >
                  <input
                    type="email"
                    placeholder="> your@email.com"
                    required
                    className={`${spaceMono.className} flex-1 md:flex-none px-6 py-4 rounded bg-card border-2 text-white placeholder-muted focus:outline-none focus:border-accent`}
                    style={{
                      backgroundColor: '#111111',
                      borderColor: '#333333',
                      color: '#FFFFFF',
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    className={`${spaceMono.className} px-8 py-4 rounded-full font-bold text-lg`}
                    style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}
                  >
                    &gt; JOIN WAITLIST
                  </motion.button>
                </form>
              </motion.div>
            </section>

            {/* ================================================================
                FOOTER
                ================================================================ */}
            <footer
              className={`${spaceMono.className} w-full py-12 px-8 bg-black border-t`}
              style={{ backgroundColor: '#0A0A0A', borderColor: '#1E1E1E' }}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                {/* Left: Logo */}
                <div className="text-white font-bold text-lg">
                  PolyHedge<span className="text-accent">_</span>
                </div>

                {/* Center: Tagline */}
                <div className="text-center text-muted text-sm" style={{ color: '#FFFFFF' }}>
                  // ALTERNATIVE DATA FOR SERIOUS TRADERS
                </div>

                {/* Right: Links and Social */}
                <div className="flex gap-6 items-center justify-end flex-wrap">
                  <a href="#privacy" className="text-muted hover:text-white text-sm transition" style={{ color: '#FFFFFF' }}>
                    Privacy Policy
                  </a>
                  <a href="#terms" className="text-muted hover:text-white text-sm transition" style={{ color: '#FFFFFF' }}>
                    Terms of Service
                  </a>
                </div>
              </div>
            </footer>
          </>
        </div>
    </>
  );
}
