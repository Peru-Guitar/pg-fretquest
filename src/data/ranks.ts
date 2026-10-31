/**
 * Rangos y niveles de dedicación: se alcanzan solo con las horas practicadas en Fret Quest.
 * Miden constancia, no habilidad.
 *
 * Para ajustar la curva, cambia solo esta tabla: cada rango dice en qué nivel empieza (`fromLevel`) y con cuántas
 * horas acumuladas (`hours`). Los niveles de en medio se reparten en partes iguales hasta el rango siguiente;
 * los del último rango, hasta MAX_LEVEL_HOURS. `tier`: color de la insignia.
 */
export type RankTier = "bronze" | "silver" | "gold" | "legend";
export type Rank = { name: string; fromLevel: number; hours: number; tier: RankTier };

export const RANKS: Rank[] = [
  { name: "Primer acorde", fromLevel: 1, hours: 0, tier: "bronze" },
  { name: "Entre cuerdas", fromLevel: 6, hours: 2, tier: "bronze" },
  { name: "Riff Hunter", fromLevel: 9, hours: 5, tier: "bronze" },
  { name: "Fret Explorer", fromLevel: 12, hours: 10, tier: "silver" },
  { name: "Riff Machine", fromLevel: 16, hours: 20, tier: "silver" },
  { name: "Shred Seeker", fromLevel: 22, hours: 40, tier: "gold" },
  { name: "Fret Warrior", fromLevel: 30, hours: 75, tier: "gold" },
  { name: "Fret Legend", fromLevel: 42, hours: 150, tier: "legend" },
];

/** Último nivel y las horas para alcanzarlo. */
export const MAX_LEVEL = 50;
export const MAX_LEVEL_HOURS = 220;
