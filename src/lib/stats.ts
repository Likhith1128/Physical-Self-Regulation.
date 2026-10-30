import { DAILY_TARGETS, EXERCISES, ExerciseId } from './content';
import { dateKey } from './date';
import { AppState, DayLog, emptyDay } from './store';

export type Summary = {
  days: number;
  exerciseAdherence: Record<ExerciseId, number>;
  avgClenchEpisodes: number;
  totalCheckIns: number;
  avgBreathingMinutes: number;
  breathingSessions: number;
  avgPain: number | null;
};

export function summarize(state: AppState, keys: string[]): Summary {
  const logs: DayLog[] = keys.map((k) => state.logs[k] ?? emptyDay());
  const n = Math.max(1, logs.length);
  const sum = (f: (d: DayLog) => number) => logs.reduce((t, d) => t + f(d), 0);

  const exerciseAdherence = Object.fromEntries(
    EXERCISES.map((e) => [
      e.id,
      sum((d) => Math.min(DAILY_TARGETS.exercisePracticesPerDay, d.exercises[e.id])) /
        (n * DAILY_TARGETS.exercisePracticesPerDay),
    ]),
  ) as Record<ExerciseId, number>;

  const rated = logs.filter((d) => d.painRating !== null);

  return {
    days: logs.length,
    exerciseAdherence,
    avgClenchEpisodes: sum((d) => d.clenchEpisodes) / n,
    totalCheckIns: sum((d) => d.checkIns),
    avgBreathingMinutes: sum((d) => d.breathingMinutes) / n,
    breathingSessions: sum((d) => d.breathingSessions),
    avgPain: rated.length ? rated.reduce((t, d) => t + (d.painRating ?? 0), 0) / rated.length : null,
  };
}

export function daysSince(startKey: string, endKey: string) {
  const [y, m, d] = startKey.split('-').map(Number);
  const keys: string[] = [];
  const cursor = new Date(y, m - 1, d);
  for (let i = 0; i < 366; i++) {
    const k = dateKey(cursor);
    keys.push(k);
    if (k >= endKey) break;
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export const pct = (v: number) => `${Math.round(v * 100)}%`;
