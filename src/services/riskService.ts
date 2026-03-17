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
  let recentHighTilt = false;

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    const pre = log.preGameData;
    const post = log.postGameData;

    if (pre.energy && pre.energy <= 3) lowEnergyCount += 1;

    if (post) {
      if (post.outcome === 'Loss') {
        lossStreak += 1;
      } else if (post.outcome === 'Win') {
        lossStreak = 0; // Reset streak on win
      }
      
      if (post.derivedTilt && post.derivedTilt >= 7) {
        recentHighTilt = true;
      }
    }
  }

  const latestPre = logs[logs.length - 1].preGameData;
  const preMood = latestPre.mood || 5;
  const preFocus = latestPre.focus || 5;
  const preConfidence = latestPre.confidence || 5;
  const preEnergy = latestPre.energy || 5;
  
  const preVulnerability = ((10 - preMood) + (10 - preFocus) + (10 - preConfidence)) / 3;
  
  // High Risk Conditions
  if (preVulnerability >= 7 || lossStreak >= 3 || (preEnergy <= 3 && preMood <= 3)) {
    return {
      score: 'High',
      explanation: 'High vulnerability or loss streak detected. Consider taking a break.',
    };
  }

  // Medium Risk Conditions
  if (preVulnerability >= 5 || lossStreak >= 2 || lowEnergyCount >= 2 || recentHighTilt) {
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
