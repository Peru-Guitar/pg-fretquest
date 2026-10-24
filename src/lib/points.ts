import type { Difficulty } from "@/data/questMock";

/**
 * Puntos y niveles.
 *
 * Puntos de una sesión de Práctica = rondas × 5 × dificultad del ejercicio × velocidad.
 * Los factores son suaves a propósito: practicar más rondas siempre vale más que forzar la velocidad.
 * La valoración honesta no da puntos (si los diera, invitaría a inflarla).
 */

export const POINTS_PER_ROUND = 5;
export const DAILY_PLAN_BONUS = 25;

export const DIFFICULTY: Record<Difficulty, { label: string; factor: number }> = {
  base: { label: "Básico", factor: 1 },
  intermedio: { label: "Intermedio", factor: 1.25 },
  avanzado: { label: "Avanzado", factor: 1.5 },
  experto: { label: "Experto", factor: 1.75 },
};

/** Factor por velocidad (BPM de las velocidades fijas). */
const TEMPO_FACTOR: Record<number, number> = { 40: 1, 60: 1.1, 80: 1.2, 100: 1.35, 120: 1.5, 140: 1.65, 160: 1.8 };

export function sessionPoints(rounds: number, difficulty: Difficulty, bpm: number) {
  return Math.round(rounds * POINTS_PER_ROUND * DIFFICULTY[difficulty].factor * (TEMPO_FACTOR[bpm] ?? 1));
}

/** Rangos: cada uno agrupa cuatro niveles (el último sigue sin límite). */
const RANKS = ["Aprendiz", "Explorador", "Músico de sesión", "Virtuoso", "Leyenda"];
const MAX_LEVEL = 20;

/** Puntos acumulados para alcanzar el nivel `n`: pasar de n a n+1 cuesta 300 × n. */
export const pointsForLevel = (level: number) => 300 * (level * (level - 1)) / 2;

export function levelFromPoints(points: number) {
  let level = 1;
  while (pointsForLevel(level + 1) <= points) level++;
  const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((Math.min(level, MAX_LEVEL) - 1) / 4))];
  const floor = pointsForLevel(level);
  const next = pointsForLevel(level + 1);
  return { level, rank, points, floor, next, progress: (points - floor) / (next - floor) };
}
