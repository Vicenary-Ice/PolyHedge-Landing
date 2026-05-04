import { BarChart3, FileText, Landmark, Newspaper } from 'lucide-react';
import React from 'react';

export const ACCENT = '#00FF94';
export const CHART_WIDTH = 900;
export const CHART_HEIGHT = 238;

export type DemoType = 'stock' | 'prediction';

export type SourceConfig = {
  id: string;
  label: string;
  icon: React.ElementType;
  confidenceDelta: number;
  chartDrag: number;
};

export type TerminalConfig = {
  env: string;
  title: string;
  placeholder: string;
  defaultQuery: string;
  signalLabel: string;
  signalSubLabel: string;
  statusLabel: string;
  statusFallback: string;
  date: string;
  rail: string;
  fallbackConfidence: number;
  fallbackChart: number[];
  probeLabel: string;
  xLabels: string[];
  sources: SourceConfig[];
};

export type SignalModel = {
  confidence: number;
  chartValues: number[];
  status: string;
  secondaryStatus: string;
  probeIndex: number;
  probeValue: number;
  probeRatio: string;
};

export type LiveSignalSnapshot = {
  confidence?: number;
  chartValues?: number[];
  status?: string;
  secondaryStatus?: string;
};

export const CONFIG: Record<DemoType, TerminalConfig> = {
  stock: {
    env: 'STOCK_DATA_ENV',
    title: 'Institutional Equity Search',
    placeholder: 'NVDA, AAPL, TSLA...',
    defaultQuery: 'NVDA',
    signalLabel: 'Signal',
    signalSubLabel: 'Confidence',
    statusLabel: 'Status',
    statusFallback: 'POSITIVE',
    date: 'MAY 03 2026   09:41:28 ET',
    rail: '',
    fallbackConfidence: 82,
    fallbackChart: [18, 22, 28, 31, 37, 42, 43, 46, 51, 54, 58, 63, 68, 72, 76, 79, 82],
    probeLabel: 'T-17D',
    xLabels: ['T-60D', 'T-45D', 'T-30D', 'T-15D', 'T-7D', 'EVENT'],
    sources: [
      { id: 'filings', label: 'Filings', icon: FileText, confidenceDelta: 3, chartDrag: 3.5 },
      { id: 'news', label: 'News', icon: Newspaper, confidenceDelta: -1, chartDrag: -1.5 },
      { id: 'flow', label: 'Flow', icon: BarChart3, confidenceDelta: 2, chartDrag: 2.5 },
    ],
  },
  prediction: {
    env: 'PREDICTION_MARKETS_ENV',
    title: 'Predictive Event Search',
    placeholder: 'Fed Rate Decision, SpaceX Launch...',
    defaultQuery: 'Fed Rate Decision',
    signalLabel: 'Forensic probability',
    signalSubLabel: 'Probability',
    statusLabel: 'Advisory',
    statusFallback: 'LONG YES',
    date: 'MAY 03 2026   09:41:28 ET',
    rail: 'POLYHEDGE TERMINAL',
    fallbackConfidence: 64,
    fallbackChart: [19, 22, 25, 28, 31, 34, 36, 39, 41, 44, 48, 51, 54, 58, 61, 63, 64],
    probeLabel: 'T-17D',
    xLabels: ['T-30D', 'T-25D', 'T-20D', 'T-15D', 'T-10D', 'EVENT'],
    sources: [
      { id: 'polymarket', label: 'Polymarket', icon: BarChart3, confidenceDelta: 2, chartDrag: 2.5 },
      { id: 'news', label: 'News', icon: Newspaper, confidenceDelta: 1, chartDrag: 1.5 },
      { id: 'regulatory', label: 'Regulatory', icon: Landmark, confidenceDelta: -1, chartDrag: -1 },
    ],
  },
};

export function clamp(value: number, min = 4, max = 96) {
  return Math.min(max, Math.max(min, value));
}

function metadata(analysis: string | null) {
  if (!analysis) return '';
  return (
    analysis.match(/<ANALYSIS_METADATA>([\s\S]*?)<\/ANALYSIS_METADATA>/i)?.[1] ||
    analysis.match(/ANALYSIS_METADATA([\s\S]*?)$/i)?.[1] ||
    ''
  );
}

function metric(analysis: string | null, key: string, fallback: number) {
  const match = metadata(analysis).match(new RegExp(`${key}:\\s*\\[?(\\d+)\\]?`, 'i'));
  return match ? Number.parseInt(match[1], 10) : fallback;
}

function confidence(analysis: string | null, fallback: number) {
  if (!analysis) return fallback;
  const match =
    analysis.match(/CONFIDENCE_RATING:\s*(\d+)%?/i) ||
    analysis.match(/CONFIDENCE:\s*(\d+)%?/i) ||
    analysis.match(/FORENSIC PROBABILITY\s*(?:is estimated at|at|:)?\s*(\d+)%/i);
  return match ? Number.parseInt(match[1], 10) : fallback;
}

function parsedChart(analysis: string | null) {
  const match = metadata(analysis).match(/CHART:\s*\[(.*?)\]/i);
  if (!match) return null;
  const values = match[1]
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter(Number.isFinite);
  return values.length > 3 ? values : null;
}

function advisory(analysis: string | null, type: DemoType, fallback: string) {
  if (type === 'stock') {
    const upper = analysis?.toUpperCase() ?? '';
    return upper.includes('CAUTION') || upper.includes('DO NOT INVEST') ? 'CAUTION' : fallback;
  }

  return analysis?.match(/ADVISORY:\s*"?([^"\n]+)"?/i)?.[1]?.trim().toUpperCase() || fallback;
}

