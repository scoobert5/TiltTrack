export function formatDuration(ms: number): string {
  if (ms < 0) return '0m';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getOutcomeBadge(outcome: string | undefined) {
  if (outcome === 'Win') return { label: 'W', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  if (outcome === 'Loss') return { label: 'L', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  if (outcome === 'Draw') return { label: 'D', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
  return { label: '-', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' };
}
