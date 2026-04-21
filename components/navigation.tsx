'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSearchLimit } from '@/lib/hooks/useSearchLimit';

const geist = Geist({ subsets: ['latin'] });

// ============================================================================
// GLITCH EFFECT FOR LOGO
// ============================================================================

export function GlitchLogo() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const { resetSearches } = useSearchLimit();

  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => setIsGlitching(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Secret reset functionality: 5 clicks resets searches
  const handleLogoClick = (e: React.MouseEvent) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      resetSearches();
      setClickCount(0);
      alert('// SYSTEM_RESET: TRIAL_LIMIT_CLEARED');
    }

    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/">
        <motion.div
          onClick={handleLogoClick}
          animate={isGlitching ? { x: [-4, 4, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`${geist.className} font-bold text-white text-lg cursor-pointer`}
        >
          PolyHedge<span className="text-[#00FF94]">_</span>
        </motion.div>
      </Link>
    </div>
  );
}

// ============================================================================
// TICKER BAR COMPONENT
// ============================================================================

export function TickerBar() {
  const tickerContent = `NYSE:AAPL SIGNAL: 0.847   •   FED RATE DECISION: 73.2% HOLD   •   FDA APPROVAL [PENDING]: 61.4%   •   SCOTUS RULING [Q2]: 58.9% AFFIRM   •   DATA SOURCES: 847 ACTIVE   •   MARKETS COVERED: ALL NYSE`;

  return (
    <div
      className={`${geist.className} fixed top-0 left-0 right-0 z-40 w-full overflow-hidden bg-black border-b border-[#1E1E1E]`}
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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

export function Navbar({ activeSection }: { activeSection?: string }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const navLinks = [
    { name: 'Features', href: isHome ? '#features' : '/#features', id: 'features' },
    { name: 'Coverage', href: isHome ? '#coverage' : '/#coverage', id: 'coverage' },
    { name: 'Pricing', href: '/pricing', id: 'pricing' },
  ];

  return (
    <nav
      className={`fixed top-12 left-0 right-0 z-30 bg-black border-b border-[#1E1E1E] flex items-center justify-between px-8 py-4`}
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <GlitchLogo />
      <div className="flex items-center gap-8">
        {navLinks.map((link) => {
            const isActive = activeSection === link.id || (pathname === link.href && !link.href.includes('#'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className="transition text-sm"
                style={{
                  color: isActive ? '#FFFFFF' : '#888888',
                  borderBottom: isActive ? '2px solid #00FF94' : 'none',
                  paddingBottom: '2px',
                }}
              >
                {link.name}
              </Link>
            );
        })}
        <motion.a
          href="/demo"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          className={`${geist.className} px-6 py-2 border-2 rounded-full text-black font-bold text-sm flex items-center gap-2`}
          style={{ borderColor: '#00FF94', color: '#0A0A0A', backgroundColor: '#00FF94' }}
        >
          &gt; ACCESS DEMO
          <ExternalLink size={14} />
        </motion.a>
      </div>
    </nav>
  );
}
