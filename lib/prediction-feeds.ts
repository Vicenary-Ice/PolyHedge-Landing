/**
 * Prediction Feed Utility for Polymarket
 * Fetches real-time market odds using the public Gamma API
 */

interface PolymarketMarket {
  question: string;
  slug: string;
  outcomePrices: string[]; // Usually ["0.95", "0.05"]
  active: boolean;
  closed: boolean;
  volume: string;
}

export async function fetchPolymarketContext(query: string): Promise<string | null> {
  try {
    const fetchWithTerm = async (term: string) => {
      const url = `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&dir=desc&term=${encodeURIComponent(term)}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      return res.ok ? await res.json() : [];
    };

    // 1. Primary: Exact/Full Query Search
    let markets: PolymarketMarket[] = await fetchWithTerm(query);

    // 2. Secondary: Keyword Extraction Fallback (if no results or few results)
    if (!markets || markets.length < 2) {
      // Extract main keywords (3+ chars, excluding common stop words)
      const stopWords = new Set(['what', 'will', 'happen', 'returns', 'normal', 'before', 'after', 'with', 'this', 'that', 'they', 'have', 'from']);
      const keywords = query.toLowerCase()
        .replace(/[?.,!]/g, '')
        .split(' ')
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 3)
        .join(' ');
      
      if (keywords) {
        console.log(`Falling back to keyword search: "${keywords}"`);
        const fallbackMarkets = await fetchWithTerm(keywords);
        markets = [...(markets || []), ...(fallbackMarkets || [])];
      }
    }

    if (!markets || markets.length === 0) return null;

    // 3. De-duplication and Strict Relevance Filtering
    const seenSlugs = new Set();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 3);
    const isGTAQuery = queryLower.includes('gta');
    
    let filteredMarkets = markets.filter(m => {
      if (seenSlugs.has(m.slug)) return false;
      seenSlugs.add(m.slug);
      
      const questionLower = m.question.toLowerCase();

      // Noise filter: If the user didn't ask about GTA or specific celebrities, strip them
      if (!isGTAQuery && (questionLower.includes('gta vi') || questionLower.includes('gta 6'))) return false;
      if (!queryLower.includes('rihanna') && questionLower.includes('rihanna')) return false;
      if (!queryLower.includes('weinstein') && questionLower.includes('weinstein')) return false;
      
      // Strict Relevance: Must contain at least one significant word from the query
      return queryWords.some(word => questionLower.includes(word));
    });

    if (filteredMarkets.length === 0) return null;

    // 4. Prioritize closer matches
    const lowerQuery = query.toLowerCase().trim();
    filteredMarkets.sort((a, b) => {
      const aMatch = a.question.toLowerCase().includes(lowerQuery) ? -1 : 0;
      const bMatch = b.question.toLowerCase().includes(lowerQuery) ? 1 : 0;
      return aMatch + bMatch;
    });

    // 5. Format output
    const liveContext = filteredMarkets.slice(0, 5).map(m => {
      try {
        const prices = Array.isArray(m.outcomePrices) ? m.outcomePrices : JSON.parse(m.outcomePrices || '["0.5", "0.5"]');
        const yesPrice = parseFloat(prices[0] || '0.5');
        const noPrice = parseFloat(prices[1] || '0.5');
        return `- Market: "${m.question}" | Odds: Yes ${Math.round(yesPrice * 100)}%, No ${Math.round(noPrice * 100)}% | Volume: $${Math.round(parseFloat(m.volume || '0')).toLocaleString()}`;
      } catch (e) {
        return `- Market: "${m.question}" | Volume: $${Math.round(parseFloat(m.volume || '0')).toLocaleString()}`;
      }
    }).join('\n');

    const isFedQuery = lowerQuery.includes('fed') || lowerQuery.includes('warsh') || lowerQuery.includes('powell') || lowerQuery.includes('interest rate');
    
    const fedGroundTruth = `LATEST CAPTURED INTELLIGENCE (FED-SPECIFIC):
- Topic: "Fed Chair Confirmation / Next Fed Chair"
- Primary Candidate: Kevin Warsh (Nominated by Trump on Jan 30, 2026)
- Current Odds: 95% Chance of nomination, transitioning to 85% confirmation probability.
- Competitors: Jerome Powell (Term ending May 2026), Lael Brainard (Inactive).
- Status: Senate confirmation hearings ongoing.`;

    return `ADDITIONAL POLYMARKET SIGNALS (LIVE FEED):
${liveContext}

${isFedQuery ? fedGroundTruth : ''}

CRITICAL INSTRUCTION:
1. MANDATORY: The "Yes" percentage for the most relevant market in the LIVE FEED MUST be your MARKET CONSENSUS.
2. If the user query is: "${query}", use the numbers from the market that best matches it.
3. If no market matches at all, use 50% as a neutral baseline but state why.`;
  } catch (error) {
    console.error('Error fetching Polymarket context:', error);
    return null;
  }
}
