import { LogEntry } from '../types';

export function getProfileLogs(logs: LogEntry[], profileId: string): LogEntry[] {
  return logs.filter(log => log.profileId === profileId);
}

export function hasValidNote(log: LogEntry): boolean {
  return typeof log.postGameData?.note === 'string' && log.postGameData.note.trim().length > 0;
}

export function getProfileNoteLogs(logs: LogEntry[], profileId: string): LogEntry[] {
  return getProfileLogs(logs, profileId).filter(hasValidNote);
}

export function getRecentProfileNoteLogs(logs: LogEntry[], profileId: string, limit?: number): LogEntry[] {
  const noteLogs = getProfileNoteLogs(logs, profileId);
  const sorted = [...noteLogs].sort((a, b) => b.timestamp - a.timestamp);
  return limit !== undefined ? sorted.slice(0, limit) : sorted;
}

export interface ProfileNotesSummary {
  totalNotes: number;
  hasNotes: boolean;
  recentNotes: Array<{
    logId: string;
    timestamp: number;
    outcome?: string;
    note: string;
    matchDurationMs?: number;
  }>;
}

export function getProfileNotesSummary(logs: LogEntry[], profileId: string): ProfileNotesSummary {
  const recentLogs = getRecentProfileNoteLogs(logs, profileId, 3);
  const totalNotes = getProfileNoteLogs(logs, profileId).length;

  return {
    totalNotes,
    hasNotes: totalNotes > 0,
    recentNotes: recentLogs.map(log => ({
      logId: log.id,
      timestamp: log.timestamp,
      outcome: log.postGameData?.outcome,
      note: log.postGameData!.note.trim(),
      matchDurationMs: log.matchDurationMs
    }))
  };
}
