import { LogEntry } from '../types';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export const generateInsights = (logs: LogEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  const fullLogs = logs.filter(l => l.postGameData);

  if (fullLogs.length < 2) {
    return [
      {
        id: 'not-enough-data',
        title: 'Gathering Data',
        description: 'Complete at least 2 matches to unlock personalized insights.',
        type: 'neutral',
      },
    ];
  }

  const recentLogs = fullLogs.slice(-10); // Analyze last 10 matches
  let totalWins = 0;
  let totalLosses = 0;
  let highTiltLosses = 0;
  let lowEnergyLosses = 0;

  recentLogs.forEach((log) => {
    const pre = log.preGameData;
    const post = log.postGameData!;

    if (post.outcome === 'Win') totalWins++;
    if (post.outcome === 'Loss') {
      totalLosses++;
      if (post.derivedTilt && post.derivedTilt >= 6) highTiltLosses++;
      if (pre.energy && pre.energy <= 4) lowEnergyLosses++;
    }
  });

  if (highTiltLosses >= 1) {
    insights.push({
      id: 'high-tilt-losses',
      title: 'Tilt Impact',
      description: 'You tend to lose more often when your tilt score is high. Consider a break when frustrated.',
      type: 'negative',
    });
  }

  if (lowEnergyLosses >= 1) {
    insights.push({
      id: 'low-energy-losses',
      title: 'Energy Matters',
      description: 'Low energy before a match correlates with losses. Try grabbing a snack or stretching.',
      type: 'negative',
    });
  }

  if (totalWins > totalLosses && totalWins >= 2) {
    insights.push({
      id: 'win-streak',
      title: 'In the Zone',
      description: 'You are performing well recently. Keep up the good work!',
      type: 'positive',
    });
  }

  // If we have no specific insights but have enough data, provide a generic one
  if (insights.length === 0) {
    insights.push({
      id: 'stable-performance',
      title: 'Stable Performance',
      description: 'Your performance is currently stable. Keep tracking to find more patterns.',
      type: 'neutral',
    });
  }

  return insights;
};
