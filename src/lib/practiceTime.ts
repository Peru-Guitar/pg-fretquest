import { createLocalStore } from "./localStore";
import { DAILY_PLAN_BONUS, levelFromPoints } from "./points";

/**
 * Tiempo real de práctica, puntos y sesiones, guardados en este navegador.
 * Todo se registra al terminar una sesión de Práctica y valorarla.
 */

const timeLog = createLocalStore<Record<string, number>>("fret-quest.practice-seconds", {});
const dailyGoal = createLocalStore<number>("fret-quest.daily-goal-minutes", 45);
const pointsTotal = createLocalStore<number>("fret-quest.points", 0);

/** Opciones de plan diario en minutos. */
export const DAILY_GOAL_OPTIONS = [15, 30, 45, 60, 90];

const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function addPracticeSeconds(seconds: number) {
  if (seconds < 1) return;
  const log = timeLog.get();
  const today = dayKey();
  timeLog.set({ ...log, [today]: (log[today] ?? 0) + Math.round(seconds) });
}

/** Plan del día y minutos practicados hoy. */
export function useDailyPractice() {
  const seconds = timeLog.use()[dayKey()] ?? 0;
  const goal = dailyGoal.use();
  const remainingSeconds = Math.max(0, goal * 60 - seconds);
  return { goal, seconds, remaining: Math.ceil(remainingSeconds / 60), done: remainingSeconds === 0, setGoal: dailyGoal.set };
}

/** Sesión de Práctica terminada, con su valoración honesta (1–5) y los puntos ganados. */
export type SessionRecord = { at: string; lessonId: string; bpm: number; rounds: number; seconds: number; rating: number; points: number };
const sessionLog = createLocalStore<SessionRecord[]>("fret-quest.sessions", []);

/**
 * Registra la sesión al valorarla: suma tiempo y puntos, y el bono del plan diario
 * si esta sesión es la que lo completa. Devuelve lo ganado y el nivel antes y después.
 */
export function saveSession(session: Omit<SessionRecord, "at">) {
  const goalSeconds = dailyGoal.get() * 60;
  const before = timeLog.get()[dayKey()] ?? 0;
  sessionLog.set([...sessionLog.get(), { ...session, at: new Date().toISOString() }]);
  addPracticeSeconds(session.seconds);
  const bonus = before < goalSeconds && before + session.seconds >= goalSeconds ? DAILY_PLAN_BONUS : 0;
  const previous = pointsTotal.get();
  pointsTotal.set(previous + session.points + bonus);
  return { points: session.points, bonus, from: levelFromPoints(previous), to: levelFromPoints(previous + session.points + bonus) };
}

/** Puntos totales y nivel actual. */
export function usePlayerLevel() {
  return levelFromPoints(pointsTotal.use());
}
