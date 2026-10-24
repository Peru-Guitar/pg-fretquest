import { collection, getCountFromServer } from "firebase/firestore";
import { courses } from "@/data/questMock";
import { db } from "@/lib/firebase";
import { readCommunityDays, weekStartKey } from "@/lib/progressDb";

/** Analytics del rol admin (`users/{uid}.role`, ver `isAdmin` en `lib/account`). */
export type Ranked = { id: string; title: string; users: number; attempts: number; seconds: number };
export type ModuleRow = Ranked & { image?: string; lessons: Ranked[] };
export type AnalyticsData = { users: number; active: number; seconds: number; modules: ModuleRow[] };

const lessonsById = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, { title: lesson.title, course }] as const)));

type Tally = Ranked & { uids: Set<string> };
const tally = (id: string, title: string): Tally => ({ id, title, users: 0, attempts: 0, seconds: 0, uids: new Set() });
const byUsage = (a: Ranked, b: Ranked) => b.users - a.users || b.seconds - a.seconds || b.attempts - a.attempts;
const finish = ({ uids, ...row }: Tally): Ranked => ({ ...row, users: uids.size });

/** Usuarios con perfil y, de esta semana, cada módulo con sus lecciones, ordenados por personas distintas, tiempo e intentos. */
export async function readAnalytics(): Promise<AnalyticsData> {
  const [users, days] = await Promise.all([
    getCountFromServer(collection(db, "users")).then(snapshot => snapshot.data().count),
    readCommunityDays(weekStartKey()),
  ]);
  const modules = new Map<string, Tally & { image?: string; lessons: Map<string, Tally> }>();
  for (const day of days) for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) {
    const info = lessonsById.get(lessonId);
    const moduleId = info?.course.id ?? "?";
    const module = modules.get(moduleId) ?? modules.set(moduleId, { ...tally(moduleId, info?.course.title ?? "Sin módulo"), image: info?.course.image, lessons: new Map() }).get(moduleId)!;
    const row = module.lessons.get(lessonId) ?? module.lessons.set(lessonId, tally(lessonId, info?.title ?? lessonId)).get(lessonId)!;
    for (const target of [module, row]) { target.uids.add(day.uid); target.attempts += lesson.attempts ?? 0; target.seconds += lesson.seconds ?? 0; }
  }
  return {
    users,
    active: new Set(days.map(day => day.uid)).size,
    seconds: days.reduce((sum, day) => sum + (day.seconds ?? 0), 0),
    modules: [...modules.values()].map(({ lessons, image, ...module }) => ({ ...finish(module), image, lessons: [...lessons.values()].map(finish).sort(byUsage) })).sort(byUsage),
  };
}
