'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Cpu, AlertCircle } from 'lucide-react';
import { Geist } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { FloatingParticles } from '@/components/background-effects';
import { GlitchLogo } from '@/components/navigation';
import { TIER_STORAGE_KEY } from '@/lib/constants/tiers';
import posthog from 'posthog-js';

const geist = Geist({ subsets: ['latin'] });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const [mode, setMode] = useState<'login' | 'signup'>(intent === 'demo' ? 'login' : 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  React.useEffect(() => {
    // If already logged in and coming from Access button, skip auth entirely
    if (intent === 'demo') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const tier = session.user.user_metadata?.tier;
          if (tier) localStorage.setItem(TIER_STORAGE_KEY, tier);
          router.replace('/demo');
        }
      });
    }

    const paid = searchParams.get('paid');
    const plan = searchParams.get('plan');

    if (paid === 'true' && plan) {
      // Persist tier to user account so it survives new sessions
      supabase.auth.updateUser({ data: { tier: plan } });
      localStorage.setItem(TIER_STORAGE_KEY, plan);
      setPaymentSuccess(true);
      setActivatedPlan(plan);

      const timeout = setTimeout(() => {
        router.push('/demo');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  const switchMode = (next: 'login' | 'signup') => {
    setAuthError(null);
    posthog.capture('auth_mode_switched', { from: mode, to: next });
    setMode(next);
  };

  const friendlyError = (msg: string): string => {
    if (msg.includes('Password should be at least') || msg.includes('password'))
      return 'Password must be at least 6 characters.';
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials'))
      return 'Incorrect email or password.';
    if (msg.includes('Email not confirmed'))
      return 'Please confirm your email before logging in. Check your inbox.';
    if (msg.includes('Email rate limit') || msg.includes('email_send_failed') || msg.includes('rate limit'))
      return 'Too many signup attempts. Please wait a few minutes and try again.';
    if (msg.includes('User already registered'))
      return 'An account with this email already exists. Please log in instead.';
    if (msg.includes('signup_disabled'))
      return 'New signups are temporarily disabled. Please try again later.';
    return msg;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (mode === 'signup' && passwordValue.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: emailValue,
          password: passwordValue,
          options: { data: { full_name: nameValue } },
        });
        if (error) throw error;
        if (data.user?.identities?.length === 0) {
          setAuthError('An account with this email already exists. Please log in instead.');
          setIsLoading(false);
          return;
        }
        // Email confirmation required — session won't exist yet
        if (!data.session) {
          setAuthError(null);
          setIsLoading(false);
          setAuthError('Account created! Check your email to confirm your address, then log in.');
          switchMode('login');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailValue,
          password: passwordValue,
        });
        if (error) throw error;
      }

      posthog.capture('auth_form_submitted', { mode });
      posthog.identify(emailValue, { email: emailValue });

      const { data: { user } } = await supabase.auth.getUser();
      const existingTier = user?.user_metadata?.tier;
      if (intent === 'demo') {
        if (!existingTier) {
          await supabase.auth.updateUser({ data: { tier: 'Observer' } });
          localStorage.setItem(TIER_STORAGE_KEY, 'Observer');
        } else {
          localStorage.setItem(TIER_STORAGE_KEY, existingTier);
        }
        router.push('/demo');
      } else if (existingTier) {
        localStorage.setItem(TIER_STORAGE_KEY, existingTier);
        router.push('/demo');
      } else {
        router.push('/pricing');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(friendlyError(message));
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md relative z-10"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] text-[10px] font-bold mb-6 tracking-[0.2em] uppercase">
          <Cpu size={12} /> SECURE_HANDSHAKE_NODE
        </div>

        {/* Mode tab switcher */}
        <div className="flex bg-[#111111] border border-[#1E1E1E] rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-widest uppercase transition-all ${
              mode === 'signup'
                ? 'bg-[#00FF94] text-[#0A0A0A]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-widest uppercase transition-all ${
              mode === 'login'
                ? 'bg-[#00FF94] text-[#0A0A0A]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Log In
          </button>
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
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
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
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="w-full bg-[#111111] border-2 border-[#1E1E1E] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00FF94] transition-colors"
          />
        </div>
        {mode === 'signup' && (
          <p className="text-[#555555] text-xs pl-1">Minimum 6 characters</p>
        )}

        {authError && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm border ${
            authError.includes('Check your email') || authError.includes('Account created')
              ? 'bg-[#00FF94]/10 border-[#00FF94]/40 text-[#00FF94]'
              : 'bg-red-500/10 border-red-500/40 text-red-400'
          }`}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              {authError}
              {authError.includes('log in') && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="ml-1 underline hover:text-white transition-colors"
                >
                  Switch to login
                </button>
              )}
            </span>
          </div>
        )}

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
  );
}

export default function AuthPage() {
  return (
    <div className={`${geist.className} min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden`}>
      <DottedSurface />
      <FloatingParticles />

      <div className="absolute top-12 left-12">
        <GlitchLogo />
      </div>

      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
