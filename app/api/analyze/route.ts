import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { fetchPolymarketContext } from '@/lib/prediction-feeds';
import { synthesizeForensicContext } from '@/lib/forensics';
import { getPostHogClient } from '@/lib/posthog-server';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const OBSERVER_LIMIT = 3;
const MODEL = 'meta/llama-3.1-8b-instruct';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] --- API Analyze Request Received ---`);
  
  try {
    const { topic, type } = await request.json();

    if (!topic || !type) {
      return NextResponse.json({ error: 'Topic and type are required' }, { status: 400 });
    }

    // Enforce search limit server-side using the user's JWT
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (accessToken) {
      const userSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      );
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        const { data: usage } = await userSupabase
          .from('search_usage')
          .select('search_count')
          .eq('user_id', user.id)
          .single();
        const count = usage?.search_count ?? 0;
        if (count >= OBSERVER_LIMIT) {
          return NextResponse.json({ error: 'Search limit reached. Please upgrade your plan.' }, { status: 429 });
        }
        // Increment count
        await userSupabase.from('search_usage').upsert(
          { user_id: user.id, search_count: count + 1, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      }
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: requestId,
      event: 'analysis_requested',
      properties: { topic, type, request_id: requestId },
    });
    await posthog.flush();

    if (!NVIDIA_API_KEY) {
      console.error(`[${requestId}] NVIDIA_API_KEY is not configured`);
      return NextResponse.json({ error: 'API key missing in server environment' }, { status: 500 });
    }

    const systemPrompt = type === 'stock' 
      ? `You are a Senior Macro Intelligence Analyst (v5.0-INSTITUTIONAL). 
         Role: Quantitative Lead / Systematic Alpha Research.
         Tonality: Cold, extremely professional, dense institutional prose. 
         
         STRICT RULES:
         1. FORBIDDEN: Markdown bolding (**text**). DO NOT use double asterisks for any reason.
         2. FORBIDDEN: Bulleted key-value lists. Use dense, well-structured paragraphs.
         3. EMPHASIS: Use CAPITAL LETTERS sparingly for emphasis instead of bolding.
         4. HEADER_FORMAT: Use '### [NODE_NAME]' for sections.

         STRUCTURE:
         ### [THESIS_EXECUTIVE_SUMMARY]
         A dense paragraph summarizing the current alpha thesis for "${topic}".
         
         ### [VECTORED_ATTRIBUTION_FEED]
         A 2-paragraph deep-dive into fundamental metrics and asymmetric signals for "${topic}".
         
         ### [QUANT_PROJECTION_MODEL]
         Analysis of the price discovery path and confidence intervals.
         
         ### [STRATEGIC_PULSE_VERDICT]
         INDICATOR: "SIGNAL: POSITIVE" or "SIGNAL: CAUTION".
         CONFIDENCE_RATING: XX%

         EXAMPLE PROSE (Follow this tone exactly):
         THE MACRO LANDSCAPE FOR ${topic.toUpperCase()} REMAINS COMPRESSION-HEAVY. INSTITUTIONAL FLOW INDICATES A SIGNIFICANT PIVOT IN ACCUMULATION VECTORS. OPERATIONAL MARGINS ARE PROJECTED TO EXPAND BY 120BPS...

         <ANALYSIS_METADATA>
         RISK: 42
         MOMENTUM: 78
         VOLATILITY: 15
         FLOW: 85
         CHART: [10, 20, 25, 30, 45, 40, 55, 70]
         </ANALYSIS_METADATA>

         REQUIRED METADATA BLOCK:
         Include the <ANALYSIS_METADATA> block at the very end. 
         CHART values should represent the PRICE PROJECTION sequence.`
       : `You are a Chief Forensic Forecaster (v5.3-SWARM).
         Role: Probabilistic Wedge Discovery / Swarm Arbitrage.
         Tonality: Dense, forensic, objective professional prose. 
         
         STRICT RULES:
         1. FORBIDDEN: Markdown bolding (**text**).
         2. FORBIDDEN: Bulleted key-value lists. Use dense paragraphs.
         3. SYMBOLS: DO NOT use square brackets [] around numbers. Output raw integers.
         4. HEADER_FORMAT: Use '### [NODE_NAME]'.
         
         OBJECTIVE:
         Analyze "${topic}" by identifying the "Value Wedge"—the discrepancy between your Forensic Probability and the Market Consensus.
         
         STRUCTURE:
         ### [FORECAST_SWARM_THESIS]
         A dense paragraph on the probabilistic landscape for "${topic}". State your FORENSIC PROBABILITY (e.g. 85%).
         
         ### [MARKET_CONSENSUS_FRICTION]
         State the exact "Yes" percentage from the most relevant market in the LIVE FEED. 
         MANDATORY: Name the market you are using (e.g. "Utilizing odds for: [Market Name]").
         If no relevant market exists in the feed, state "NO LIVE MARKET DETECTED" and use a 50% synthetic baseline for comparison.
         
         ### [FORENSIC_INTELLIGENCE]
         Using the provided FORENSIC_CALIBRATION_SIGNALS, analyze the reliability of the current market odds. State the ECE (Expected Calibration Error) and provide a verdict on "Calibration Health".
         
         ### [PROBABILISTIC_PIVOT_DECAY]
         Forensic breakdown of outcome trees and time-decay variance for "${topic}".
         
         ### [STRATEGIC_PULSE_VERDICT]
         INDICATOR: "SIGNAL: VALUE WEDGE" or "SIGNAL: ASYMMETRIC RISK" or "SIGNAL: FAIR VALUE".
         ADVISORY: "LONG YES" (if AI > Market), "LONG NO" (if AI < Market), or "NEUTRAL" (if delta < 5%).
         WEDGE_MAGNITUDE: XX% (The absolute delta between your forensic prob and the market consensus).

         EXAMPLE PROSE (Neutral tone):
         THE SENTIMENT VECTORS FOR THE TOPIC EXHIBIT A DISCREPANCY RELATIVE TO SWARM VECTORS. UTILIZING ODDS FOR: "${topic.toUpperCase()}", THE MARKET PRICES THE OUTCOME AT 29%...
         
         <ANALYSIS_METADATA>
         RISK: 42
         HEAT: 88
         EDGE: [The absolute difference between Forensic Prob and Market Consensus]
         CALIBRATION: [The calibration score from forensic signals]
         VOLATILITY: 20
         CHART: [20, 25, 30, 45, 50, 65, 75, 80]
         </ANALYSIS_METADATA>

         REQUIRED METADATA BLOCK:
         The EDGE value in <ANALYSIS_METADATA> must be the raw integer of your WEDGE_MAGNITUDE calculation.
         The CALIBRATION value must be the integer from the FORENSIC_CALIBRATION_SIGNALS.
         CHART values should represent the PROBABILITY MOMENTUM PATH.`;

    let finalPrompt = systemPrompt;

    // --- LIVE FEED INTEGRATION ---
    if (type === 'prediction') {
      console.log(`[${requestId}] Fetching live prediction feeds for: ${topic}`);
      const marketsRes = await fetch(`https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=10&order=volume&dir=desc&term=${encodeURIComponent(topic)}`);
      const markets = marketsRes.ok ? await marketsRes.json() : [];
      
      const liveContext = await fetchPolymarketContext(topic);
      const forensicContext = synthesizeForensicContext(markets);
      
      console.log(`[${requestId}] Live context and forensics acquired.`);
      finalPrompt = `${systemPrompt}\n\n${liveContext}\n\n${forensicContext}\n\nCURRENT DATE: April 2026`;
    } else {
      finalPrompt = `${systemPrompt}\n\nCURRENT DATE: April 2026`;
    }

    console.log(`[${requestId}] Calling NVIDIA API for model: ${MODEL} (Extended Context)...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: `${finalPrompt}\n\nAnalyze: ${topic}` }],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 2048, // Increased length
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = 'NVIDIA API error';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorMsg;
        } catch (e) {}
        return NextResponse.json({ error: errorMsg }, { status: response.status });
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content;
      
      console.log(`[${requestId}] Success: Full report generated (${analysis.length} chars)`);
      return NextResponse.json({ analysis });

    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') return NextResponse.json({ error: 'Timeout' }, { status: 504 });
      throw fetchError;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
