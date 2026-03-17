import { LogEntry } from '../types';

export interface TiltResult {
  score: number; // 1-10
  label: 'Low' | 'Moderate' | 'High';
}

export function calculateDerivedTilt(
  preGameData: Record<string, any>,
  postGameData: Record<string, any>,
  recentLogs: LogEntry[]
): TiltResult {
  // Base values (default to neutral if missing)
  const preEnergy = preGameData.energy || 5;
  const preMood = preGameData.mood || 5;
  const preFocus = preGameData.focus || 5;
  const preConfidence = preGameData.confidence || 5;

  const postEnergy = postGameData.energy || 5;
  const postMood = postGameData.mood || 5;
  const postFrustration = postGameData.frustration || 1;
  const outcome = postGameData.outcome || 'Draw';

  // 1. Pre-game vulnerability (0-10)
  // Low mood, low focus, low confidence increase vulnerability
  const preVulnerability = ((10 - preMood) + (10 - preFocus) + (10 - preConfidence)) / 3;

  // 2. Post-game impact (0-10)
  // High frustration, drop in mood, drop in energy
  const moodDrop = Math.max(0, preMood - postMood);
  const energyDrop = Math.max(0, preEnergy - postEnergy);
  const postImpact = (postFrustration * 1.5 + moodDrop + energyDrop * 0.5) / 3;

  // 3. Outcome multiplier
  let outcomeMultiplier = 1.0;
  if (outcome === 'Loss') outcomeMultiplier = 1.3;
  if (outcome === 'Win') outcomeMultiplier = 0.8;

  // 4. Recent trend (last 3 matches)
  let trendPenalty = 0;
  if (recentLogs.length > 0) {
    const recentLosses = recentLogs.slice(-3).filter(l => l.postGameData?.outcome === 'Loss').length;
    trendPenalty = recentLosses * 0.5; // Up to +1.5 for a loss streak
  }

  // Calculate raw score
  let rawTilt = ((preVulnerability * 0.3) + (postImpact * 0.7)) * outcomeMultiplier + trendPenalty;

  // Normalize to 1-10
  let score = Math.max(1, Math.min(10, Math.round(rawTilt)));

  // Determine label
  let label: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 7) label = 'High';
  else if (score >= 4) label = 'Moderate';

  return { score, label };
}
