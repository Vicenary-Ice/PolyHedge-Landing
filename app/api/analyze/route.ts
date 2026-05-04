import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPostHogClient } from '@/lib/posthog-server';

type AnalysisType = 'stock' | 'prediction';

type AnalyzeBody = {
  topic?: string;
  type?: AnalysisType;
  sources?: string[];
};

const BACKEND_URL = process.env.POLYHEDGE_ANALYSIS_BACKEND_URL ?? 'http://127.0.0.1:8000';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const TIER_LIMITS: Record<string, number> = {
  Observer: 3,
  Trader: 50,
  Quant: 1000,
};
const DEMO_KEY_MARKERS = ['dummy', 'demo', 'local'];

function shouldUseDemoAnalysis() {
  if (process.env.POLYHEDGE_DEMO_MODE === 'true') return true;
  if (process.env.NODE_ENV === 'production') return false;
  if (!NVIDIA_API_KEY) return false;
  return DEMO_KEY_MARKERS.some((marker) => NVIDIA_API_KEY.toLowerCase().includes(marker));
}

function buildDemoAnalysis(topic: string, type: AnalysisType) {
  if (type === 'stock') {
    return `### [THESIS_EXECUTIVE_SUMMARY]
${topic.toUpperCase()} is running through the realtime backend fallback path. The terminal is showing the exact event shape used by the live Python engine: market data, filings, technicals, narrative, risk, and final synthesis. The provisional signal is constructive, but it is marked as fallback data until the backend service is online.

### [VECTORED_ATTRIBUTION_FEED]
The fallback engine simulates a blended feed made from price momentum, institutional flow, volatility compression, and public narrative velocity. Production stock analysis should use the Python service with Twelve Data and SEC EDGAR enabled.

### [QUANT_PROJECTION_MODEL]
The projected path shows a controlled upward drift with moderate volatility. This validates realtime charts, agent-state rendering, and report formatting.

### [STRATEGIC_PULSE_VERDICT]
INDICATOR: "SIGNAL: POSITIVE"
CONFIDENCE_RATING: 82%

<ANALYSIS_METADATA>
RISK: 38
MOMENTUM: 76
VOLATILITY: 18
FLOW: 71
CHART: [12, 18, 24, 28, 36, 42, 49, 57]
</ANALYSIS_METADATA>`;
  }

  return `### [FORECAST_SWARM_THESIS]
${topic.toUpperCase()} is running through the realtime backend fallback path. The terminal is showing the exact event shape used by the live Python engine: market odds, liquidity, events, calibration, contradiction, and final synthesis. FORENSIC PROBABILITY is estimated at 64% for demonstration purposes.

### [MARKET_CONSENSUS_FRICTION]
NO LIVE MARKET DETECTED in fallback mode. Using a 50% synthetic baseline to validate the wedge display, chart parser, and advisory rendering.

### [FORENSIC_INTELLIGENCE]
FORENSIC_CALIBRATION_SIGNALS are synthetic. Calibration Health is MEDIUM, with an Expected Calibration Error of 0.8%. Production should replace this with current Polymarket/CLOB data plus historical calibration checks.

### [PROBABILISTIC_PIVOT_DECAY]
The simulated outcome tree shows a positive probability drift as newer signals arrive. This is not investment advice; it is a local demonstration response designed to prove the product shell works without credentials.

### [STRATEGIC_PULSE_VERDICT]
INDICATOR: "SIGNAL: VALUE WEDGE"
ADVISORY: "LONG YES"
WEDGE_MAGNITUDE: 14%

<ANALYSIS_METADATA>
RISK: 42
HEAT: 68
EDGE: 14
CALIBRATION: 92
VOLATILITY: 20
CHART: [42, 45, 49, 52, 57, 61, 64, 66]
</ANALYSIS_METADATA>`;
}

