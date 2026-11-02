import type { Difficulty } from "@/data/questMock";
import { levelFromSeconds } from "@/lib/ranks";

/**
 * Reporte de Comunidad: UN documento por semana (`communityReports/{lunes}`) con todo ya calculado.
 * Comunidad solo lo lee (1 lectura). Lo regenera completo, como mucho una vez por hora, el primero que termina
 * una lección cuando toca (ver `lib/communityReport`), o el admin a mano.
 */
export const REPORT_VERSION = 1;
/** Personas del ranking que guarda el reporte. */
export const REPORT_RANKING = 15;

export type ReportPerson = { uid: string; name: string };
export type ReportRankRow = ReportPerson & { seconds: number; days: number; practices: number; totalSeconds: number; avatar?: string };

/** Lo que se calcula de los días y lecturas de la semana (sin metadatos de quién ni cuándo). */
export type ReportBody = {
  version: number;
  week: string;
  people: number;
  practices: number;
  today: number;
  /** Prácticas por día, lunes → domingo. */
  byDay: number[];
  /** Porcentaje de activos por plan. */
  byPlan: Record<Difficulty, number>;
  /** Activos por rango (solo rangos con alguien). */
  byRank: { rank: string; people: number }[];
  topLessons: { lessonId: string; practices: number }[];
  /** Top REPORT_RANKING por tiempo en la semana; el nivel y el rango los calcula la web desde `totalSeconds`. */
  ranking: ReportRankRow[];
  byModule: Record<string, ReportPerson[]>;
  byLesson: Record<string, ReportPerson[]>;
};

/** Lo que entrega el cálculo de la semana (`computeCommunity`). */
export type WeekSummary = {
  people: number; attempts: number; today: number; byDay: number[]; byLevel: Record<Difficulty, number>;
  topLessons: { lessonId: string; attempts: number }[];
  ranking: { uid: string; name: string; total: number; seconds: number; active: number }[];
  byModule: Record<string, ReportPerson[]>; byLesson: Record<string, ReportPerson[]>;
};

/** Arma el cuerpo del reporte: la semana ya resumida más el total de toda la vida de cada activo (para los rangos). */
export function buildReportBody(week: string, summary: WeekSummary, totals: Map<string, number>, avatars = new Map<string, string>()): ReportBody {
  const byRank = new Map<string, number>();
  for (const row of summary.ranking) {
    const { rank } = levelFromSeconds(totals.get(row.uid) ?? 0);
    byRank.set(rank.name, (byRank.get(rank.name) ?? 0) + 1);
  }
  return {
    version: REPORT_VERSION,
    week,
    people: summary.people,
    practices: summary.attempts,
    today: summary.today,
    byDay: summary.byDay,
    byPlan: summary.byLevel,
    byRank: [...byRank.entries()].map(([rank, people]) => ({ rank, people })),
    topLessons: summary.topLessons.map(item => ({ lessonId: item.lessonId, practices: item.attempts })),
    ranking: summary.ranking.slice(0, REPORT_RANKING).map(row => ({
      uid: row.uid, name: row.name, seconds: row.seconds, days: row.active, practices: row.total, totalSeconds: totals.get(row.uid) ?? 0,
      // Sin avatar se omite el campo: Firestore no acepta `undefined`.
      ...(avatars.has(row.uid) && { avatar: avatars.get(row.uid) }),
    })),
    byModule: summary.byModule,
    byLesson: summary.byLesson,
  };
}
