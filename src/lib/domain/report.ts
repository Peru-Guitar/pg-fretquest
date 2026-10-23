import type { Level } from "./catalog";
import { isLessonDone } from "./progress";

/** Sesión de progreso completada (el modo práctica no se registra). */
export interface PracticeEntry {
  id: string;
  exerciseId: string;
  /** Tiempo efectivo de práctica, sin pausas. */
  minutes: number;
  bpm: number;
  xp: number;
  /** Puntuación técnica 0-100 y si cumplió las condiciones de aprobación. */
  score?: number;
  approved?: boolean;
  notesPct?: number;
  rhythmPct?: number;
  validReps?: number;
  invalidReps?: number;
  /** Momento en que terminó el temporizador (ms). */
  at: number;
}

export interface DayTotal {
  date: string;
  minutes: number;
}

export interface Report {
  totalMinutes: number;
  sessions: number;
  daysPracticed: number;
  /** Días seguidos con práctica hasta hoy (o hasta ayer, si hoy aún no hubo). */
  streak: number;
  weekMinutes: number;
  monthMinutes: number;
  /** Últimos 14 días, del más antiguo a hoy. */
  lastDays: DayTotal[];
  /** Minutos por fecha, para el calendario. */
  minutesByDate: Record<string, number>;
  levels: { number: number; title: string; done: number; total: number }[];
  exercisesDone: number;
  exercisesTotal: number;
  totalXP: number;
}

/** Ejercicios con al menos una sesión de progreso aprobada. */
export function completedExercises(entries: PracticeEntry[]): Set<string> {
  return new Set(entries.filter((e) => e.approved !== false).map((e) => e.exerciseId));
}

/** XP de una sesión de progreso: 10 por minuto, con un extra por tocar más rápido. */
export function xpForSession(minutes: number, bpm: number): number {
  return Math.round(minutes * 10 * (1 + Math.max(0, bpm - 60) / 120));
}

export interface ExerciseHistory {
  sessions: number;
  bestBpm: number | null;
  /** Sesiones de este ejercicio, de la más antigua a la más reciente. */
  entries: PracticeEntry[];
}

export function exerciseHistory(entries: PracticeEntry[], exerciseId: string): ExerciseHistory {
  const mine = entries.filter((e) => e.exerciseId === exerciseId).sort((a, b) => a.at - b.at);
  return {
    sessions: mine.length,
    bestBpm: mine.length ? Math.max(...mine.map((e) => e.bpm)) : null,
    entries: mine,
  };
}

/** YYYY-MM-DD en la zona horaria local. */
export function dateKey(at: number | Date): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

/** Lunes de la semana de `key`. */
export function weekStart(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return addDays(key, -((dow + 6) % 7));
}

export function computeReport(entries: PracticeEntry[], levels: Level[], now: number): Report {
  const today = dateKey(now);
  const minutesByDate: Record<string, number> = {};
  for (const e of entries) {
    const k = dateKey(e.at);
    minutesByDate[k] = (minutesByDate[k] ?? 0) + e.minutes;
  }

  let day = minutesByDate[today] ? today : addDays(today, -1);
  let streak = 0;
  while (minutesByDate[day]) {
    streak++;
    day = addDays(day, -1);
  }

  const monday = weekStart(today);
  const month = today.slice(0, 7);
  const sumWhere = (pred: (k: string) => boolean) =>
    Object.entries(minutesByDate).reduce((acc, [k, m]) => (pred(k) ? acc + m : acc), 0);

  const completed = completedExercises(entries);
  const allExercises = levels.flatMap((l) => l.lessons.flatMap((x) => x.exercises));

  return {
    totalMinutes: entries.reduce((acc, e) => acc + e.minutes, 0),
    sessions: entries.length,
    daysPracticed: Object.keys(minutesByDate).length,
    streak,
    weekMinutes: sumWhere((k) => k >= monday && k <= today),
    monthMinutes: sumWhere((k) => k.startsWith(month)),
    lastDays: Array.from({ length: 14 }, (_, i) => {
      const date = addDays(today, i - 13);
      return { date, minutes: minutesByDate[date] ?? 0 };
    }),
    minutesByDate,
    levels: levels.map((l) => ({
      number: l.number,
      title: l.title,
      done: l.lessons.filter((x) => isLessonDone(x, completed)).length,
      total: l.lessons.length,
    })),
    exercisesDone: allExercises.filter((e) => completed.has(e.id)).length,
    exercisesTotal: allExercises.length,
    totalXP: entries.reduce((acc, e) => acc + e.xp, 0),
  };
}
