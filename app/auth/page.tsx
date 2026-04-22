'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Geist } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { GlitchLogo } from '@/components/navigation';
import { TIER_STORAGE_KEY } from '@/lib/constants/tiers';
import posthog from 'posthog-js';

const geist = Geist({ subsets: ['latin'] });

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle payment success from Stripe
  React.useEffect(() => {
    const paid = searchParams.get('paid');
    const plan = searchParams.get('plan');

    if (paid === 'true' && plan) {
      localStorage.setItem(TIER_STORAGE_KEY, plan);
      setPaymentSuccess(true);
      setActivatedPlan(plan);
      
      // Clear the URL params after a few seconds or on manual dismiss
      const timeout = setTimeout(() => {
        router.replace('/auth');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture('auth_form_submitted', { mode });
    if (emailValue) {
      posthog.identify(emailValue, { email: emailValue });
    }
    setIsLoading(true);

    // Simulate auth processing
    await new Promise(r => setTimeout(r, 2000));

    const intent = searchParams.get('intent');
    if (intent === 'demo') {
      localStorage.setItem(TIER_STORAGE_KEY, 'Observer');
      router.push('/demo');
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className={`${geist.className} min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden`}>
      <DottedSurface />
      <FloatingParticles />
      
      {/* Absolute Logo */}
      <div className="absolute top-12 left-12">
        <GlitchLogo />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] text-[10px] font-bold mb-4 tracking-[0.2em] uppercase">
            <Cpu size={12} /> SECURE_HANDSHAKE_NODE
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {mode === 'signup' ? 'Create Account' : 'Operator Login'}
          </h1>
          <p className="text-[#888888]">
            {mode === 'signup' 
              ? 'Secure your institutional data node today.' 
              : 'Return to your intelligence dashboard.'}
          </p>
        </div>

        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-[#00FF94]/10 border border-[#00FF94] rounded-xl text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[#00FF94] font-bold uppercase tracking-widest text-xs mb-2">
                <ShieldCheck size={16} /> Subscription Active
              </div>
              <p className="text-white text-sm">
                Your <span className="font-bold text-[#00FF94]">{activatedPlan?.toUpperCase()}</span> node has been initialized. 
                Full terminal access granted.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444]">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full bg-[#111111] border-2 border-[#1E1E1E] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF94] transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444]">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="operator@email.com"
              required
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="w-full bg-[#111111] border-2 border-[#1E1E1E] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF94] transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444]">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-[#111111] border-2 border-[#1E1E1E] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF94] transition-colors"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full py-5 bg-[#00FF94] text-[#0A0A0A] rounded-xl font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Cpu size={24} />
                </motion.div>
                CALIBRATING...
              </span>
            ) : (
              <>
                {mode === 'signup' ? 'INITIALIZE ACCOUNT' : 'SECURE ACCESS'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const next = mode === 'login' ? 'signup' : 'login';
              posthog.capture('auth_mode_switched', { from: mode, to: next });
              setMode(next);
            }}
            className="text-[#888888] hover:text-white transition-colors text-sm"
          >
            {mode === 'signup' 
              ? 'Already have an account? Login' 
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-16 pt-8 border-t border-[#1E1E1E] flex flex-col items-center">
          <div className="flex items-center gap-2 text-[#444444] text-[10px] font-bold tracking-widest uppercase mb-4">
            <ShieldCheck size={14} className="text-[#00FF94]" /> 
            ENCRYPTED BY POLYHEDGE MESH
          </div>
          <div className="flex gap-4 opacity-20 filter grayscale">
            <div className="h-6 w-16 bg-white/[0.2] rounded" />
            <div className="h-6 w-20 bg-white/[0.2] rounded" />
            <div className="h-6 w-14 bg-white/[0.2] rounded" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
