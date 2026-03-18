import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { generateInsights } from '../services/insightService';
import { BrainCircuit, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { AppHeader } from '../components/AppHeader';

export default function InsightsScreen() {
  const { activeProfileId, profiles, logs } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const profileLogs = logs.filter(l => l.profileId === activeProfileId);
  
  const insights = useMemo(() => generateInsights(profileLogs), [profileLogs]);

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <AppHeader title="Insights" />

      <div className="space-y-4">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={clsx(
              "rounded-2xl p-5 border",
              insight.type === 'positive' ? 'bg-emerald-950/20 border-emerald-900/50' :
              insight.type === 'negative' ? 'bg-rose-950/20 border-rose-900/50' :
              'bg-zinc-900 border-zinc-800'
            )}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center",
                insight.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                insight.type === 'negative' ? 'bg-rose-500/20 text-rose-400' :
                'bg-zinc-800 text-zinc-400'
              )}>
                {insight.type === 'positive' ? <TrendingUp size={16} /> :
                 insight.type === 'negative' ? <TrendingDown size={16} /> :
                 <AlertCircle size={16} />}
              </div>
              <h3 className="font-semibold text-zinc-100">{insight.title}</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed ml-11">
              {insight.description}
            </p>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
            No insights available yet.
          </div>
        )}
      </div>
    </div>
  );
}
