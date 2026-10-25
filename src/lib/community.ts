import { useEffect, useState } from "react";
import { collectionGroup, getCountFromServer } from "firebase/firestore";
import type { Difficulty } from "@/data/questMock";
import { db } from "@/lib/firebase";
import { localDateKey, readCommunityDays, weekStartKey, type DayDoc } from "@/lib/progressDb";

/**
 * Comunidad con datos reales: se leen los días de esta semana de todos (consulta de grupo sobre `days`)
 * y se agrupan aquí. El resultado se guarda 1 hora en el navegador, por semana; al registrar una práctica
 * propia se invalida para que te veas al momento.
 */
export type RankEntry = { uid: string; name: string; total: number; seconds: number; active: number };
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
  /** Días de práctica registrados desde el lanzamiento. */
  sinceLaunch: number;
};

const CACHE_MS = 60 * 60 * 1000;
const cacheKey = () => `fretquest.community.v2.${weekStartKey()}`;

export function invalidateCommunity() {
  try { localStorage.removeItem(cacheKey()); } catch { /* sin almacenamiento */ }
}

const attemptsOf = (day: DayDoc) => Object.values(day.lessons ?? {}).reduce((sum, lesson) => sum + (lesson.attempts ?? 0), 0);

export function computeCommunity(days: (DayDoc & { uid: string })[], sinceLaunch: number): Community {
  const monday = weekStartKey();
  const week = Array.from({ length: 7 }, (_, index) => { const [y, m, d] = monday.split("-").map(Number); return localDateKey(new Date(y, m - 1, d + index)); });
  const today = localDateKey();
  const byUser = new Map<string, { name: string; level: Difficulty | null; latest: string; total: number; seconds: number; active: number }>();
  const byDay = week.map(() => 0);
  const lessons = new Map<string, number>();
  for (const day of days) {
    const attempts = attemptsOf(day);
    const index = week.indexOf(day.date);
    if (index >= 0) byDay[index] += attempts;
    for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) lessons.set(lessonId, (lessons.get(lessonId) ?? 0) + (lesson.attempts ?? 0));
    const user = byUser.get(day.uid) ?? { name: day.name, level: day.level, latest: "", total: 0, seconds: 0, active: 0 };
    // El nombre y el nivel, los del día más reciente (por si cambió a mitad de semana).
    if (day.date >= user.latest) { user.latest = day.date; user.name = day.name; user.level = day.level; }
    user.total += attempts;
    user.seconds += day.seconds ?? 0;
    user.active += 1;
    byUser.set(day.uid, user);
  }
  const users = [...byUser.entries()];
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
    sinceLaunch,
  };
}

async function loadCommunity(): Promise<Community> {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey()) ?? "null") as Community | null;
    if (cached && Date.now() - cached.at < CACHE_MS) return cached;
  } catch { /* caché ilegible: se recalcula */ }
  const [days, count] = await Promise.all([
    readCommunityDays(weekStartKey()),
    getCountFromServer(collectionGroup(db, "days")).then(snapshot => snapshot.data().count).catch(() => 0),
  ]);
  const community = computeCommunity(days, count);
  try { localStorage.setItem(cacheKey(), JSON.stringify(community)); } catch { /* sin almacenamiento */ }
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