function interpolateSeries(values: number[], points = 28) {
  if (values.length >= points) return values;
  return Array.from({ length: points }, (_, index) => {
    const position = (index / (points - 1)) * (values.length - 1);
    const left = Math.floor(position);
    const right = Math.min(values.length - 1, left + 1);
    const mix = position - left;
    return values[left] + (values[right] - values[left]) * mix;
  });
}

function fitSeriesToConfidence(values: number[], targetConfidence: number) {
  const interpolated = interpolateSeries(values);
  const final = interpolated.at(-1) ?? targetConfidence;
  const delta = targetConfidence - final;
  return interpolated.map((value, index) => {
    const progress = index / Math.max(interpolated.length - 1, 1);
    const texture = Math.sin(index * 1.7) * 1.4 + Math.cos(index * 0.75) * 0.9;
    return clamp(value + delta * progress + texture);
  });
}

function adjustForSources(values: number[], confidenceValue: number, config: TerminalConfig, activeSources: string[]) {
  const allDelta = config.sources.reduce((sum, source) => sum + source.confidenceDelta, 0);
  const activeDelta = config.sources
    .filter((source) => activeSources.includes(source.id))
    .reduce((sum, source) => sum + source.confidenceDelta, 0);
  const missingCount = config.sources.length - activeSources.length;
  const adjustedConfidence = clamp(Math.round(confidenceValue + activeDelta - allDelta - missingCount * 4), 8, 94);
  const chartDrag = config.sources
    .filter((source) => !activeSources.includes(source.id))
    .reduce((sum, source) => sum + source.chartDrag, 0);

  const adjusted = values.map((value, index) => {
    const progress = index / Math.max(values.length - 1, 1);
    return clamp(value - missingCount * 2.5 * progress - chartDrag * progress);
  });

  return {
    confidence: adjustedConfidence,
    values: fitSeriesToConfidence(adjusted, adjustedConfidence),
  };
}

function loadingSeries(type: DemoType) {
  const config = CONFIG[type];
  return fitSeriesToConfidence(
    config.fallbackChart.map((value, index) => value - 4 + Math.sin(index * 0.9) * 3),
    config.fallbackConfidence - 3,
  );
}

export function buildSignalModel(
  type: DemoType,
  analysis: string | null,
  isSearching: boolean,
  activeSources: string[],
  liveSignal?: LiveSignalSnapshot | null,
): SignalModel {
  const config = CONFIG[type];
  const baseConfidence = liveSignal?.confidence ?? (isSearching ? config.fallbackConfidence - 3 : confidence(analysis, config.fallbackConfidence));
  const baseSeries = isSearching
    ? liveSignal?.chartValues ?? loadingSeries(type)
    : fitSeriesToConfidence(parsedChart(analysis) ?? config.fallbackChart, baseConfidence);
  const adjusted = adjustForSources(baseSeries, baseConfidence, config, activeSources);
  const probeIndex = Math.min(Math.max(Math.round(adjusted.values.length * 0.68), 1), adjusted.values.length - 2);
  const probeValue = adjusted.values[probeIndex] ?? adjusted.confidence;
  const edge = metric(analysis, 'EDGE', 14);

  return {
    confidence: adjusted.confidence,
    chartValues: adjusted.values,
    status: liveSignal?.status ?? (isSearching ? 'SCANNING' : advisory(analysis, type, config.statusFallback)),
    secondaryStatus: liveSignal?.secondaryStatus ?? (type === 'prediction' ? `VALUE WEDGE ${edge}%` : 'UPDATED 09:41:28 ET'),
    probeIndex,
    probeValue,
    probeRatio: (probeValue / 100).toFixed(type === 'stock' ? 3 : 2),
  };
}

export function subjectFor(type: DemoType, query: string) {
  const config = CONFIG[type];
  const value = query.trim() || config.defaultQuery;
  return type === 'stock' ? value.toUpperCase() : value;
}

function compactTopicCode(subject: string) {
  const words = subject
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !['will', 'the', 'a', 'an', 'in', 'on', 'by', 'to', 'of', 'for', 'and', 'or'].includes(word.toLowerCase()))
    .slice(0, 4);
  return (words.length ? words : subject.split(/\s+/).slice(0, 3)).join(' ').toUpperCase();
}

export function subjectMeta(type: DemoType, subject: string) {
  const cleanSubject = subject.trim();
  const upperSubject = cleanSubject.toUpperCase();

  if (type === 'prediction') {
    const topicCode = compactTopicCode(cleanSubject);
    if (/FED|FOMC|RATE|INFLATION|CPI/.test(upperSubject)) return `MACRO POLICY | ${topicCode}`;
    if (/ELECTION|PRESIDENT|SENATE|HOUSE|VOTE/.test(upperSubject)) return `POLITICAL EVENT | ${topicCode}`;
    if (/BITCOIN|BTC|ETH|CRYPTO|SOLANA/.test(upperSubject)) return `CRYPTO MARKET | ${topicCode}`;
    if (/LAUNCH|SPACEX|STARSHIP|NASA/.test(upperSubject)) return `SPACE EVENT | ${topicCode}`;
    if (/AI|OPENAI|NVIDIA|NVDA|MODEL/.test(upperSubject)) return `AI MARKET EVENT | ${topicCode}`;
    return `CUSTOM EVENT | ${topicCode}`;
  }

  if (subject === 'NVDA') return 'NVIDIA CORPORATION';
  if (subject === 'AAPL') return 'APPLE INC.';
  if (subject === 'TSLA') return 'TESLA INC.';
  if (/^[A-Z.]{1,7}$/.test(subject)) return `${subject} EQUITY COVERAGE`;
  if (cleanSubject) return `${compactTopicCode(cleanSubject)} EQUITY QUERY`;
  return 'INSTITUTIONAL EQUITY';
}
