import React from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { formatDuration } from '../lib/formatters';

export default function RawDataScreen() {
  const { activeProfileId, profiles, logs } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const profileLogs = logs.filter(l => l.profileId === activeProfileId).sort((a, b) => b.timestamp - a.timestamp);

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <AppHeader title="Raw Data" />

      <div className="space-y-4">
        {profileLogs.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
            No logs recorded yet.
          </div>
        ) : (
          profileLogs.map((log) => (
            <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-400">
                    {format(log.timestamp, 'MMM d, yyyy • h:mm a')}
                  </span>
                  {log.matchDurationMs !== undefined && (
                    <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
                      Duration: {formatDuration(log.matchDurationMs)}
                    </span>
                  )}
                </div>
                {log.postGameData?.outcome && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    log.postGameData.outcome === 'Win' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.postGameData.outcome === 'Loss' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {log.postGameData.outcome}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Pre-Game</h4>
                  <ul className="space-y-1 text-zinc-300">
                    <li>Energy: <span className="font-mono text-indigo-400">{log.preGameData.energy}</span></li>
                    <li>Mood: <span className="font-mono text-indigo-400">{log.preGameData.mood}</span></li>
                    <li>Focus: <span className="font-mono text-indigo-400">{log.preGameData.focus}</span></li>
                    <li>Confidence: <span className="font-mono text-indigo-400">{log.preGameData.confidence}</span></li>
                  </ul>
                </div>
                {log.postGameData ? (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Post-Game</h4>
                    <ul className="space-y-1 text-zinc-300">
                      <li>Energy: <span className="font-mono text-indigo-400">{log.postGameData.energy}</span></li>
                      <li>Mood: <span className="font-mono text-indigo-400">{log.postGameData.mood}</span></li>
                      <li>Frustration: <span className="font-mono text-indigo-400">{log.postGameData.frustration}</span></li>
                      {log.postGameData.derivedTilt !== undefined && (
                        <li>Tilt: <span className="font-mono text-amber-400">{log.postGameData.derivedTilt}% ({log.postGameData.tiltLabel})</span></li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-zinc-600 italic text-xs h-full border border-dashed border-zinc-800 rounded-lg p-2">
                    Pending post-game log
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
