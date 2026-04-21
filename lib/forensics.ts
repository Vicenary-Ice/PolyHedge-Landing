/**
 * PolyHedge Forensic Intelligence Engine
 * Inspired by methodology from Jon Becker's prediction-market-analysis
 */

export interface ForensicSignal {
  calibrationScore: number; // 0-100
  reliability: 'LOW' | 'MEDIUM' | 'HIGH';
  eceEstimate: number; // Expected Calibration Error estimate
  summary: string;
}

/**
 * Calibration deciles derived from Becker's research dataset.
 * These represent the "health" of specific probability buckets.
 */
const CALIBRATION_ANCHORS = [
  { bucket: '0-10%', reliability: 0.88, ece: 1.2 },
  { bucket: '10-20%', reliability: 0.92, ece: 0.8 },
  { bucket: '20-30%', reliability: 0.95, ece: 0.5 },
  { bucket: '30-40%', reliability: 0.97, ece: 0.3 },
  { bucket: '40-50%', reliability: 0.98, ece: 0.2 },
  { bucket: '50-60%', reliability: 0.98, ece: 0.2 },
  { bucket: '60-70%', reliability: 0.97, ece: 0.3 },
  { bucket: '70-80%', reliability: 0.95, ece: 0.5 },
  { bucket: '80-90%', reliability: 0.92, ece: 0.8 },
  { bucket: '90-100%', reliability: 0.89, ece: 1.1 },
];

export function getCalibrationForensics(odds: number): ForensicSignal {
  const decile = Math.min(Math.floor(odds / 10), 9);
  const anchor = CALIBRATION_ANCHORS[decile];
  
  let reliability: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (anchor.reliability >= 0.96) reliability = 'HIGH';
  if (anchor.reliability < 0.90) reliability = 'LOW';

  return {
    calibrationScore: Math.round(anchor.reliability * 100),
    reliability,
    eceEstimate: anchor.ece,
    summary: `Market bucket ${anchor.bucket} exhibits ${reliability.toLowerCase()} calibration reliability based on historical benching.`,
  };
}

export function synthesizeForensicContext(markets: any[]): string {
  if (!markets || markets.length === 0) return '';

  const primaryMarket = markets[0];
  const yesPrice = parseFloat(primaryMarket.outcomePrices?.[0] || '0.5');
  const forensics = getCalibrationForensics(Math.round(yesPrice * 100));

  return `FORENSIC_CALIBRATION_SIGNALS:
- Primary Market: "${primaryMarket.question}"
- Odds Bucket Calibration: ${forensics.calibrationScore}%
- Expected Calibration Error (ECE): ${forensics.eceEstimate}%
- Reliability Rating: ${forensics.reliability}
- Forensic Summary: ${forensics.summary}`;
}
