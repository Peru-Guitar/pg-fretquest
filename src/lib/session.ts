import { createLocalStore } from "@/lib/localStore";

export type Mode = "practice" | "progress";

/**
 * Sesión en curso, basada en timestamps reales y guardada para sobrevivir recargas.
 * El cursor de la tablatura se calcula desde un ancla (pasos acumulados y tiempo en
 * que se fijó), así cambiar el tempo en práctica libre no lo hace saltar.
 */
export interface Session {
  exerciseId: string;
  mode: Mode;
  bpm: number;
  /** Solo en modo progreso: duración objetivo. */
  durationMs: number | null;
  startedAt: number;
  pausedMs: number;
  pausedAt: number | null;
  anchorSteps: number;
  anchorElapsedMs: number;
}

const store = createLocalStore<Session | null>("fretquest.activeSession", null);

export const useActiveSession = store.use;
export const setActiveSession = store.set;
export const getActiveSession = store.get;

export const elapsedMs = (s: Session, now: number) => (s.pausedAt ?? now) - s.startedAt - s.pausedMs;

/** Notas tocadas desde el inicio de la sesión con el tempo vigente. */
export function stepsAt(s: Session, elapsed: number, notesPerBeat: number): number {
  const stepMs = 60_000 / s.bpm / notesPerBeat;
  return s.anchorSteps + Math.floor(Math.max(0, elapsed - s.anchorElapsedMs) / stepMs);
}

/** Cambia el tempo conservando la posición: el ancla pasa a ser el punto actual. */
export function retempo(s: Session, bpm: number, now: number, notesPerBeat: number): Session {
  const elapsed = elapsedMs(s, now);
  return { ...s, bpm, anchorSteps: stepsAt(s, elapsed, notesPerBeat), anchorElapsedMs: elapsed };
}

export function newSession(exerciseId: string, mode: Mode, bpm: number, minutes: number): Session {
  return {
    exerciseId,
    mode,
    bpm,
    durationMs: mode === "progress" ? minutes * 60_000 : null,
    startedAt: Date.now(),
    pausedMs: 0,
    pausedAt: null,
    anchorSteps: 0,
    anchorElapsedMs: 0,
  };
}
