'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { useSearchLimit } from '@/lib/hooks/useSearchLimit';

const geist = Geist({ subsets: ['latin'] });

interface SearchLimitOverlayProps {
  isVisible: boolean;
}

export function SearchLimitOverlay({ isVisible }: SearchLimitOverlayProps) {
  const { tierName, maxSearches } = useSearchLimit();

  if (!isVisible) return null;

  const isObserver = tierName === 'Observer';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-8"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={`${geist.className} max-w-xl w-full bg-[#111111] border-2 border-[#1E1E1E] rounded-2xl p-12 text-center relative overflow-hidden`}
        >
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF94]" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FF94]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-[#00FF94]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#00FF94]/30">
              <Lock className="text-[#00FF94]" size={40} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold mb-6 tracking-widest uppercase">
              <ShieldAlert size={14} /> // {tierName?.toUpperCase()}_LIMIT_REACHED
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Access <br /> 
              <span className="text-[#00FF94]">Restricted</span>
            </h2>

            <p className="text-[#888888] text-lg mb-10 leading-relaxed">
              You have exhausted your {maxSearches} institutional searches for the <span className="text-[#00FF94] font-bold">{tierName}</span> tier. <br />
              {isObserver 
                ? 'Upgrade to a Trader or Quant account to unlock more data streams.' 
                : 'Please upgrade to the next tier or contact support for unlimited access.'}
            </p>

            <div className="flex flex-col gap-4">
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-[#00FF94] text-[#0A0A0A] rounded-xl font-bold text-lg flex items-center justify-center gap-2 group"
                >
                  UPGRADE FOR MORE ACCESS
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/pricing" className="text-[#444444] hover:text-[#FFFFFF] transition-colors text-sm font-medium">
                View Enterprise Tiers
              </Link>
            </div>
          </div>
          
          {/* Terminal noise background decoration */}
          <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
            <pre className="text-[10px] text-[#00FF94] text-right leading-none">
              {`
                ERR_LIMIT_REACHED
                UID: PX-842-99
                SIG: BLOCKED
                NODE: PROXY_04
              `}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
