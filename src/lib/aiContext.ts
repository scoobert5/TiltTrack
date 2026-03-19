import { LogEntry } from '../types';
import { hasValidNote, getProfileLogs, getProfileNoteLogs, getRecentProfileNoteLogs } from './notes';

export interface RecentMatchContext {
  logId: string;
  timestamp: number;
  outcome?: 'Win' | 'Loss' | 'Draw';
  note?: string;
  derivedTilt?: number;
  tiltLabel?: string;
  matchDurationMs?: number;
}

export interface ProfileAIContext {
  profileId: string;
  totalLogs: number;
  totalCompletedMatches: number;
  totalLogsWithNotes: number;
  recentMatches: RecentMatchContext[];
  recentNotes: Array<{
    logId: string;
    timestamp: number;
    note: string;
    outcome?: 'Win' | 'Loss' | 'Draw';
    derivedTilt?: number;
    tiltLabel?: string;
    matchDurationMs?: number;
  }>;
  averageRecentMatchDurationMs?: number;
  hasEnoughData: boolean;
}

export function isCompletedMatch(log: LogEntry): boolean {
  return log.postGameData !== undefined;
}

export function getRecentProfileLogs(logs: LogEntry[], profileId: string, limit: number = 10): LogEntry[] {
  const profileLogs = getProfileLogs(logs, profileId);
  return [...profileLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export function getRecentCompletedProfileLogs(logs: LogEntry[], profileId: string, limit: number = 10): LogEntry[] {
  const profileLogs = getProfileLogs(logs, profileId).filter(isCompletedMatch);
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
    matchDurationMs: log.matchDurationMs,
  };
}

export interface AIContextOptions {
  recentMatchLimit?: number;
  recentNoteLimit?: number;
}

export function getProfileAIContext(logs: LogEntry[], profileId: string, options?: AIContextOptions): ProfileAIContext {
  const profileLogs = getProfileLogs(logs, profileId);
  const totalLogs = profileLogs.length;
  
  const completedLogs = profileLogs.filter(isCompletedMatch);
  const totalCompletedMatches = completedLogs.length;
  
  const logsWithNotes = getProfileNoteLogs(logs, profileId);
  const totalLogsWithNotes = logsWithNotes.length;
  
  const recentMatchLimit = options?.recentMatchLimit ?? 10;
  const recentNoteLimit = options?.recentNoteLimit ?? 3;
  
  const recentCompletedLogs = getRecentCompletedProfileLogs(logs, profileId, recentMatchLimit);
  const recentMatches = recentCompletedLogs.map(toRecentMatchContext);
  
  const recentNotesLogs = getRecentProfileNoteLogs(logs, profileId, recentNoteLimit);
    
  const recentNotes = recentNotesLogs.map(log => ({
    logId: log.id,
    timestamp: log.timestamp,
    note: log.postGameData!.note.trim(),
    outcome: log.postGameData?.outcome as 'Win' | 'Loss' | 'Draw' | undefined,
    derivedTilt: log.postGameData?.derivedTilt,
    tiltLabel: log.postGameData?.tiltLabel,
    matchDurationMs: log.matchDurationMs,
  }));
  
  const hasEnoughData = totalCompletedMatches >= 3 || totalLogsWithNotes >= 2;
  
  const logsWithDuration = recentCompletedLogs.filter(l => l.matchDurationMs !== undefined);
  const averageRecentMatchDurationMs = logsWithDuration.length > 0
    ? logsWithDuration.reduce((sum, l) => sum + l.matchDurationMs!, 0) / logsWithDuration.length
    : undefined;
  
  return {
    profileId,
    totalLogs,
    totalCompletedMatches,
    totalLogsWithNotes,
    recentMatches,
    recentNotes,
    averageRecentMatchDurationMs,
    hasEnoughData
  };
}

export interface ReflectionEligibility {
  isEligible: boolean;
  reasons: string[];
  metrics: {
    completedMatches: number;
    notesCount: number;
  };
}

export interface ReflectionPayload {
  profileId: string;
  generatedAt: number;

  summary: {
    totalCompletedMatches: number;
    totalNotes: number;
    averageMatchDurationMs?: number;
  };

  recentMatches: Array<{
    logId: string;
    timestamp: number;
    outcome?: 'Win' | 'Loss' | 'Draw';
    derivedTilt?: number;
    tiltLabel?: string;
    matchDurationMs?: number;
    hasNote: boolean;
  }>;

  recentNotes: Array<{
    logId: string;
    timestamp: number;
    note: string;
    outcome?: 'Win' | 'Loss' | 'Draw';
    derivedTilt?: number;
    tiltLabel?: string;
    matchDurationMs?: number;
  }>;

  metadata: {
    hasEnoughData: boolean;
    recentMatchCount: number;
    recentNoteCount: number;
    eligibility: ReflectionEligibility;
  };
}

export function evaluateReflectionEligibility(payload: ReflectionPayload): ReflectionEligibility {
  const completedMatches = payload.summary.totalCompletedMatches;
  const notesCount = payload.summary.totalNotes;
  
  const reasons: string[] = [];
  let isEligible = false;
  
  if (completedMatches >= 3 || notesCount >= 2) {
    isEligible = true;
    reasons.push("Eligible for reflection");
  } else {
    if (completedMatches < 3) {
      reasons.push("Not enough completed matches (need 3)");
    }
    if (notesCount < 2) {
      reasons.push("Not enough notes (need 2)");
    }
  }
  
  return {
    isEligible,
    reasons,
    metrics: {
      completedMatches,
      notesCount
    }
  };
}

export function getReflectionPayload(logs: LogEntry[], profileId: string, options?: AIContextOptions): ReflectionPayload {
  const recentMatchLimit = options?.recentMatchLimit ?? 10;
  const recentNoteLimit = options?.recentNoteLimit ?? 5;
  
  const context = getProfileAIContext(logs, profileId, {
    recentMatchLimit,
    recentNoteLimit,
  });

  const payload: ReflectionPayload = {
    profileId: context.profileId,
    generatedAt: Date.now(),
    summary: {
      totalCompletedMatches: context.totalCompletedMatches,
      totalNotes: context.totalLogsWithNotes,
      averageMatchDurationMs: context.averageRecentMatchDurationMs,
    },
    recentMatches: context.recentMatches.map(match => ({
      logId: match.logId,
      timestamp: match.timestamp,
      outcome: match.outcome,
      derivedTilt: match.derivedTilt,
      tiltLabel: match.tiltLabel,
      matchDurationMs: match.matchDurationMs,
      hasNote: match.note !== undefined,
    })),
    recentNotes: context.recentNotes.map(note => ({
      logId: note.logId,
      timestamp: note.timestamp,
      note: note.note,
      outcome: note.outcome,
      derivedTilt: note.derivedTilt,
      tiltLabel: note.tiltLabel,
      matchDurationMs: note.matchDurationMs,
    })),
    metadata: {
      hasEnoughData: context.hasEnoughData,
      recentMatchCount: context.recentMatches.length,
      recentNoteCount: context.recentNotes.length,
      eligibility: {
        isEligible: false,
        reasons: [],
        metrics: { completedMatches: 0, notesCount: 0 }
      }
    }
  };

  payload.metadata.eligibility = evaluateReflectionEligibility(payload);

  return payload;
}
