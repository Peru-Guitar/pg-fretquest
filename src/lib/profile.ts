import { weeklyHoursOf } from "@/lib/domain/weeklyGoal";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { courses, type Difficulty } from "@/data/questMock";
import { db } from "@/lib/firebase";
import { weekStartKey } from "@/lib/progressDb";
import { readProgress } from "@/lib/progressReport";
import { addDays, emptyProgress } from "@/lib/domain/progressReport";

/**
 * Perfil de un usuario: `users/{uid}` (nombre, plan, ciudad, guitarra, meta, horas) y su reporte de progreso
 * `progressReports/{uid}` (ver `domain/progressReport`): 2 lecturas, sin importar cuánto haya practicado.
 * Se guarda ya calculado y en JSON plano 30 min en el navegador, por usuario; «Actualizar» lo vuelve a leer.
 */
export type ProfileLesson = { id: string; title: string; module: string; moduleId: string; attempts: number; seconds: number; lastAt: number };
export type UserProfile = {
  at: number;
  uid: string;
  name: string;
  level: Difficulty | null;
  city?: string; country?: string; guitar?: string;
  weeklyHours?: number;
  seconds: number; days: number; attempts: number;
  first?: string; last?: string;
  /** Minutos de esta semana, lunes → domingo. */
  avatar?: string;
  week: number[];
  /** Últimas 8 semanas, de la más antigua a la actual. */
  weeks: { start: string; minutes: number }[];
  lessons: ProfileLesson[];
};

export const PROFILE_CACHE_MS = 30 * 60 * 1000;
const cacheKey = (uid: string) => `fretquest.profile.v4.${uid}`;

/** Descarta el perfil guardado de un usuario (al terminar tu práctica, el tuyo: así lo ves al día). */
export function invalidateProfile(uid: string) {
  try { localStorage.removeItem(cacheKey(uid)); } catch { /* sin almacenamiento */ }
}
const lessonsById = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, { lesson, course }] as const)));

async function fetchProfile(uid: string): Promise<UserProfile> {
  const [user, stored] = await Promise.all([getDoc(doc(db, "users", uid)), readProgress(uid)]);
  const info = (user.data() ?? {}) as Partial<UserProfile> & { totalSeconds?: number };
  // Sin reporte (nunca practicó, o aún no se sincronizó): todo en cero, sin romper la página.
  const progress = stored ?? emptyProgress();
  const monday = weekStartKey();
  const minutesOf = (date: string) => (progress.days[date] ?? 0) / 60;
  const week = Array.from({ length: 7 }, (_, index) => minutesOf(addDays(monday, index)));
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const start = addDays(monday, (index - 7) * 7);
    return { start, minutes: Array.from({ length: 7 }, (_, day) => minutesOf(addDays(start, day))).reduce((sum, value) => sum + value, 0) };
  });
  const lessons = Object.entries(progress.lessons).map(([id, lesson]): ProfileLesson => {
    const meta = lessonsById.get(id);
    return { id, title: meta?.lesson.title ?? id, module: meta?.course.title ?? "Sin módulo", moduleId: meta?.course.id ?? "", attempts: lesson.practices, seconds: lesson.seconds, lastAt: lesson.lastAt };
  });
  return {
    at: Date.now(), uid,
    name: info.name ?? "Sin nombre",
    avatar: info.avatar,
    level: info.level ?? null,
    city: info.city, country: info.country, guitar: info.guitar, weeklyHours: weeklyHoursOf(info),
    seconds: info.totalSeconds ?? lessons.reduce((sum, lesson) => sum + lesson.seconds, 0),
    days: progress.practiceDays,
    attempts: progress.practices,
    first: progress.firstDate ?? undefined, last: progress.lastDate ?? undefined,
    week: week.map(Math.round),
    weeks: weeks.map(item => ({ ...item, minutes: Math.round(item.minutes) })),
    lessons: lessons.sort((a, b) => b.seconds - a.seconds),
  };
}

function cached(uid: string) {
  try {
    const profile = JSON.parse(localStorage.getItem(cacheKey(uid)) ?? "null") as UserProfile | null;
    return profile && Date.now() - profile.at < PROFILE_CACHE_MS ? profile : null;
  } catch { return null; }
}

/** Perfil del usuario (null mientras carga). `refresh` ignora la caché y vuelve a leer (mientras tanto, queda lo anterior). */
export function useUserProfile(uid: string | null) {
  const [version, setVersion] = useState(0);
  const [fetched, setFetched] = useState<{ key: string; uid: string; data: UserProfile | null; error: boolean } | null>(null);
  const key = `${uid}:${version}`;
  // Solo la primera carga usa la caché; «Actualizar» sube `version` y fuerza la lectura.
  const hit = useMemo(() => uid && version === 0 ? cached(uid) : null, [uid, version]);
  useEffect(() => {
    if (!uid || hit) return;
    let alive = true;
    fetchProfile(uid).then(data => {
      try { localStorage.setItem(cacheKey(uid), JSON.stringify(data)); } catch { /* sin almacenamiento */ }
      if (alive) setFetched({ key, uid, data, error: false });
    }).catch(() => alive && setFetched({ key, uid, data: null, error: true }));
    return () => { alive = false; };
  }, [uid, key, hit]);
  const mine = fetched?.uid === uid ? fetched : null;
  const fresh = mine?.key === key ? mine : null;
  return {
    data: hit ?? fresh?.data ?? mine?.data ?? null,
    error: !hit && (fresh?.error ?? false),
    refresh: () => setVersion(current => current + 1),
  };
}