function sse(event: string, data: Record<string, unknown>) {
  return `event: ${event}\ndata: ${JSON.stringify({ type: event, ...data })}\n\n`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function demoAgents(type: AnalysisType, sources: string[]) {
  const sourceSet = new Set(sources);
  if (type === 'stock') {
    return [
      'market_data',
      ...(sourceSet.has('filings') ? ['filings'] : []),
      ...(sourceSet.has('flow') ? ['technicals'] : []),
      ...(sourceSet.has('news') ? ['news_context'] : []),
      'risk',
      'stock_synthesis',
    ];
  }
  return [
    ...(sourceSet.has('polymarket') ? ['market_odds', 'market_liquidity'] : []),
    ...(sourceSet.has('news') ? ['news_context'] : []),
    ...(sourceSet.has('regulatory') ? ['calibration', 'contradiction'] : []),
    'prediction_synthesis',
  ];
}

function createDemoStream(topic: string, type: AnalysisType, sources: string[]) {
  const encoder = new TextEncoder();
  const agents = demoAgents(type, sources);
  const chart = type === 'stock' ? [12, 18, 24, 28, 36, 42, 49, 57] : [42, 45, 49, 52, 57, 61, 64, 66];
  const analysis = buildDemoAnalysis(topic, type);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(sse('run_started', { topic, analysisType: type, agents })));
      for (const agent of agents) {
        controller.enqueue(encoder.encode(sse('agent_started', { agent, message: 'Opening realtime fallback node.' })));
        await sleep(110);
        controller.enqueue(encoder.encode(sse('agent_progress', { agent, message: 'Compressing signal into terminal state.' })));
        await sleep(110);
        controller.enqueue(
          encoder.encode(
            sse('agent_completed', {
              agent,
              message: `${agent.replace(/_/g, ' ')} ready.`,
              data: { summary: `${agent.replace(/_/g, ' ')} ready.`, confidence: type === 'stock' ? 82 : 64 },
            }),
          ),
        );
      }
      controller.enqueue(encoder.encode(sse('chart_update', { chart, confidence: type === 'stock' ? 82 : 64 })));
      controller.enqueue(
        encoder.encode(
          sse('final_result', {
            analysis,
            data:
              type === 'stock'
                ? { type, topic, analysis, chart, confidence: 82, signal: 'positive' }
                : { type, topic, analysis, chart, confidence: 64, advisory: 'LONG YES' },
          }),
        ),
      );
      controller.close();
    },
  });
}

function streamResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function proxyBackend(topic: string, type: AnalysisType, sources: string[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, type, sources }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok || !response.body) {
      return null;
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const body = (await request.json()) as AnalyzeBody;
    const topic = body.topic?.trim();
    const type = body.type;
    const sources = Array.isArray(body.sources) ? body.sources.filter(Boolean) : [];

    if (!topic || (type !== 'stock' && type !== 'prediction')) {
      return NextResponse.json({ error: 'Topic and valid type are required' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (accessToken) {
      const userSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
      );
      const {
        data: { user },
      } = await userSupabase.auth.getUser();
      if (user) {
        const tier = user.user_metadata?.tier ?? 'Observer';
        const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.Observer;
        const { data: usage } = await userSupabase.from('search_usage').select('search_count').eq('user_id', user.id).single();
        const count = usage?.search_count ?? 0;
        if (count >= limit) {
          return NextResponse.json({ error: 'Search limit reached. Please upgrade your plan.' }, { status: 429 });
        }
        await userSupabase.from('search_usage').upsert(
          { user_id: user.id, search_count: count + 1, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
      }
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: requestId,
      event: 'analysis_requested',
      properties: { topic, type, request_id: requestId, realtime_backend: true },
    });
    await posthog.flush();

    if (!shouldUseDemoAnalysis()) {
      const backendResponse = await proxyBackend(topic, type, sources);
      if (backendResponse) return backendResponse;
    }

    return streamResponse(createDemoStream(topic, type, sources.length > 0 ? sources : defaultSources(type)));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function defaultSources(type: AnalysisType) {
  return type === 'stock' ? ['filings', 'news', 'flow'] : ['polymarket', 'news', 'regulatory'];
}
