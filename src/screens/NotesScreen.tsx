import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { AppHeader } from '../components/AppHeader';
import clsx from 'clsx';
import { LogEntry } from '../types';

// Tiny structural helper to check if a log has a valid note
const hasValidNote = (log: LogEntry): boolean => {
  return typeof log.postGameData?.note === 'string' && log.postGameData.note.trim().length > 0;
};

// Tiny structural helper to map outcome to W/L/D
const getOutcomeBadge = (outcome: string | undefined) => {
  if (outcome === 'Win') return { label: 'W', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  if (outcome === 'Loss') return { label: 'L', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  if (outcome === 'Draw') return { label: 'D', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
  return { label: '-', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' };
};

export default function NotesScreen() {
  const { activeProfileId, profiles, logs } = useStore();
  const profile = profiles.find(p => p.id === activeProfileId);

  const notesLogs = useMemo(() => {
    return logs
      .filter(l => l.profileId === activeProfileId && hasValidNote(l))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, activeProfileId]);

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <AppHeader title="Notes" />

      <div className="space-y-4">
        {notesLogs.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
            <p className="font-medium text-zinc-400 mb-1">No notes yet.</p>
            <p className="text-sm">Notes from your post-game logs will appear here.</p>
          </div>
        ) : (
          notesLogs.map(log => {
            const badge = getOutcomeBadge(log.postGameData?.outcome);
            return (
              <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {format(log.timestamp, 'MMM d, h:mm a')}
                  </span>
                  <div className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-bold border",
                    badge.color
                  )}>
                    {badge.label}
                  </div>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {log.postGameData!.note.trim()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
