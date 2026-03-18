import { LogEntry } from '../types';

export interface RecentMatchContext {
  logId: string;
  timestamp: number;
  outcome?: 'Win' | 'Loss' | 'Draw';
  note?: string;
  derivedTilt?: number;
  tiltLabel?: string;
}

export interface ProfileAIContext {
  profileId: string;
  totalLogs: number;
  totalLogsWithNotes: number;
  recentMatches: RecentMatchContext[];
  recentNotes: Array<{
    logId: string;
    timestamp: number;
    note: string;
    outcome?: 'Win' | 'Loss' | 'Draw';
    derivedTilt?: number;
    tiltLabel?: string;
  }>;
  hasEnoughData: boolean;
}

export function hasValidNote(log: LogEntry): boolean {
  return typeof log.postGameData?.note === 'string' && log.postGameData.note.trim().length > 0;
}

export function getProfileLogs(logs: LogEntry[], profileId: string): LogEntry[] {
  return logs.filter(log => log.profileId === profileId);
}

export function getRecentProfileLogs(logs: LogEntry[], profileId: string, limit: number = 10): LogEntry[] {
  const profileLogs = getProfileLogs(logs, profileId);
  return [...profileLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export function toRecentMatchContext(log: LogEntry): RecentMatchContext {
  return {
    logId: log.id,
    timestamp: log.timestamp,
    outcome: log.postGameData?.outcome as 'Win' | 'Loss' | 'Draw' | undefined,
    note: hasValidNote(log) ? log.postGameData!.note.trim() : undefined,
    derivedTilt: log.postGameData?.derivedTilt,
    tiltLabel: log.postGameData?.tiltLabel,
  };
}

export interface AIContextOptions {
  recentMatchLimit?: number;
  recentNoteLimit?: number;
}

export function getProfileAIContext(logs: LogEntry[], profileId: string, options?: AIContextOptions): ProfileAIContext {
  const profileLogs = getProfileLogs(logs, profileId);
  const totalLogs = profileLogs.length;
  
  const logsWithNotes = profileLogs.filter(hasValidNote);
  const totalLogsWithNotes = logsWithNotes.length;
  
  const recentMatchLimit = options?.recentMatchLimit ?? 10;
  const recentNoteLimit = options?.recentNoteLimit ?? 3;
  
  const recentLogs = getRecentProfileLogs(logs, profileId, recentMatchLimit);
  const recentMatches = recentLogs.map(toRecentMatchContext);
  
  const recentNotesLogs = [...logsWithNotes]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, recentNoteLimit);
    
  const recentNotes = recentNotesLogs.map(log => ({
    logId: log.id,
    timestamp: log.timestamp,
    note: log.postGameData!.note.trim(),
    outcome: log.postGameData?.outcome as 'Win' | 'Loss' | 'Draw' | undefined,
    derivedTilt: log.postGameData?.derivedTilt,
    tiltLabel: log.postGameData?.tiltLabel,
  }));
  
  const completedLogs = profileLogs.filter(l => l.postGameData !== undefined).length;
  const hasEnoughData = completedLogs >= 3 || totalLogsWithNotes >= 2;
  
  return {
    profileId,
    totalLogs,
    totalLogsWithNotes,
    recentMatches,
    recentNotes,
    hasEnoughData
  };
}
