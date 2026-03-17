import { LogEntry } from '../types';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export const generateInsights = (logs: LogEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  const completedLogs = logs.filter(l => l.postGameData);

  if (completedLogs.length < 2) {
    return [
      {
        id: 'not-enough-data',
        title: 'Gathering Data',
        description: 'Play a few more matches to unlock personalized insights.',
        type: 'neutral',
      },
    ];
  }

  const recentLogs = completedLogs.slice(-10); // Analyze last 10 matches
  let totalWins = 0;
  let totalLosses = 0;
  let highTiltLosses = 0;
  let lowEnergyLosses = 0;

  recentLogs.forEach((log) => {
    const pre = log.preGameData;
    const post = log.postGameData;

    if (post) {
      if (post.outcome === 'Win') totalWins++;
      if (post.outcome === 'Loss') {
        totalLosses++;
        if (log.derivedTilt && log.derivedTilt >= 6) highTiltLosses++;
        if (pre.energy <= 4) lowEnergyLosses++;
      }
    }
  });

  if (highTiltLosses >= 2) {
    insights.push({
      id: 'high-tilt-losses',
      title: 'Tilt Impact',
      description: 'You tend to lose more often when starting a match with high tilt. Consider a break when frustrated.',
      type: 'negative',
    });
  }

  if (lowEnergyLosses >= 2) {
    insights.push({
      id: 'low-energy-losses',
      title: 'Energy Matters',
      description: 'Low energy before a match correlates with losses. Try grabbing a snack or stretching.',
      type: 'negative',
    });
  }

  if (totalWins > totalLosses && totalWins >= 3) {
    insights.push({
      id: 'win-streak',
      title: 'In the Zone',
      description: 'You are performing well recently. Keep up the good work!',
      type: 'positive',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      title: 'Steady Performance',
      description: 'Your performance is stable. Keep tracking to uncover deeper patterns.',
      type: 'neutral',
    });
  }

  return insights;
};
