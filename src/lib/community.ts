import { useEffect, useState } from "react";
import { courses, type Difficulty } from "@/data/questMock";
import { readReport, type CommunityReport } from "@/lib/communityReport";
import { localDateKey, weekStartKey, type DayDoc } from "@/lib/progressDb";

/**
 * Comunidad: se lee el reporte de la semana (`communityReports/{lunes}`, 1 lectura; ver `lib/communityReport`).
 * `computeCommunity` es el cálculo con el que se genera ese reporte a partir de los días de todos.
 * Se guarda solo en memoria (ver `isFresh`).
 */
/** `totalSeconds`: tiempo de toda la vida, para su nivel y rango (solo en el reporte nuevo). */
export type RankEntry = { uid: string; name: string; total: number; seconds: number; active: number; totalSeconds?: number };
export type Community = {
  at: number;
  people: number;
  attempts: number;
  today: number;
  /** Prácticas por día de la semana, lunes → domingo. */
  byDay: number[];
  /** Porcentaje de personas por nivel. */
  byLevel: Record<Difficulty, number>;
  topLessons: { lessonId: string; attempts: number }[];
  ranking: RankEntry[];
  /** Quiénes practicaron cada módulo esta semana (id del módulo → personas, de más a menos tiempo en la semana). */
  byModule: Record<string, { uid: string; name: string }[]>;
  /** Lo mismo por lección (prácticas y lecturas marcadas como leídas). */
  byLesson: Record<string, { uid: string; name: string }[]>;
  /** Días de práctica registrados desde el lanzamiento (el reporte nuevo ya no lo trae: 0). */
  sinceLaunch: number;
  /** Activos de la semana por rango (solo en el reporte nuevo). */
  byRank?: { rank: string; people: number }[];
};

/**
 * El reporte ya es la caché: aquí solo se guarda en MEMORIA la última lectura, para que los componentes de una misma
 * carga (Comunidad, el pulso, las tarjetas de lecciones) compartan 1 lectura. Al recargar la página se vuelve a leer.
 * Con la app abierta mucho rato, se relee al navegar solo si el reporte ya pudo cambiar (más de 1 h desde que se generó)
 * y la última lectura tiene más de 30 min.
 */
const REPORT_REFRESH_MS = 60 * 60 * 1000;
const RECHECK_MS = 30 * 60 * 1000;
let memory: { community: Community; fetchedAt: number; week: string } | null = null;
const isFresh = (now = Date.now()) => memory !== null && memory.week === weekStartKey()
  && (now < memory.community.at + REPORT_REFRESH_MS || now < memory.fetchedAt + RECHECK_MS);

/** Descarta la copia en memoria (este navegador acaba de regenerar el reporte). */
export function invalidateCommunity() {
  memory = null;
}

/** Módulo de cada lección, para saber qué módulos practicó cada quien. */
const moduleOfLesson = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, course.id] as const)));

const attemptsOf = (day: DayDoc) => Object.values(day.lessons ?? {}).reduce((sum, lesson) => sum + (lesson.attempts ?? 0), 0);

type ReadingRow = { uid: string; lessonId: string; name?: string };

