import { LogEntry } from '../types';

export type RiskScore = 'Low' | 'Medium' | 'High';

export interface RiskResult {
  score: RiskScore;
  explanation: string;
}

export const calculateRiskScore = (recentLogs: LogEntry[]): RiskResult => {
  if (recentLogs.length === 0) {
    return { score: 'Low', explanation: 'No recent data. Good luck!' };
  }

  // Only look at the last 5 logs for risk
  const logs = recentLogs.slice(-5);
  
  let lossStreak = 0;
  let lowEnergyCount = 0;
  let recentTilt = 0;

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    const pre = log.preGameData;
    const post = log.postGameData;

    if (pre.energy <= 3) lowEnergyCount += 1;
    if (log.derivedTilt && log.derivedTilt >= 7) recentTilt += 1;

    if (post && post.outcome === 'Loss') {
      lossStreak += 1;
    } else if (post && post.outcome === 'Win') {
      lossStreak = 0; // Reset streak on win
    }
  }

  const latestLog = logs[logs.length - 1];
  const latestPre = latestLog.preGameData;
  const lastDerivedTilt = latestLog.postGameData ? latestLog.derivedTilt : (logs.length > 1 ? logs[logs.length - 2].derivedTilt : 0);
  
  // High Risk Conditions
  if ((lastDerivedTilt && lastDerivedTilt >= 8) || lossStreak >= 3 || (latestPre.energy <= 3 && latestPre.mood <= 3)) {
    return {
      score: 'High',
      explanation: 'High tilt or loss streak detected. Consider taking a break.',
    };
  }

  // Medium Risk Conditions
  if ((lastDerivedTilt && lastDerivedTilt >= 6) || lossStreak >= 2 || lowEnergyCount >= 2 || (latestPre.focus && latestPre.focus <= 4)) {
    return {
      score: 'Medium',
      explanation: 'Moderate risk. Stay focused and monitor your frustration.',
    };
  }

  return {
    score: 'Low',
    explanation: 'Conditions look good. Queue up!',
  };
};
