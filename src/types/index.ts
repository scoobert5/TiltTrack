export type FieldType = 'slider' | 'segmented' | 'number' | 'text';

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  min?: number;
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
  derivedTilt?: number;
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
  
  // Actions
  createProfile: (name: string) => void;
  setActiveProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  resetProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  updateProfileSettings: (id: string, settings: Profile['settings']) => void;
  
  addPreGameLog: (profileId: string, data: Record<string, any>) => string; // returns logId
  addPostGameLog: (logId: string, data: Record<string, any>, derivedTilt: number) => void;
}
