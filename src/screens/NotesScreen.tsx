import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { AppHeader } from '../components/AppHeader';
import clsx from 'clsx';
import { getProfileLogs, getRecentProfileNoteLogs } from '../lib/notes';
import { getOutcomeBadge } from '../lib/formatters';

export default function NotesScreen() {
  const { activeProfileId, profiles, logs } = useStore();
  const profile = profiles.find(p => p.id === activeProfileId);

  const { notesLogs, gameNumbers } = useMemo(() => {
    if (!activeProfileId) return { notesLogs: [], gameNumbers: new Map<string, number>() };

    const profileLogs = getProfileLogs(logs, activeProfileId);
    
    // Sort all logs ascending to assign chronological game numbers
    const sortedAll = [...profileLogs].sort((a, b) => a.timestamp - b.timestamp);
    const gameNumbers = new Map<string, number>();
    sortedAll.forEach((log, index) => {
      gameNumbers.set(log.id, index + 1);
    });

    // Filter and sort the notes logs descending for display
    const notesLogs = getRecentProfileNoteLogs(logs, activeProfileId);

    return { notesLogs, gameNumbers };
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-200">
                      Game #{gameNumbers.get(log.id)}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                      {format(log.timestamp, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-bold border shrink-0 ml-4",
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
