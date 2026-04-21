'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Geist } from 'next/font/google';
import { useEmailSignup } from '@/lib/hooks/useEmailSignup';

const geist = Geist({ subsets: ['latin'] });

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const { signup, loading, error, success } = useEmailSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup(email);
    if (result) {
      setEmail('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 justify-center items-center"
    >
      <input
        type="email"
        placeholder="> your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className={`${geist.className} flex-1 md:flex-none px-6 py-4 rounded bg-[#111111] border-2 text-white placeholder-[#444444] focus:outline-none focus:border-[#00FF94] disabled:opacity-50`}
        style={{
          borderColor: error ? '#FF6B6B' : '#333333',
        }}
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        disabled={loading}
        className={`${geist.className} px-8 py-4 rounded-full font-bold text-lg disabled:opacity-50`}
        style={{ backgroundColor: '#00FF94', color: '#0A0A0A' }}
      >
        {loading ? '> LOADING...' : '> JOIN WAITLIST'}
      </motion.button>
      {error && (
        <p className="text-red-500 text-sm w-full md:w-auto">{error}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm w-full md:w-auto">Thanks for signing up!</p>
      )}
    </form>
  );
}
