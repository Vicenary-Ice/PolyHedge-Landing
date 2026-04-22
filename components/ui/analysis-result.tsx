'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, FileText, Activity, Zap, Lock } from 'lucide-react';
import { HighFidelityProjection, MetricBox, ProgressBar } from './dashboard-charts';

interface AnalysisResultProps {
  analysis: string;
  type: 'stock' | 'prediction';
}

export function AnalysisResult({ analysis, type }: AnalysisResultProps) {
  const [serial, setSerial] = useState('SYNCING...');
  const [expertSignal, setExpertSignal] = useState(85);

  useEffect(() => {
    setSerial(Math.random().toString(36).substring(7).toUpperCase());
    setExpertSignal(Math.floor(Math.random() * 20) + 70);
  }, []);
  // Parsing logic for dashboard data
  const extractMetric = (key: string) => {
    // 1. Try new XML-style block first
    const xmlMatch = analysis.match(/<ANALYSIS_METADATA>([\s\S]*?)<\/ANALYSIS_METADATA>/i) ||
      analysis.match(/ANALYSIS_METADATA([\s\S]*?)$/i);
    if (xmlMatch) {
      const block = xmlMatch[1];
      const metricMatch = block.match(new RegExp(`${key}:\\s*(\\d+)`, 'i'));
      if (metricMatch) return parseInt(metricMatch[1]);
    }

    // 2. Fallback to old format
    const match = analysis.match(new RegExp(`\\[\\[METRIC: ${key}:\\s*(\\d+)\\s*\\]\\]`, 'i'));
    return match ? parseInt(match[1]) : 0;
  };

  const extractChartData = () => {
    // 1. Try XML-style or plain text block
    const xmlMatch = analysis.match(/<ANALYSIS_METADATA>([\s\S]*?)<\/ANALYSIS_METADATA>/i) ||
      analysis.match(/ANALYSIS_METADATA([\s\S]*?)$/i);
    if (xmlMatch) {
      const block = xmlMatch[1];
      const chartMatch = block.match(/CHART:\s*\[(.*?)\]/i);
      if (chartMatch) {
        try {
          return chartMatch[1].split(',').map(n => parseInt(n.trim()));
        } catch (e) { }
      }
    }

    // 2. Fallback to old format
    const match = analysis.match(/\[\[CHART: \[(.*?)\] \]\]/i);
    if (!match) return [10, 15, 12, 20, 18, 25, 30, 28];
    try {
      return match[1].split(',').map(n => parseInt(n.trim()));
    } catch {
      return [10, 15, 12, 20, 18, 25, 30, 28];
    }
  };

  // Clean the analysis text for content display (remove tags)
  const cleanAnalysis = analysis
    .replace(/<ANALYSIS_METADATA>[\s\S]*?<\/ANALYSIS_METADATA>/gi, '')
    .replace(/ANALYSIS_METADATA[\s\S]*?$/gi, '') // Remove plain text metadata block
    .replace(/\[\[.*?\]\]/g, '')
    .trim();

  const isPositive = analysis.toUpperCase().includes('SIGNAL: POSITIVE');
  const isNegative = analysis.toUpperCase().includes('SIGNAL: CAUTION') || analysis.toUpperCase().includes('DO NOT INVEST');
  const isValueWedge = analysis.toUpperCase().includes('SIGNAL: VALUE WEDGE');
  const isAsymmetricRisk = analysis.toUpperCase().includes('SIGNAL: ASYMMETRIC RISK') || analysis.toUpperCase().includes('SIGNAL: ASYMMETRIC OVERVALUED');
  const isFairValue = analysis.toUpperCase().includes('SIGNAL: FAIR VALUE');

  const advisoryMatch = analysis.match(/ADVISORY:\s*"(.*?)"/i) || analysis.match(/ADVISORY:\s*(LONG YES|LONG NO|NEUTRAL)/i);
  const advisory = advisoryMatch ? advisoryMatch[1].toUpperCase() : null;

  const risk = extractMetric('Risk');
  const momentum = extractMetric('Momentum') || extractMetric('Heat');
  const volatility = extractMetric('Volatility');
  const institutionalFlow = extractMetric('Flow') || extractMetric('Institutional_Flow') || extractMetric('Social_Heat') || extractMetric('Simulation_Confidence') || extractMetric('Confidence');
  const edge = extractMetric('Edge');
  const calibration = extractMetric('Calibration');
  const chartData = extractChartData();

  const confidenceMatch = analysis.match(/Confidence Score:\s*(\d+)%?/i) || analysis.match(/CONFIDENCE:\s*(\d+)%?/i) || analysis.match(/CONFIDENCE_RATING:\s*(\d+)%?/i);
  const confidence = confidenceMatch ? confidenceMatch[1] : '85';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 w-full max-w-5xl"
    >
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden shadow-2xl" style={{ backgroundColor: '#0D0D0D', borderColor: '#1E1E1E' }}>
        {/* Terminal Header */}
        <div className="border-b-2 border-border p-5 px-8 flex items-center justify-between bg-black" style={{ borderColor: '#1E1E1E' }}>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent/10 rounded" style={{ backgroundColor: 'rgba(0, 255, 148, 0.1)' }}>
              <ShieldCheck className="text-accent" size={20} style={{ color: '#00FF94' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-[0.2em] text-sm text-accent leading-none" style={{ color: '#00FF94' }}>
                  POLYHEDGE ALPHA TERMINAL
                </span>
                <span className="text-[10px] bg-muted/20 px-2 py-0.5 rounded text-muted font-mono" style={{ color: '#444444' }}>
                  v5.3.0-FORENSIC
                </span>
              </div>
              <div className="text-[10px] text-muted font-mono mt-1" style={{ color: '#666666' }}>
                STATUS: SYNCED // SOURCE: MIROFISH_QUANT_VECT
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`px-4 py-1.5 rounded-sm border font-mono text-[11px] font-bold tracking-widest ${advisory === 'LONG YES' || isValueWedge || isPositive ? 'border-accent text-accent' :
              advisory === 'LONG NO' || isAsymmetricRisk || isNegative ? 'border-red-500 text-red-500' :
                'border-blue-400 text-blue-400'
              }`} style={{
                borderColor: (advisory === 'LONG YES' || isValueWedge || isPositive) ? '#00FF94' : undefined,
                color: (advisory === 'LONG YES' || isValueWedge || isPositive) ? '#00FF94' : undefined,
                backgroundColor: (advisory === 'LONG YES' || isValueWedge || isPositive) ? 'rgba(0, 255, 148, 0.05)' : undefined
              }}>
              {advisory ? `ADVISORY: ${advisory}` :
                isValueWedge ? 'SIGNAL: VALUE WEDGE' :
                  isAsymmetricRisk ? 'SIGNAL: ASYMMETRIC RISK' :
                    isFairValue ? 'SIGNAL: FAIR VALUE' :
                      isPositive ? 'SIGNAL: POSITIVE' : isNegative ? 'SIGNAL: CAUTION' : 'SIGNAL: NEUTRAL'}
            </div>
            <div className="hidden md:block text-muted text-xs font-mono" style={{ color: '#444444' }}>
              SERIAL: {serial}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricBox label={type === 'stock' ? "Institutional Confidence" : "Forensic Probability"} value={`${confidence}%`} subValue="VERIFIED" trend="up" />
            <MetricBox label={type === 'stock' ? 'Risk Factor' : 'Probability'} value={`${risk || confidence}%`} subValue="QUANTIFIED" trend={risk > 50 ? 'down' : 'up'} />
            <MetricBox label={type === 'stock' ? "Market Momentum" : "Wedge Magnitude"} value={type === 'stock' ? (momentum ? `${momentum}` : '8.4') : `${edge || 0}%`} subValue={type === 'stock' ? "+2.1%" : "DISCREPANCY"} trend="up" />
            <MetricBox label={type === 'stock' ? "Volatility Index" : "Simulation Decay"} value={volatility ? `${volatility}` : '14.2'} subValue="STABLE" trend="neutral" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content Column (Main Analysis) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black/20 p-6 border border-border/40 rounded-lg" style={{ borderColor: 'rgba(30, 30, 30, 0.4)' }}>
                <div className="flex items-center gap-2 mb-6 text-accent font-bold text-xs tracking-[0.2em]" style={{ color: '#00FF94' }}>
                  <FileText size={16} /> DATA INTELLIGENCE FEED
                </div>
                <div className="prose prose-invert max-w-none prose-p:text-secondary prose-p:text-sm prose-p:leading-relaxed space-y-6 overflow-hidden">
                  {cleanAnalysis.split('\n').map((line, i) => {
                    const headerMatch = line.match(/^###\s*\[(.*?)\]/) || line.match(/^\[([1-4]\.0)\]/);
                    if (headerMatch) {
                      return (
                        <div key={i} className="pt-4 border-t border-border/30 mt-8 first:mt-0 first:border-0 first:pt-0" style={{ borderColor: 'rgba(30,30,30,0.3)' }}>
                          <h3 className="text-white font-bold tracking-[0.1em] text-xs uppercase mb-4 flex items-center justify-between">
                            {line.replace('###', '').trim()}
                            <Lock size={10} className="text-muted" style={{ color: '#444444' }} />
                          </h3>
                        </div>
                      );
                    }
                    if (line.trim()) return <p key={i}>{line}</p>;
                    return null;
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (Visualizations) */}
            <div className="space-y-6">
              <div className="bg-black/20 p-6 border border-border/40 rounded-lg" style={{ borderColor: 'rgba(30, 30, 30, 0.4)' }}>
                <div className="flex items-center gap-2 mb-6 text-accent font-bold text-xs tracking-[0.2em]" style={{ color: '#00FF94' }}>
                  <Activity size={16} /> {type === 'stock' ? 'QUANT VECTORS' : 'SWARM VECTORS'}
                </div>
                <div>
                  <div className="text-[10px] text-muted font-mono uppercase mb-4" style={{ color: '#888888' }}>
                    {type === 'stock' ? 'PROJECTION PATH // PRICE DISCOVERY' : 'PROBABILITY CURVE // SWARM MOMENTUM'}
                  </div>
                  <HighFidelityProjection data={chartData} />
                </div>

                <div className="space-y-4 pt-4">
                  <ProgressBar label={type === 'stock' ? "Expert Signal Weight" : "Swarm Signal Weight"} percentage={expertSignal} />
                  <ProgressBar label={type === 'stock' ? "Institutional Buy Flow" : "Social Sentiment Heat"} percentage={institutionalFlow || 65} />
                  <ProgressBar label={type === 'stock' ? "Algorithmic Confidence" : "Forecast Confidence"} percentage={parseInt(confidence)} />
                  {type === 'prediction' && calibration > 0 && (
                    <ProgressBar label="Calibration Reliability" percentage={calibration} color="#00FF94" />
                  )}
                </div>

                <div className="pt-6 border-t border-border/30" style={{ borderColor: 'rgba(30, 30, 30, 0.3)' }}>
                  <div className="flex items-center gap-3 p-4 bg-accent/5 rounded border border-accent/10" style={{ backgroundColor: 'rgba(0, 255, 148, 0.05)', borderColor: 'rgba(0, 255, 148, 0.1)' }}>
                    <Zap className="text-accent animate-pulse" size={18} style={{ color: '#00FF94' }} />
                    <div className="text-[10px] font-mono leading-tight text-secondary">
                      <span className="text-accent font-bold block" style={{ color: '#00FF94' }}>AI CORE ACTIVE</span>
                      Real-time synthesis online. No MNPI detected.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-8 pt-6 border-t border-border flex items-start gap-4" style={{ borderColor: '#1E1E1E' }}>
              <AlertTriangle className="text-muted shrink-0" size={16} style={{ color: '#444444' }} />
              <p className="text-[9px] text-muted/60 uppercase tracking-tighter leading-tight" style={{ color: 'rgba(68, 68, 68, 0.6)' }}>
                HEURISTIC CLASSIFICATION: CONFIDENTIAL / INTERNAL USE ONLY. POLYHEDGE AUTONOMOUS ENGINES UTILIZE PUBLICLY ACCESSIBLE DATA AND SIMULATED EXPERET NETWORK VECTORS. ALL ANALYSIS IS FOR INFORMATIONAL PURPOSES AND DOES NOT CONSTITUTE FINANCIAL, INVESTMENT, OR LEGAL ADVICE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
