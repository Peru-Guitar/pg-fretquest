import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { courses, type Difficulty } from "@/data/questMock";
import { db } from "@/lib/firebase";
import { attemptSpeed, localDateKey, weekStartKey, type DayDoc } from "@/lib/progressDb";
import { practiceStudies, type Speed } from "@/data/practiceStudies";

/**
 * Perfil de un usuario: TODOS sus días (los lee cualquiera con sesión, como el ranking). El admin lee además
 * `users/{uid}` (ciudad, guitarra, meta), que es privado: 2 consultas.
 * Se guarda ya calculado y en JSON plano (sin Timestamps) 1 hora en el navegador, por usuario;
 * «Actualizar» lo vuelve a leer.
 */
export type ProfileLesson = { id: string; title: string; module: string; moduleId: string; days: number; attempts: number; seconds: number; /** Velocidad máxima y última (niveles 1–5, 0 = sin dato) y la sugerida de la lección. */ speedMax: Speed | 0; speedLast: Speed | 0; target?: Speed; lastAt: number };
export type UserProfile = {
  at: number;
  uid: string;
  name: string;
  level: Difficulty | null;
  city?: string; country?: string; guitar?: string;
  weeklyGoal?: number; sessionMinutes?: number;
  seconds: number; days: number; completed: number; attempts: number;
  first?: string; last?: string;
  /** Minutos de esta semana, lunes → domingo. */
  week: number[];
  /** Últimas 8 semanas, de la más antigua a la actual. */
  weeks: { start: string; minutes: number }[];
  lessons: ProfileLesson[];
};

const CACHE_MS = 60 * 60 * 1000;
const cacheKey = (uid: string, admin: boolean) => `fretquest.profile.v2.${admin ? 'admin' : 'public'}.${uid}`;
const lessonsById = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, { lesson, course }] as const)));

const addDays = (key: string, days: number) => { const [y, m, d] = key.split("-").map(Number); return localDateKey(new Date(y, m - 1, d + days)); };

async function fetchProfile(uid: string, admin: boolean): Promise<UserProfile> {
  const [user, snapshot] = await Promise.all([admin ? getDoc(doc(db, "users", uid)) : null, getDocs(collection(db, "users", uid, "days"))]);
  const info = (user?.data() ?? {}) as Partial<UserProfile>;
  const days = snapshot.docs.map(item => item.data() as DayDoc).sort((a, b) => a.date.localeCompare(b.date));
  const monday = weekStartKey();
  const weeks = Array.from({ length: 8 }, (_, index) => ({ start: addDays(monday, (index - 7) * 7), minutes: 0 }));
  const weekKeys = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const week = Array<number>(7).fill(0);
  const lessons = new Map<string, ProfileLesson>();
  for (const day of days) {
    const minutes = (day.seconds ?? 0) / 60;
    const slot = weeks.reduce((found, item, index) => day.date >= item.start ? index : found, -1);
    if (slot >= 0) weeks[slot].minutes += minutes;
    const weekday = weekKeys.indexOf(day.date);
    if (weekday >= 0) week[weekday] += minutes;
    for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) {
      const meta = lessonsById.get(lessonId);
      const row = lessons.get(lessonId) ?? lessons.set(lessonId, {
        id: lessonId, title: meta?.lesson.title ?? lessonId, module: meta?.course.title ?? "Sin módulo", moduleId: meta?.course.id ?? "",
        days: 0, attempts: 0, seconds: 0, speedMax: 0, speedLast: 0, lastAt: 0,
        target: practiceStudies[lessonId] ? practiceStudies[lessonId].speed ?? 2 : undefined,
      }).get(lessonId)!;
      row.days += 1; row.attempts += lesson.attempts ?? 0; row.seconds += lesson.seconds ?? 0;
      for (const attempt of lesson.sessions ?? []) {
        const at = attempt.startedAt.toMillis();
        const speed = attemptSpeed(lessonId, attempt) ?? 0;
        row.speedMax = Math.max(row.speedMax, speed) as Speed | 0;
        if (at >= row.lastAt) { row.lastAt = at; row.speedLast = speed; }
      }
    }
  }
  return {
    at: Date.now(), uid,
    name: info.name ?? days.at(-1)?.name ?? "Sin nombre",
    level: info.level ?? days.at(-1)?.level ?? null,
    city: info.city, country: info.country, guitar: info.guitar, weeklyGoal: info.weeklyGoal, sessionMinutes: info.sessionMinutes,
    seconds: days.reduce((sum, day) => sum + (day.seconds ?? 0), 0),
    days: days.length,
    completed: days.filter(day => day.completed).length,
    attempts: [...lessons.values()].reduce((sum, lesson) => sum + lesson.attempts, 0),
    first: days[0]?.date, last: days.at(-1)?.date,
    week: week.map(Math.round),
    weeks: weeks.map(item => ({ ...item, minutes: Math.round(item.minutes) })),
    lessons: [...lessons.values()].sort((a, b) => b.seconds - a.seconds),
  };
}

function cached(uid: string, admin: boolean) {
  try {
    const profile = JSON.parse(localStorage.getItem(cacheKey(uid, admin)) ?? "null") as UserProfile | null;
    return profile && Date.now() - profile.at < CACHE_MS ? profile : null;
  } catch { return null; }
}

/** Perfil del usuario (null mientras carga). `refresh` ignora la caché y vuelve a leer (mientras tanto, queda lo anterior). */
export function useUserProfile(uid: string | null, admin: boolean) {
  const [version, setVersion] = useState(0);
  const [fetched, setFetched] = useState<{ key: string; uid: string; data: UserProfile | null; error: boolean } | null>(null);
  const key = `${uid}:${version}`;
  // Solo la primera carga usa la caché; «Actualizar» sube `version` y fuerza la lectura.
  const hit = useMemo(() => uid && version === 0 ? cached(uid, admin) : null, [uid, version, admin]);
  useEffect(() => {
    if (!uid || hit) return;
    let alive = true;
    fetchProfile(uid, admin).then(data => {
      try { localStorage.setItem(cacheKey(uid, admin), JSON.stringify(data)); } catch { /* sin almacenamiento */ }
      if (alive) setFetched({ key, uid, data, error: false });
    }).catch(() => alive && setFetched({ key, uid, data: null, error: true }));
    return () => { alive = false; };
  }, [uid, key, hit, admin]);
  const mine = fetched?.uid === uid ? fetched : null;
  const fresh = mine?.key === key ? mine : null;
  return {
    data: hit ?? fresh?.data ?? mine?.data ?? null,
    error: !hit && (fresh?.error ?? false),
    refresh: () => setVersion(current => current + 1),
  };
}
