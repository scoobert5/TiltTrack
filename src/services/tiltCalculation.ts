import { LogEntry } from '../types';

export interface TiltResult {
  score: number; // 0-100 percentage
  label: 'Low' | 'Moderate' | 'High';
}

export function calculateDerivedTilt(
  preGameData: Record<string, any>,
  postGameData: Record<string, any>,
  recentLogs: LogEntry[]
): TiltResult {
  // Base values (default to neutral 3 if missing, since scale is 1-5)
  const preEnergy = Number(preGameData.energy) || 3;
  const preMood = Number(preGameData.mood) || 3;
  const preFocus = Number(preGameData.focus) || 3;
  const preConfidence = Number(preGameData.confidence) || 3;

  const postEnergy = Number(postGameData.energy) || 3;
  const postMood = Number(postGameData.mood) || 3;
  const postFrustration = Number(postGameData.frustration) || 3;
  const outcome = postGameData.outcome || 'Draw';

  // 1. Pre-game vulnerability (0-100)
  // Inverted: (6 - value) / 5 gives 20% for 5, 100% for 1
  const preVulnerability = ((6 - preMood) + (6 - preFocus) + (6 - preConfidence)) / 15 * 100;

  // 2. Post-game impact (0-100)
  const frustrationFactor = postFrustration / 5; // 20% to 100%
  const moodDrop = Math.max(0, preMood - postMood) / 4; // 0 to 1
  const energyDrop = Math.max(0, preEnergy - postEnergy) / 4; // 0 to 1
  
  const postImpact = (frustrationFactor * 0.6 + moodDrop * 0.2 + energyDrop * 0.2) * 100;

  // 3. Outcome multiplier
  let outcomeMultiplier = 1.0;
  if (outcome === 'Loss') outcomeMultiplier = 1.2;
  if (outcome === 'Win') outcomeMultiplier = 0.8;

  // 4. Recent trend (last 3 matches)
  let trendPenalty = 0;
  if (recentLogs.length > 0) {
    const recentLosses = recentLogs.slice(-3).filter(l => l.postGameData?.outcome === 'Loss').length;
    trendPenalty = recentLosses * 10; // Up to +30%
  }

  // Calculate raw score
  let rawTilt = ((preVulnerability * 0.3) + (postImpact * 0.7)) * outcomeMultiplier + trendPenalty;

  // Normalize to 0-100
  let score = Math.max(0, Math.min(100, Math.round(rawTilt)));

  // Determine label
  let label: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 65) label = 'High';
  else if (score >= 35) label = 'Moderate';

  return { score, label };
}
