export type FieldType = 'slider' | 'segmented' | 'number' | 'text';

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  max?: number;
  step?: number;
  defaultValue: any;
  required: boolean;
  enabled: boolean;
  category: 'pre-game' | 'post-game';
  affectsCoreLogic: boolean;
  options?: string[]; // for segmented
}

export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  settings: {
    fields: FieldConfig[];
  };
}

export interface LogEntry {
  id: string;
  profileId: string;
  timestamp: number;
  preGameData: Record<string, any>;
  postGameData?: Record<string, any>;
  sessionId: string;
  matchStartedAt?: number;
  matchEndedAt?: number;
  matchDurationMs?: number;
}

export interface Session {
  id: string;
  profileId: string;
  startTime: number;
  endTime: number;
  logIds: string[];
}

export interface AppState {
  profiles: Profile[];
  activeProfileId: string | null;
  logs: LogEntry[];
  sessions: Session[];
  
  preGameDraft: Record<string, any> | null;
  postGameDraft: Record<string, any> | null;
  
  // Actions
  createProfile: (name: string) => void;
  setActiveProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  updateProfileSettings: (id: string, settings: Profile['settings']) => void;
  resetProfileLogs: (id: string) => void;
  renameProfile: (id: string, newName: string) => void;
  
  setPreGameDraft: (draft: Record<string, any> | null) => void;
  setPostGameDraft: (draft: Record<string, any> | null) => void;
  
  addPreGameLog: (profileId: string, data: Record<string, any>) => string; // returns logId
  addPostGameLog: (logId: string, data: Record<string, any>) => void;
}
