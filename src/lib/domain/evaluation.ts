/**
 * Evaluación de una ejecución según la ficha de la lección.
 *
 * Por ahora la detección de notas es SIMULADA: `simulateStep` decide si cada nota
 * se tocó bien a partir de una semilla (la sesión) y el número de paso, de forma
 * determinista. Cuando llegue la entrada de audio, solo se reemplaza esa función;
 * el cálculo de métricas, puntuación y aprobación ya es el definitivo.
 */

export interface StepResult {
  hit: boolean;
  inOrder: boolean;
  /** Desfase respecto al metrónomo, en ms (negativo = adelantado). */
  offsetMs: number;
}

export interface Evaluation {
  stepsPlayed: number;
  notesPct: number;
  orderPct: number;
  rhythmPct: number;
  continuityPct: number;
  /** Desfase medio, en ms (con signo: negativo = tiende a adelantarse). */
  meanOffsetMs: number;
  validReps: number;
  invalidReps: number;
  /** Repeticiones válidas seguidas al final de la ejecución. */
  currentStreak: number;
  bestStreak: number;
  score: number;
  approved: boolean;
}

export const PASS_SCORE = 85;
export const REQUIRED_STREAK = 3;
/** Una repetición es válida si al menos este porcentaje de sus notas son correctas. */
const VALID_REP_PCT = 85;
/** Desfase a partir del cual una nota cuenta como fuera de tiempo. */
const RHYTHM_TOLERANCE_MS = 60;

/** Pseudoaleatorio estable en [0, 1) para (semilla, paso, canal). */
function noise(seed: number, step: number, channel: number): number {
  let h = (seed ^ (step * 0x9e3779b1) ^ (channel * 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

/** Simula una nota: cuanto más cerca del tempo objetivo (o por encima), más fallos. */
export function simulateStep(seed: number, step: number, bpm: number, bpmTarget: number): StepResult {
  const pressure = Math.max(0, bpm / bpmTarget - 0.6);
  const hitChance = Math.min(0.96, Math.max(0.6, 0.96 - pressure * 0.4));
  const spread = 70 + pressure * 90;
  return {
    hit: noise(seed, step, 1) < hitChance,
    inOrder: noise(seed, step, 2) < hitChance + 0.01,
    offsetMs: Math.round((noise(seed, step, 3) - 0.48) * 2 * spread),
  };
}

export function evaluate(seed: number, stepsPlayed: number, stepsPerRep: number, bpm: number, bpmTarget: number): Evaluation {
  let hits = 0;
  let ordered = 0;
  let onTime = 0;
  let offsetSum = 0;
  let validReps = 0;
  let invalidReps = 0;
  let streak = 0;
  let bestStreak = 0;
  let repHits = 0;

  for (let i = 0; i < stepsPlayed; i++) {
    const r = simulateStep(seed, i, bpm, bpmTarget);
    if (r.hit) {
      hits++;
      repHits++;
    }
    if (r.inOrder) ordered++;
    if (Math.abs(r.offsetMs) <= RHYTHM_TOLERANCE_MS) onTime++;
    offsetSum += r.offsetMs;
    // Fin de una repetición completa.
    if ((i + 1) % stepsPerRep === 0) {
      if ((repHits / stepsPerRep) * 100 >= VALID_REP_PCT) {
        validReps++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        invalidReps++;
        streak = 0;
      }
      repHits = 0;
    }
  }

  const pct = (n: number) => (stepsPlayed ? Math.round((n / stepsPlayed) * 100) : 0);
  const notesPct = pct(hits);
  const orderPct = pct(ordered);
  const rhythmPct = pct(onTime);
  const reps = validReps + invalidReps;
  const continuityPct = reps ? Math.round((validReps / reps) * 100) : 0;
  // Pesos de la ficha: notas y orden 40 %, ritmo 40 %, continuidad 20 %.
  const score = Math.round(0.4 * ((notesPct + orderPct) / 2) + 0.4 * rhythmPct + 0.2 * continuityPct);

  return {
    stepsPlayed,
    notesPct,
    orderPct,
    rhythmPct,
    continuityPct,
    meanOffsetMs: stepsPlayed ? Math.round(offsetSum / stepsPlayed) : 0,
    validReps,
    invalidReps,
    currentStreak: streak,
    bestStreak,
    score,
    approved: score >= PASS_SCORE && bestStreak >= REQUIRED_STREAK,
  };
}
