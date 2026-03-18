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
  for (let i = logs.length - 1; i >= 0; i--) {
    const post = logs[i].postGameData;
    if (post) {
      if (post.outcome === 'Loss') {
        lossStreak += 1;
      } else {
        break;
      }
    }
  }

  const last3Posts = logs.map(l => l.postGameData).filter(Boolean).slice(-3);
  const recentHighTilt = last3Posts.some(p => p!.derivedTilt && p!.derivedTilt >= 65);
  const recentFrustrationTrend = last3Posts.filter(p => p!.frustration && p!.frustration >= 4).length;

  const latestLog = logs[logs.length - 1];
  const latestPre = latestLog.preGameData;
  const latestPost = latestLog.postGameData;
  
  // 1. Tilt Level (Primary Factor)
  let currentTilt = 0;
  if (latestPost && latestPost.derivedTilt !== undefined) {
    currentTilt = latestPost.derivedTilt;
  } else if (logs.length > 1) {
    const prevPost = logs[logs.length - 2].postGameData;
    if (prevPost && prevPost.derivedTilt !== undefined) {
      currentTilt = prevPost.derivedTilt;
    }
  }

  // 2. Vulnerability / Instability Signals
  const preMood = Number(latestPre.mood) || 3;
  const preFocus = Number(latestPre.focus) || 3;
  const preConfidence = Number(latestPre.confidence) || 3;
  const preEnergy = Number(latestPre.energy) || 3;
  
  // 1-5 scale, lower is more vulnerable. 
  // (6 - value) / 5 gives 20% for 5, 100% for 1
  const preVulnerability = ((6 - preMood) + (6 - preFocus) + (6 - preConfidence)) / 15 * 100;
  
  // High Risk Conditions
  if (currentTilt >= 65 || lossStreak >= 3 || preVulnerability >= 80 || (preEnergy <= 2 && preMood <= 2)) {
    return {
      score: 'High',
      explanation: 'High tilt or vulnerability detected. Consider taking a break.',
    };
  }

  // Medium Risk Conditions
  if (currentTilt >= 35 || lossStreak >= 2 || preVulnerability >= 60 || recentHighTilt || recentFrustrationTrend >= 2) {
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
