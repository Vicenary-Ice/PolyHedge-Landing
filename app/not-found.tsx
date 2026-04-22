'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';

const geist = Geist({ subsets: ['latin'] });

export default function NotFound() {
  return (
    <div className={`${geist.className} min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden text-center`}>
      <DottedSurface />
      <FloatingParticles />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold mb-8 tracking-[0.2em] uppercase">
          <ShieldAlert size={12} /> ERROR_404: NODE_NOT_FOUND
        </div>
        
        <h1 className="text-7xl font-bold mb-6 tracking-tight">LOST IN THE <span className="text-[#00FF94]">MESH</span>.</h1>
        
        <p className="text-[#888888] text-lg mb-12">
          The intelligence stream you are requesting has been fragmented or moved to a secure sector. Check your parameters and try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="px-8 py-4 bg-[#00FF94] text-[#0A0A0A] rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,148,0.4)] transition-all"
          >
            <Home size={20} /> RETURN TO HUB
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-[#111111] border-2 border-[#1E1E1E] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[#444444] transition-all"
          >
            <ArrowLeft size={20} /> PREVIOUS SECTOR
          </button>
        </div>
      </motion.div>

      {/* Background glitchy text */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none font-mono text-[20vw] flex items-center justify-center font-bold">
        404
      </div>
    </div>
  );
}
