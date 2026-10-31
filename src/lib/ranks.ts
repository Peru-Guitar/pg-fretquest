import { MAX_LEVEL, MAX_LEVEL_HOURS, RANKS, type Rank } from "@/data/ranks";

/** Un nivel: su número, su rango y los minutos acumulados para alcanzarlo. */
export type Level = { level: number; rank: Rank; minutes: number };

/** Los 50 niveles, calculados desde la tabla de rangos (minutos redondeados). */
export const LEVELS: Level[] = RANKS.flatMap((rank, index) => {
  const next = RANKS[index + 1] ?? { fromLevel: MAX_LEVEL, hours: MAX_LEVEL_HOURS };
  const last = index === RANKS.length - 1;
  const span = next.fromLevel - rank.fromLevel;
  const count = last ? span + 1 : span;
  return Array.from({ length: count }, (_, i) => ({
    level: rank.fromLevel + i,
    rank,
    minutes: Math.round((rank.hours + (next.hours - rank.hours) * i / span) * 60),
  }));
});

/** Primer y último nivel de un rango. */
export const rankLevels = (rank: Rank) => {
  const levels = LEVELS.filter(level => level.rank === rank);
  return { from: levels[0].level, to: levels[levels.length - 1].level };
};

/** Nivel y rango para un tiempo practicado, y cuánto falta para el siguiente nivel (`next`: null en el último). */
export function levelFromSeconds(seconds: number) {
  const minutes = seconds / 60;
  const index = Math.max(0, LEVELS.filter(level => level.minutes <= minutes).length - 1);
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progress = next ? (minutes - current.minutes) / (next.minutes - current.minutes) : 1;
  return { ...current, next, progress };
}
