'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, ArrowRight } from 'lucide-react';
import { Geist } from 'next/font/google';
import Link from 'next/link';

const geist = Geist({ subsets: ['latin'] });

export default function DemoPage() {
  return (
    <div className={`${geist.className} min-h-screen bg-black text-white flex flex-col items-center justify-center p-8`}>
      {/* Background scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <div className="text-accent text-sm font-bold mb-4 tracking-[0.2em]" style={{ color: '#00FF94' }}>
          // SELECT DATA ENVIRONMENT
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">
          What are we <span className="text-accent" style={{ color: '#00FF94' }}>analyzing</span> today?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stock Markets Option */}
          <Link href="/demo/stocks" className="group">
            <motion.div 
              whileHover={{ scale: 1.02, borderColor: '#00FF94' }}
              className="bg-card border-2 border-border p-12 rounded-lg text-left transition-all relative overflow-hidden h-full flex flex-col justify-between"
              style={{ backgroundColor: '#111111', borderColor: '#1E1E1E' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={120} />
              </div>
              <div>
                <TrendingUp className="text-accent mb-6" size={48} style={{ color: '#00FF94' }} />
                <h2 className="text-3xl font-bold mb-4">Stock Markets</h2>
                <p className="text-secondary text-lg leading-relaxed">
                  Institutional-grade data for the NYSE. Earnings surprises, supply chain shifts, and executive movement signals.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-accent font-bold" style={{ color: '#00FF94' }}>
                ENTER TERMINAL <ArrowRight size={20} />
              </div>
            </motion.div>
          </Link>

          {/* Prediction Markets Option */}
          <Link href="/demo/prediction" className="group">
            <motion.div 
              whileHover={{ scale: 1.02, borderColor: '#00FF94' }}
              className="bg-card border-2 border-border p-12 rounded-lg text-left transition-all relative overflow-hidden h-full flex flex-col justify-between"
              style={{ backgroundColor: '#111111', borderColor: '#1E1E1E' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart2 size={120} />
              </div>
              <div>
                <BarChart2 className="text-accent mb-6" size={48} style={{ color: '#00FF94' }} />
                <h2 className="text-3xl font-bold mb-4">Prediction Markets</h2>
                <p className="text-secondary text-lg leading-relaxed">
                  Probability-weighted signals for geopolitical events, regulatory rulings, and niche objective markets.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-accent font-bold" style={{ color: '#00FF94' }}>
                ENTER TERMINAL <ArrowRight size={20} />
              </div>
            </motion.div>
          </Link>
        </div>

        <Link href="/" className="mt-16 inline-block text-muted hover:text-white transition-colors" style={{ color: '#444444' }}>
          &lt; BACK TO MAINCORE
        </Link>
      </motion.div>
    </div>
  );
}
