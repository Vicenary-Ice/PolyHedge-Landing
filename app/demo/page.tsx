'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, ArrowRight } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import posthog from 'posthog-js';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { GlitchLogo } from '@/components/navigation';

const geist = Geist({ subsets: ['latin'] });

export default function DemoPage() {
  return (
    <div className={`${geist.className} min-h-screen text-white flex flex-col items-center justify-center p-8 relative overflow-hidden`} style={{ backgroundColor: '#0A0A0A' }}>
      <DottedSurface />
      <FloatingParticles />

      <div className="absolute top-12 left-12 z-20">
        <GlitchLogo />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        <div className="text-sm font-bold mb-4 tracking-[0.2em] uppercase" style={{ color: '#00FF94' }}>
          // SELECT DATA ENVIRONMENT
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">
          What are we <span style={{ color: '#00FF94' }}>analyzing</span> today?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/demo/stocks" className="group" onClick={() => posthog.capture('demo_environment_selected', { environment: 'stocks' })}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-2 p-12 rounded-xl text-left transition-all relative overflow-hidden h-full flex flex-col justify-between group-hover:border-[#00FF94]/60"
              style={{ backgroundColor: '#0E0E0E', borderColor: '#1A1A1A' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={120} />
              </div>
              <div>
                <TrendingUp className="mb-6" size={48} style={{ color: '#00FF94' }} />
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#FAFAFA' }}>Stock Markets</h2>
                <p className="text-lg leading-relaxed" style={{ color: '#A1A1A1' }}>
                  Institutional-grade data for the NYSE. Earnings surprises, supply chain shifts, and executive movement signals.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-bold" style={{ color: '#00FF94' }}>
                ENTER TERMINAL <ArrowRight size={20} />
              </div>
            </motion.div>
          </Link>

          <Link href="/demo/prediction" className="group" onClick={() => posthog.capture('demo_environment_selected', { environment: 'prediction' })}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-2 p-12 rounded-xl text-left transition-all relative overflow-hidden h-full flex flex-col justify-between group-hover:border-[#00FF94]/60"
              style={{ backgroundColor: '#0E0E0E', borderColor: '#1A1A1A' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart2 size={120} />
              </div>
              <div>
                <BarChart2 className="mb-6" size={48} style={{ color: '#00FF94' }} />
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#FAFAFA' }}>Prediction Markets</h2>
                <p className="text-lg leading-relaxed" style={{ color: '#A1A1A1' }}>
                  Probability-weighted signals for geopolitical events, regulatory rulings, and niche objective markets.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-bold" style={{ color: '#00FF94' }}>
                ENTER TERMINAL <ArrowRight size={20} />
              </div>
            </motion.div>
          </Link>
        </div>

        <Link href="/" className="mt-16 inline-block hover:text-white transition-colors text-sm tracking-widest uppercase" style={{ color: '#525252' }}>
          ← Back to Main
        </Link>
      </motion.div>
    </div>
  );
}
