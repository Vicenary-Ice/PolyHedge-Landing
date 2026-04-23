'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Cpu } from 'lucide-react';
import { Geist } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { TickerBar, Navbar } from '@/components/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { TIER_STORAGE_KEY } from '@/lib/constants/tiers';

const geist = Geist({ subsets: ['latin'] });

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
}

function PricingCard({ name, price, description, features, recommended, icon }: PricingCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      posthog.capture('checkout_initiated', { plan_name: name, price_usd: Number(price) });

      if (Number(price) === 0) {
        localStorage.setItem(TIER_STORAGE_KEY, name);
        router.push('/demo');
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceStr: price, planName: name })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Checkout failed — no redirect URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative p-8 rounded-xl border-2 transition-all duration-300 ${
        recommended ? 'bg-[#111111] border-[#00FF94] shadow-[0_0_30px_rgba(0,255,148,0.15)]' : 'bg-[#111111] border-[#1E1E1E] hover:border-[#00FF94]/50'
      }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00FF94] text-[#0A0A0A] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Recommended
        </div>
      )}

      <div className="mb-6">
        <div className={`p-3 rounded-lg w-fit mb-4 ${recommended ? 'text-[#00FF94]' : 'text-white/60'}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-white">${price}</span>
          <span className="text-[#888888]">/mo</span>
        </div>
        <p className="text-[#888888] text-sm h-10">{description}</p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-xs font-bold text-[#00FF94] uppercase tracking-widest">// KEY FEATURES</p>
        {features.map((feature, i) => (
          <div key={i} className="flex gap-3">
            <Check size={18} className="text-[#00FF94] shrink-0" />
            <span className="text-white/80 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 ${
          recommended
            ? 'bg-[#00FF94] text-[#0A0A0A] hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]'
            : 'bg-[#1E1E1E] text-white hover:bg-[#333333]'
        }`}
      >
        {loading ? 'PROCESSING...' : `GET ${name.toUpperCase()} ACCESS`}
      </button>
      {error && (
        <p className="mt-3 text-red-400 text-xs text-center">{error}</p>
      )}
    </motion.div>
  );
}

// ============================================================================
// PRICING PAGE
// ============================================================================

export default function PricingPage() {
  const plans = [
    {
      name: 'Observer',
      price: '0',
      description: 'Public data access and community insights.',
      icon: <Shield size={32} />,
      features: [
        'Real-time weather maps & maritime tracking',
        'Foresy Reality Scores (Top 10 events)',
        '2 mobile push notifications per day',
        'Access to public discussion boards',
      ],
    },
    {
      name: 'Trader',
      price: '10',
      description: 'Enhanced tracking for active market participants.',
      recommended: true,
      icon: <Zap size={32} />,
      features: [
        'All Observer features plus:',
        '100+ public and logistics data streams',
        'Polymarket Whale Tracker (Top 50)',
        'Weekly Digital Scout Summaries',
        '10 real-time SMS/Email anomaly alerts',
      ],
    },
    {
      name: 'Quant',
      price: '50',
      description: 'Full simulation engine and programmatic execution.',
      icon: <Cpu size={32} />,
      features: [
        'All Trader features plus:',
        'Unlimited MiroFish swarm simulations',
        'Full API Access for bot execution',
        'Priority Scout influence & focus',
        'White-Glove Support & Private Discord',
      ],
    },
  ];

  return (
    <main className={`${geist.className} bg-[#0A0A0A] min-h-screen text-white relative overflow-hidden`}>
      {/* Scanline and Noise effects (matching layout) */}
      <style>{`
        body::before {
          content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px);
          pointer-events: none; z-index: 9999; opacity: 0.04;
        }
        body::after {
          content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9998; opacity: 0.02;
        }
      `}</style>

      <TickerBar />
      <Navbar activeSection="pricing" />

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 px-8">
        <DottedSurface />
        <FloatingParticles />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#00FF94] font-mono text-sm mb-4 tracking-widest uppercase">// SUBSCRIPTION MODELS</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              PICK THE RIGHT <span className="text-[#00FF94]">PLAN</span> <br />FOR YOUR EDGE
            </h1>
            <p className="max-w-2xl mx-auto text-[#888888] text-lg mb-16">
              Institutional-grade data infrastructure designed for the modern trader. 
              Capture signals before they hit the mainstream.
            </p>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {plans.map((plan, i) => (
              <PricingCard key={i} {...plan} />
            ))}
          </div>

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="p-12 rounded-2xl border-2 border-[#1E1E1E] bg-[#111111] max-w-3xl mx-auto relative group overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF94] opacity-50 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-3xl font-bold mb-6">Ready to secure your edge?</h2>
            <p className="text-[#888888] mb-8">
              Join 5,000+ institutional traders today. Instant account activation.
            </p>
            <Link href="/auth" className="inline-block px-8 py-4 bg-[#00FF94] text-[#0A0A0A] rounded-lg font-bold hover:shadow-[0_0_20px_rgba(0,255,148,0.4)] transition-all">
              CREATE INSTITUTIONAL ACCOUNT
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer (Simplified) */}
      <footer className="py-12 px-8 border-t border-[#1E1E1E] text-center text-[#444444] text-sm">
        <p>&copy; {new Date().getFullYear()} POLYHEDGE DATA SYSTEMS. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
