import { LogEntry } from '../types';

export const calculateDerivedTilt = (
  currentPreGame: Record<string, any>,
  currentPostGame: Record<string, any>,
  recentLogs: LogEntry[]
): number => {
  // Base tilt from post-game frustration (if available, else 1)
  let tilt = currentPostGame.frustration || 1;

  // Outcome impact
  if (currentPostGame.outcome === 'Loss') {
    tilt += 2;
  } else if (currentPostGame.outcome === 'Win') {
    tilt -= 1;
  }

  // Pre-game state impact (low energy/mood/focus/confidence -> higher tilt vulnerability)
  const preGameAvg = ['energy', 'mood', 'focus', 'confidence'].reduce((acc, field) => {
    return acc + (currentPreGame[field] || 5);
  }, 0) / 4;

  if (preGameAvg < 4) tilt += 1;

  // Post-game state impact
  if (currentPostGame.energy < 4) tilt += 0.5;
  if (currentPostGame.mood < 4) tilt += 1;

  // Recent trend impact (loss streaks)
  let lossStreak = 0;
  for (let i = recentLogs.length - 1; i >= 0; i--) {
    if (recentLogs[i].postGameData?.outcome === 'Loss') {
      lossStreak++;
    } else if (recentLogs[i].postGameData?.outcome === 'Win') {
      break;
    }
  }
  if (lossStreak >= 2) tilt += 1.5;

  // Normalize 1-10
  return Math.max(1, Math.min(10, Math.round(tilt)));
};

export const getTiltLabel = (tilt: number): 'Low' | 'Moderate' | 'High' => {
  if (tilt >= 8) return 'High';
  if (tilt >= 5) return 'Moderate';
  return 'Low';
};
