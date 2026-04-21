'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { Navbar, TickerBar } from '@/components/navigation';

const geist = Geist({ subsets: ['latin'] });

export default function PrivacyPage() {
  return (
    <main className={`${geist.className} bg-[#0A0A0A] min-h-screen text-white relative overflow-hidden`}>
      <TickerBar />
      <Navbar />
      <DottedSurface />
      <FloatingParticles />
      
      <section className="relative z-10 pt-48 pb-24 px-8 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#444444] hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} /> BACK TO HUB
        </Link>
        
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-[#00FF94] text-[10px] font-bold mb-4 tracking-[0.2em] uppercase">
            <Shield size={12} /> PROTOCOL: PRIVACY_MANIFEST
          </div>
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-[#888888] font-mono text-xs italic">LAST UPDATED: APRIL 18, 2026 // VERSION: 1.0.4</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <div className="p-8 border-2 border-[#1E1E1E] bg-[#111111] rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">// 1.0 DATA ENCRYPTION</h2>
            <p className="text-[#888888] leading-relaxed">
              All operator queries are end-to-end encrypted through the PolyHedge Mesh. We do not store raw search parameters beyond 
              ephemeral session duration required for synthesis.
            </p>
          </div>

          <div className="p-8 border-2 border-[#1E1E1E] bg-[#111111] rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">// 2.0 ZERO-LOG POLICY</h2>
            <p className="text-[#888888] leading-relaxed">
              Institutional intelligence is a matters of security. PolyHedge maintains a strict zero-log policy for all proprietary 
              outreach signals and expert network interactions initiated by the operator.
            </p>
          </div>

          <div className="p-8 border-2 border-[#1E1E1E] bg-[#111111] rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">// 3.0 THIRD-PARTY VECTORS</h2>
            <p className="text-[#888888] leading-relaxed">
              While we utilize public APIs (such as NVIDIA and Polymarket), no identifiable operator metadata is transmitted 
              to these external nodes.
            </p>
          </div>
        </div>

        <footer className="mt-24 pt-12 border-t border-[#1E1E1E] text-center text-[#444444] text-xs">
          &copy; 2026 POLYHEDGE DATA SYSTEMS. ALL RIGHTS RESERVED.
        </footer>
      </section>
    </main>
  );
}
