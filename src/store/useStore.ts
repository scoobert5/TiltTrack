import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, LogEntry, Profile, Session } from '../types';
import { defaultFields } from '../config/defaultFields';
import { calculateDerivedTilt } from '../services/tiltCalculation';

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      logs: [],
      sessions: [],

      createProfile: (name) => {
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          name,
          createdAt: Date.now(),
          settings: {
            fields: defaultFields,
          },
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          activeProfileId: state.activeProfileId || newProfile.id,
        }));
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          logs: state.logs.filter((l) => l.profileId !== id),
          sessions: state.sessions.filter((s) => s.profileId !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        }));
      },

      updateProfileSettings: (id, settings) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, settings } : p
          ),
        }));
      },

      resetProfileLogs: (id) => {
        set((state) => ({
          logs: state.logs.filter((l) => l.profileId !== id),
          sessions: state.sessions.filter((s) => s.profileId !== id),
        }));
      },

      renameProfile: (id, newName) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name: newName } : p
          ),
        }));
      },

      addPreGameLog: (profileId, data) => {
        const now = Date.now();
        const state = get();
        
        // Find or create session
        let currentSession = state.sessions
          .filter(s => s.profileId === profileId)
          .sort((a, b) => b.endTime - a.endTime)[0];

        let sessionId = '';
        let newSessions = [...state.sessions];

        if (!currentSession || (now - currentSession.endTime > SESSION_TIMEOUT_MS)) {
          // Create new session
          sessionId = crypto.randomUUID();
          currentSession = {
            id: sessionId,
            profileId,
            startTime: now,
            endTime: now,
            logIds: [],
          };
          newSessions.push(currentSession);
        } else {
          sessionId = currentSession.id;
          // Update session end time
          newSessions = newSessions.map(s => 
            s.id === sessionId ? { ...s, endTime: now } : s
          );
        }

        const newLog: LogEntry = {
          id: crypto.randomUUID(),
          profileId,
          timestamp: now,
          preGameData: data,
          sessionId,
        };

        // Update session logIds
        newSessions = newSessions.map(s => 
          s.id === sessionId ? { ...s, logIds: [...s.logIds, newLog.id] } : s
        );

        set({
          logs: [...state.logs, newLog],
          sessions: newSessions,
        });

        return newLog.id;
      },

      addPostGameLog: (logId, data) => {
        set((state) => {
          const log = state.logs.find(l => l.id === logId);
          if (!log) return state;

          const recentLogs = state.logs
            .filter(l => l.profileId === log.profileId && l.postGameData)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);

          const tiltResult = calculateDerivedTilt(log.preGameData, data, recentLogs);
          const postGameDataWithTilt = { ...data, derivedTilt: tiltResult.score, tiltLabel: tiltResult.label };

          return {
            logs: state.logs.map((l) =>
              l.id === logId ? { ...l, postGameData: postGameDataWithTilt } : l
            ),
          };
        });
      },
    }),
    {
      name: 'tilttrack-storage',
    }
  )
);
