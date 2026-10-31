import { doc, getDoc, runTransaction, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { computeCommunity, invalidateCommunity } from "@/lib/community";
import { readCommunityDays, readCommunityReadings, weekStartKey } from "@/lib/progressDb";
import { buildReportBody, type ReportBody } from "@/lib/domain/communityReport";

/**
 * Reporte de Comunidad en Firestore: `communityReports/{lunes}`, un documento por semana (ver `domain/communityReport`).
 *
 * Al terminar una lección se mira si toca regenerarlo (más de REFRESH_MS desde el último). Si toca, se pide el turno
 * con una transacción que marca `refreshing`: con 100 personas terminando a la vez, solo una lo consigue y las demás
 * siguen de largo. La marca vence a los LOCK_MS por si quien la tomó se cae a la mitad.
 *
 * TODO: limpiar semanas viejas. Hoy queda un documento por semana (~20 KB con 100 activos, ~1 MB al año): se puede borrar
 * el de la semana anterior al generar el primero de una semana nueva (y permitir `delete` en las reglas para semanas terminadas).
 */
const REFRESH_MS = 60 * 60 * 1000;
const LOCK_MS = 2 * 60 * 1000;

export type ReportSource = "practice" | "admin";
export type ReportAuthor = { uid: string; name: string };
export type CommunityReport = ReportBody & {
  generatedAt: Timestamp;
  updatedBy: ReportAuthor & { source: ReportSource };
  refreshing: { uid: string; at: Timestamp } | null;
};

export const reportRef = (week = weekStartKey()) => doc(db, "communityReports", week);

/** El reporte de la semana (null si todavía no existe o solo tiene la marca de turno). */
export async function readReport(week = weekStartKey()) {
  const snapshot = await getDoc(reportRef(week));
  const data = snapshot.data({ serverTimestamps: "estimate" }) as Partial<CommunityReport> | undefined;
  return data?.generatedAt ? data as CommunityReport : null;
}

/** Recalcula el reporte de esta semana desde los días y lecturas de todos y lo reescribe completo. */
export async function generateReport(by: ReportAuthor, source: ReportSource) {
  const week = weekStartKey();
  const [days, readings] = await Promise.all([
    readCommunityDays(week),
    readCommunityReadings(week).catch(() => []),
  ]);
  const summary = computeCommunity(days, 0, readings);
  // Total de toda la vida de cada activo, para su rango: 1 lectura por persona activa. Nunca menos que lo de esta
  // semana: quien no volvió a entrar desde que existe `totalSeconds` (y no se sincronizó) no lo tiene todavía.
  const totals = new Map(await Promise.all(summary.ranking.map(async row => {
    const user = await getDoc(doc(db, "users", row.uid));
    return [row.uid, Math.max((user.get("totalSeconds") as number | undefined) ?? 0, row.seconds)] as const;
  })));
  await setDoc(reportRef(week), {
    ...buildReportBody(week, summary, totals),
    generatedAt: serverTimestamp(),
    updatedBy: { uid: by.uid, name: by.name.slice(0, 40), source },
    refreshing: null,
  });
  invalidateCommunity();
}

/** Pide el turno para regenerar: true si este usuario lo consiguió (el reporte es viejo y nadie más lo está haciendo). */
async function claimRefresh(uid: string) {
  return runTransaction(db, async transaction => {
    const ref = reportRef();
    const data = (await transaction.get(ref)).data() as Partial<CommunityReport> | undefined;
    const now = Date.now();
    if (data?.generatedAt && now - data.generatedAt.toMillis() < REFRESH_MS) return false;
    if (data?.refreshing && now - data.refreshing.at.toMillis() < LOCK_MS) return false;
    transaction.set(ref, { week: weekStartKey(), refreshing: { uid, at: serverTimestamp() } }, { merge: true });
    return true;
  });
}

/** Al terminar una lección: si toca y se consigue el turno, regenera el reporte. En segundo plano; si falla, no pasa nada. */
export async function refreshReportIfDue(by: ReportAuthor) {
  try {
    if (await claimRefresh(by.uid)) await generateReport(by, "practice");
  } catch (error) {
    console.warn("Comunidad: no se pudo actualizar el reporte.", error);
  }
}
