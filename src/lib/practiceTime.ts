import { createLocalStore } from "./localStore";

/**
 * Tiempo de práctica del día y plan diario, guardados en este navegador.
 */

const timeLog = createLocalStore<Record<string, number>>("fret-quest.practice-seconds", {});
const dailyGoal = createLocalStore<number>("fret-quest.daily-goal-minutes", 45);

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