export function computeCommunity(days: (DayDoc & { uid: string })[], sinceLaunch: number, readings: ReadingRow[] = []): Community {
  const monday = weekStartKey();
  const week = Array.from({ length: 7 }, (_, index) => { const [y, m, d] = monday.split("-").map(Number); return localDateKey(new Date(y, m - 1, d + index)); });
  const today = localDateKey();
  const byUser = new Map<string, { name: string; level: Difficulty | null; latest: string; total: number; seconds: number; active: number }>();
  const byDay = week.map(() => 0);
  const lessons = new Map<string, number>();
  const moduleUsers = new Map<string, Set<string>>();
  const lessonUsers = new Map<string, Set<string>>();
  for (const day of days) {
    const attempts = attemptsOf(day);
    const index = week.indexOf(day.date);
    if (index >= 0) byDay[index] += attempts;
    for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) {
      lessons.set(lessonId, (lessons.get(lessonId) ?? 0) + (lesson.attempts ?? 0));
      lessonUsers.set(lessonId, (lessonUsers.get(lessonId) ?? new Set()).add(day.uid));
      const moduleId = moduleOfLesson.get(lessonId);
      if (moduleId) moduleUsers.set(moduleId, (moduleUsers.get(moduleId) ?? new Set()).add(day.uid));
    }
    const user = byUser.get(day.uid) ?? { name: day.name, level: day.level, latest: "", total: 0, seconds: 0, active: 0 };
    // El nombre y el nivel, los del día más reciente (por si cambió a mitad de semana).
    if (day.date >= user.latest) { user.latest = day.date; user.name = day.name; user.level = day.level; }
    user.total += attempts;
    user.seconds += day.seconds ?? 0;
    user.active += 1;
    byUser.set(day.uid, user);
  }
  // Lecturas: cuentan para el módulo y la lección; quien solo leyó va al final (no tiene tiempo practicado).
  const readerNames = new Map<string, string>();
  for (const reading of readings) {
    if (reading.name) readerNames.set(reading.uid, reading.name);
    lessonUsers.set(reading.lessonId, (lessonUsers.get(reading.lessonId) ?? new Set()).add(reading.uid));
    const moduleId = moduleOfLesson.get(reading.lessonId);
    if (moduleId) moduleUsers.set(moduleId, (moduleUsers.get(moduleId) ?? new Set()).add(reading.uid));
  }
  const users = [...byUser.entries()];
  const bySeconds = users.sort((a, b) => b[1].seconds - a[1].seconds);
  const order = new Map(bySeconds.map(([uid], index) => [uid, index]));
  const nameOf = (uid: string) => byUser.get(uid)?.name ?? readerNames.get(uid);
  // Sin nombre (lecturas antiguas de alguien que no practicó esta semana) no se muestra.
  const peopleBy = (groups: Map<string, Set<string>>) => Object.fromEntries([...groups.entries()].map(([id, uids]) => [id, [...uids]
    .filter(uid => nameOf(uid))
    .sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity))
    .map(uid => ({ uid, name: nameOf(uid)! }))]).filter(([, people]) => people.length));
  const levelCount: Record<Difficulty, number> = { base: 0, intermedio: 0, avanzado: 0, experto: 0 };
  for (const [, user] of users) if (user.level) levelCount[user.level] += 1;
  const withLevel = Object.values(levelCount).reduce((sum, count) => sum + count, 0) || 1;
  return {
    at: Date.now(),
    people: users.length,
    attempts: byDay.reduce((sum, count) => sum + count, 0),
    today: new Set(days.filter(day => day.date === today).map(day => day.uid)).size,
    byDay,
    byLevel: Object.fromEntries(Object.entries(levelCount).map(([level, count]) => [level, Math.round(count / withLevel * 100)])) as Record<Difficulty, number>,
    topLessons: [...lessons.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([lessonId, attempts]) => ({ lessonId, attempts })),
    // Por tiempo practicado en la semana, sin importar el nivel; en empate, por días distintos.
    ranking: users.map(([uid, user]) => ({ uid, name: user.name, total: user.total, seconds: user.seconds, active: user.active }))
      .sort((a, b) => b.seconds - a.seconds || b.active - a.active || a.name.localeCompare(b.name)),
    byModule: peopleBy(moduleUsers),
    byLesson: peopleBy(lessonUsers),
    sinceLaunch,
  };
}

// Consulta en curso: si varios componentes piden los datos a la vez (sin caché todavía), comparten la misma lectura.
let pending: Promise<Community> | null = null;
function loadCommunity(): Promise<Community> {
  pending ??= readCommunity().finally(() => { pending = null; });
  return pending;
}

/** El reporte de la semana con la forma que usa la web. Sin reporte (nadie practicó todavía), todo en cero. */
function fromReport(report: CommunityReport | null): Community {
  const empty: Record<Difficulty, number> = { base: 0, intermedio: 0, avanzado: 0, experto: 0 };
  return {
    at: report ? report.generatedAt.toMillis() : Date.now(),
    people: report?.people ?? 0,
    attempts: report?.practices ?? 0,
    today: report?.today ?? 0,
    byDay: report?.byDay ?? Array(7).fill(0),
    byLevel: report?.byPlan ?? empty,
    topLessons: (report?.topLessons ?? []).map(item => ({ lessonId: item.lessonId, attempts: item.practices })),
    ranking: (report?.ranking ?? []).map(row => ({ uid: row.uid, name: row.name, total: row.practices, seconds: row.seconds, active: row.days, totalSeconds: row.totalSeconds })),
    byModule: report?.byModule ?? {},
    byLesson: report?.byLesson ?? {},
    sinceLaunch: 0,
    byRank: report?.byRank ?? [],
  };
}

async function readCommunity(): Promise<Community> {
  if (isFresh()) return memory!.community;
  const community = fromReport(await readReport());
  memory = { community, fetchedAt: Date.now(), week: weekStartKey() };
  return community;
}

/** Datos de Comunidad (null mientras cargan o sin sesión). */
export function useCommunity(signedIn: boolean) {
  const [state, setState] = useState<{ data: Community | null; error: boolean }>({ data: null, error: false });
  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    loadCommunity().then(data => alive && setState({ data, error: false })).catch(() => alive && setState({ data: null, error: true }));
    return () => { alive = false; };
  }, [signedIn]);
  return signedIn ? state : { data: null, error: false };
}

