import { collection, getCountFromServer } from "firebase/firestore";
import { courses, type Difficulty, type PracticeLesson } from "@/data/questMock";
import { LEVELS } from "@/lib/account";
import { db } from "@/lib/firebase";
import { readCommunityDays, weekStartKey } from "@/lib/progressDb";

/**
 * Analytics del rol admin (`users/{uid}.role`, ver `isAdmin` en `lib/account`).
 * Todo sale de UNA lectura: los días de esta semana de todos (más el conteo de usuarios). Lo demás se calcula aquí.
 */
export type Participant = { uid: string; name: string; seconds: number };
/** BPM de los intentos: promedio y máximo, frente al rango sugerido de la lección. */
export type Tempo = { avg: number; max: number; min: number; target: number };
export type Ranked = { id: string; title: string; users: number; attempts: number; seconds: number; participants: Participant[]; tempo?: Tempo };
export type ModuleRow = Ranked & { image?: string; lessons: Ranked[] };
export type Person = { uid: string; name: string; level: Difficulty | null; seconds: number; days: number; completed: number };
export type AnalyticsData = {
  users: number; active: number; seconds: number; modules: ModuleRow[];
  /** Minutos por día (lunes → domingo) y hora (0–23), según el inicio de cada intento. */
  heat: number[][];
  /** Minutos por persona y día: promedio y reparto en tramos. */
  sessions: { avg: number; buckets: { label: string; count: number }[] };
  /** Días con la sesión completada sobre días practicados. */
  goal: { completed: number; days: number };
  /** Personas por cantidad de días practicados esta semana. */
  consistency: { label: string; count: number }[];
  byLevel: { level: Difficulty | null; people: number; seconds: number; top?: { id: string; title: string; seconds: number } }[];
  people: Person[];
};

const lessonsById = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, { lesson, course }] as const)));

// Los nombres ya vienen copiados en cada día: listar participantes no cuesta lecturas extra.
type Tally = Omit<Ranked, "participants" | "tempo"> & { uids: Map<string, Participant>; bpm: number[] };
const tally = (id: string, title: string): Tally => ({ id, title, users: 0, attempts: 0, seconds: 0, uids: new Map(), bpm: [] });
const byUsage = (a: Ranked, b: Ranked) => b.users - a.users || b.seconds - a.seconds || b.attempts - a.attempts;
const tempoOf = (bpm: number[], target?: PracticeLesson["tempo"]): Tempo | undefined => bpm.length && target
  ? { avg: Math.round(bpm.reduce((sum, value) => sum + value, 0) / bpm.length), max: Math.max(...bpm), min: target.min, target: target.max }
  : undefined;
const finish = ({ uids, bpm, ...row }: Tally): Ranked => {
  const info = lessonsById.get(row.id)?.lesson;
  return { ...row, users: uids.size, participants: [...uids.values()].sort((a, b) => b.seconds - a.seconds), tempo: tempoOf(bpm, info?.type === "practice" ? info.tempo : undefined) };
};

const BUCKETS = [{ label: "< 15 min", max: 15 }, { label: "15–30 min", max: 30 }, { label: "30–45 min", max: 45 }, { label: "45 min o más", max: Infinity }];

export async function readAnalytics(): Promise<AnalyticsData> {
  const [users, days] = await Promise.all([
    getCountFromServer(collection(db, "users")).then(snapshot => snapshot.data().count),
    readCommunityDays(weekStartKey()),
  ]);
  const modules = new Map<string, Tally & { image?: string; lessons: Map<string, Tally> }>();
  const heat = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const people = new Map<string, Person & { latest: string }>();
  const levels = new Map<Difficulty | null, { people: Set<string>; seconds: number; lessons: Map<string, number> }>();

  for (const day of days) {
    const person = people.get(day.uid) ?? people.set(day.uid, { uid: day.uid, name: day.name, level: day.level, seconds: 0, days: 0, completed: 0, latest: "" }).get(day.uid)!;
    if (day.date >= person.latest) Object.assign(person, { latest: day.date, name: day.name, level: day.level });
    person.seconds += day.seconds ?? 0;
    person.days += 1;
    if (day.completed) person.completed += 1;
    const level = levels.get(day.level) ?? levels.set(day.level, { people: new Set(), seconds: 0, lessons: new Map() }).get(day.level)!;
    level.people.add(day.uid);
    level.seconds += day.seconds ?? 0;

    for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) {
      const info = lessonsById.get(lessonId);
      const moduleId = info?.course.id ?? "?";
      const module = modules.get(moduleId) ?? modules.set(moduleId, { ...tally(moduleId, info?.course.title ?? "Sin módulo"), image: info?.course.image, lessons: new Map() }).get(moduleId)!;
      const row = module.lessons.get(lessonId) ?? module.lessons.set(lessonId, tally(lessonId, info?.lesson.title ?? lessonId)).get(lessonId)!;
      for (const target of [module, row]) {
        const participant = target.uids.get(day.uid) ?? target.uids.set(day.uid, { uid: day.uid, name: day.name, seconds: 0 }).get(day.uid)!;
        participant.seconds += lesson.seconds ?? 0;
        target.attempts += lesson.attempts ?? 0; target.seconds += lesson.seconds ?? 0;
      }
      level.lessons.set(lessonId, (level.lessons.get(lessonId) ?? 0) + (lesson.seconds ?? 0));
      for (const attempt of lesson.sessions ?? []) {
        if (attempt.bpm) row.bpm.push(attempt.bpm);
        const at = attempt.startedAt.toDate();
        heat[(at.getDay() + 6) % 7][at.getHours()] += (attempt.seconds ?? 0) / 60;
      }
    }
  }

  const minutesPerDay = days.map(day => (day.seconds ?? 0) / 60);
  const personList = [...people.values()].map(({ uid, name, level, seconds, days, completed }): Person => ({ uid, name, level, seconds, days, completed })).sort((a, b) => b.seconds - a.seconds);
  return {
    users,
    active: people.size,
    seconds: days.reduce((sum, day) => sum + (day.seconds ?? 0), 0),
    modules: [...modules.values()].map(({ lessons, image, ...module }) => ({
        ...finish(module), image,
        lessons: [...lessons.values()].map(finish).sort(byUsage),
      })).sort(byUsage),
    heat: heat.map(row => row.map(Math.round)),
    sessions: {
      avg: minutesPerDay.length ? Math.round(minutesPerDay.reduce((sum, value) => sum + value, 0) / minutesPerDay.length) : 0,
      buckets: BUCKETS.map(({ label, max }, index) => ({ label, count: minutesPerDay.filter(value => value < max && value >= (BUCKETS[index - 1]?.max ?? 0)).length })),
    },
    goal: { completed: days.filter(day => day.completed).length, days: days.length },
    consistency: [{ label: "1 día", test: (n: number) => n === 1 }, { label: "2–3 días", test: (n: number) => n >= 2 && n <= 3 }, { label: "4 días o más", test: (n: number) => n >= 4 }]
      .map(({ label, test }) => ({ label, count: personList.filter(person => test(person.days)).length })),
    byLevel: [...LEVELS, null].filter(level => levels.has(level)).map(level => {
      const entry = levels.get(level)!;
      const [topId, topSeconds] = [...entry.lessons.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
      return { level, people: entry.people.size, seconds: entry.seconds, top: topId ? { id: topId, title: lessonsById.get(topId)?.lesson.title ?? topId, seconds: topSeconds } : undefined };
    }),
    people: personList,
  };
}
