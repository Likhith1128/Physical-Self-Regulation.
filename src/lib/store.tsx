import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ExerciseId, StrategyId } from './content';
import { dateKey } from './date';

export type DayLog = {
  exercises: Record<ExerciseId, number>;
  breathingSessions: number;
  breathingMinutes: number;
  clenchEpisodes: number;
  checkIns: number;
  painRating: number | null;
};

export type ReminderSettings = {
  clenchCheckIns: boolean;
  intervalMinutes: number;
  startHour: number;
  endHour: number;
  exerciseReminders: boolean;
  breathingReminders: boolean;
};

export type AppState = {
  logs: Record<string, DayLog>;
  discontinued: Partial<Record<ExerciseId, { date: string; note: string }>>;
  strategies: Record<StrategyId, boolean>;
  habitAnchors: string[];
  reminders: ReminderSettings;
  sessions: { session1: string | null; session2: string | null };
  plan: { review: string; notes: string; goals: { id: string; text: string; done: boolean }[] };
};

const STORAGE_KEY = 'psr-state-v1';

export const emptyDay = (): DayLog => ({
  exercises: { masseter: 0, neck: 0, upperBack: 0 },
  breathingSessions: 0,
  breathingMinutes: 0,
  clenchEpisodes: 0,
  checkIns: 0,
  painRating: null,
});

export const defaultState = (): AppState => ({
  logs: {},
  discontinued: {},
  strategies: { alarm: true, anchors: false, tracking: true },
  habitAnchors: [],
  reminders: {
    clenchCheckIns: false,
    intervalMinutes: 60,
    startHour: 8,
    endHour: 21,
    exerciseReminders: false,
    breathingReminders: false,
  },
  sessions: { session1: null, session2: null },
  plan: { review: '', notes: '', goals: [] },
});

type Store = {
  state: AppState;
  ready: boolean;
  today: DayLog;
  update: (fn: (s: AppState) => AppState) => void;
  updateDay: (fn: (d: DayLog) => DayLog, key?: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

const mergeLoaded = (raw: Partial<AppState>): AppState => {
  const base = defaultState();
  return {
    ...base,
    ...raw,
    strategies: { ...base.strategies, ...raw.strategies },
    reminders: { ...base.reminders, ...raw.reminders },
    sessions: { ...base.sessions, ...raw.sessions },
    plan: { ...base.plan, ...raw.plan },
  };
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setState(mergeLoaded(JSON.parse(json)));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const updateDay = useCallback((fn: (d: DayLog) => DayLog, key: string = dateKey()) => {
    setState((s) => {
      const current = s.logs[key] ?? emptyDay();
      return { ...s, logs: { ...s.logs, [key]: fn({ ...current, exercises: { ...current.exercises } }) } };
    });
  }, []);

  const reset = useCallback(() => setState(defaultState()), []);

  const today = state.logs[dateKey()] ?? emptyDay();

  const value = useMemo(
    () => ({ state, ready, today, update, updateDay, reset }),
    [state, ready, today, update, updateDay, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
