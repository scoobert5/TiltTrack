import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { generateInsights } from '../services/insightService';
import { BrainCircuit, TrendingDown, TrendingUp, AlertCircle, StickyNote, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { AppHeader } from '../components/AppHeader';
import { getProfileNotesSummary } from '../lib/notes';
import { getProfileAIContext } from '../lib/aiContext';
import { format } from 'date-fns';

export default function InsightsScreen() {
  const { activeProfileId, profiles, logs } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const profileLogs = logs.filter(l => l.profileId === activeProfileId);
  
  const insights = useMemo(() => generateInsights(profileLogs), [profileLogs]);
  const notesSummary = useMemo(() => getProfileNotesSummary(logs, activeProfileId!), [logs, activeProfileId]);
  const aiContext = useMemo(() => getProfileAIContext(logs, activeProfileId!), [logs, activeProfileId]);

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <AppHeader title="Insights" />

      <div className="space-y-4">
        {/* Notes Summary Block */}
        {notesSummary.hasNotes && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                <StickyNote size={16} />
              </div>
              <h3 className="font-semibold text-zinc-100">Notes Logged: {notesSummary.totalNotes}</h3>
            </div>
            
            <div className="space-y-3">
              {notesSummary.recentNotes.map((noteEntry) => (
                <div key={noteEntry.logId} className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      {format(noteEntry.timestamp, 'MMM d, h:mm a')}
                    </span>
                    {noteEntry.outcome && (
                      <span className={clsx(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        noteEntry.outcome === 'Win' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        noteEntry.outcome === 'Loss' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      )}>
                        {noteEntry.outcome === 'Win' ? 'W' : noteEntry.outcome === 'Loss' ? 'L' : 'D'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-2">{noteEntry.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* AI Readiness Block */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-400">
              <Sparkles size={16} />
            </div>
            <h3 className="font-semibold text-zinc-100">AI Foundation</h3>
          </div>
          <div className="ml-11 space-y-1">
            {aiContext.hasEnoughData ? (
              <p className="text-sm text-emerald-400">Enough data collected for future reflection features.</p>
            ) : (
              <p className="text-sm text-zinc-400">Collecting data for future reflection features...</p>
            )}
            <p className="text-xs text-zinc-500">
              {aiContext.totalLogs} total matches • {aiContext.totalLogsWithNotes} recent notes available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
