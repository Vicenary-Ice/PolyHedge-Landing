'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';

interface MiniLineChartProps {
  data: number[];
  color?: string;
}

export function MiniLineChart({ data, color = '#00FF94' }: MiniLineChartProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 200;
  const height = 60;
  const padding = 5;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - ((val - min) / (range || 1)) * (height - padding * 2) - padding
  }));

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="w-full h-[60px] bg-black/40 rounded border border-border/30 p-2 overflow-hidden" style={{ borderColor: 'rgba(30, 30, 30, 0.3)' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          d={`${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`}
          fill="url(#gradient)"
        />
      </svg>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricBox({ label, value, subValue, trend }: MetricBoxProps) {
  return (
    <div className="bg-black/40 border border-border/30 p-4 rounded-lg" style={{ borderColor: 'rgba(30, 30, 30, 0.3)' }}>
      <div className="text-[10px] text-muted font-mono tracking-widest uppercase mb-1" style={{ color: '#444444' }}>
        {label}
      </div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
        {subValue && (
          <div className={`text-[10px] pb-1 font-mono ${
            trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-red-500' : 'text-muted'
          }`} style={{ color: trend === 'up' ? '#00FF94' : undefined }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  percentage: number;
}

export function ProgressBar({ label, percentage }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono tracking-widest" style={{ color: '#888888' }}>
        <span>{label.toUpperCase()}</span>
        <span className="text-accent" style={{ color: '#00FF94' }}>{percentage}%</span>
      </div>
      <div className="h-1 bg-muted/20 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(68, 68, 68, 0.2)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-accent"
          style={{ backgroundColor: '#00FF94' }}
        />
      </div>
    </div>
  );
}
interface HighFidelityProjectionProps {
  data: number[];
  label?: string;
}

export function HighFidelityProjection({ data, label }: HighFidelityProjectionProps) {
  if (!data || data.length === 0) return null;

  // Transform raw array into recharts-ready object array
  const chartData = data.map((val, i) => ({
    name: i === 0 ? 'Current' : `T+${i}`,
    price: val,
    // Add a synthetic confidence interval
    upper: val + (i * 2),
    lower: val - (i * 2)
  }));

  return (
    <div className="w-full h-[240px] bg-black/60 rounded-xl border border-[#1E1E1E] p-4 mt-4 relative group">
      <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
        <div className="h-1.5 w-1.5 rounded-full bg-[#00FF94] animate-pulse" />
        <span className="text-[10px] font-mono text-[#666666] tracking-[0.2em] uppercase">LIVE_PROJECTION_NODE</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#444444" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#444444" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0D0D0D', 
              border: '1px solid #1E1E1E',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: '#00FF94' }}
          />
          <ReferenceLine y={data[0]} stroke="#444444" strokeDasharray="3 3" label={{ value: 'SPOT', fill: '#444444', fontSize: 9, position: 'left' }} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#00FF94" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={2000}
          />
          {/* Confidence Band */}
          <Area 
            type="monotone" 
            dataKey="upper" 
            stroke="none" 
            fill="#00FF94" 
            fillOpacity={0.05} 
          />
          <Area 
            type="monotone" 
            dataKey="lower" 
            stroke="none" 
            fill="#00FF94" 
            fillOpacity={0.05} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
