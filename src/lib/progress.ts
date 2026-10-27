import { useMemo } from "react";
import { completedExercises, type PracticeEntry } from "@/lib/domain/report";
import { createLocalStore } from "@/lib/localStore";

/** Sesiones de progreso completadas. */
const log = createLocalStore<PracticeEntry[]>("fretquest.sessions", []);

/**
 * Registra una práctica completada. `id` identifica esa vuelta del temporizador,
 * así recargar la página con el tiempo ya cumplido no la cuenta dos veces.
 */
export function recordPractice(entry: PracticeEntry) {
  const current = log.get();
  if (current.some((e) => e.id === entry.id)) return;
  log.set([...current, entry]);
}

export const usePracticeLog = log.use;

/** Ejercicios con al menos una sesión de progreso aprobada. */
export function useCompletedExercises(): ReadonlySet<string> {
  const entries = usePracticeLog();
  return useMemo(() => completedExercises(entries), [entries]);
}

const profile = createLocalStore<{ name: string }>("fretquest.profile", { name: "Guitarrista" });
export const useProfile = profile.use;
export const setProfileName = (name: string) => profile.set({ name });

/** Niveles desplegados en la ruta; null = solo el nivel actual. Se conserva al volver de practicar. */
const openLevels = createLocalStore<number[] | null>("fretquest.openLevels", null);
export const useOpenLevels = openLevels.use;
export const setOpenLevels = openLevels.set;

/** Último ejercicio abierto, para retomarlo desde el inicio. Es lo único que se recuerda de la práctica. */
const lastExercise = createLocalStore<{ moduleId: string; exerciseId: string } | null>("fretquest.lastExercise", null);
export const useLastExercise = lastExercise.use;
export const setLastExercise = lastExercise.set;



