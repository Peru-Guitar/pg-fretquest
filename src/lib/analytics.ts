import { collection, collectionGroup, getDocs, writeBatch } from "firebase/firestore";
import { courses, type Difficulty } from "@/data/questMock";
import { practiceStudies, type Speed } from "@/data/practiceStudies";
import { LEVELS } from "@/lib/account";
import { db } from "@/lib/firebase";
import { attemptSpeed, readCommunityDays, weekStartKey } from "@/lib/progressDb";
import { levelFromSeconds } from "@/lib/ranks";

/**
 * Datos de Backstage, del rol admin (`users/{uid}.role`, ver `isAdmin` en `lib/account`).
 * Sale de dos lecturas: los días de esta semana de todos y los usuarios (para contarlos y por su total, el rango). Lo demás se calcula aquí.
 */
export type Participant = { uid: string; name: string; seconds: number };
/** Velocidad de los intentos (niveles 1–5): promedio y máximo, frente a la sugerida de la lección. */
export type Tempo = { avg: Speed; max: Speed; target: Speed };
export type Ranked = { id: string; title: string; users: number; attempts: number; seconds: number; participants: Participant[]; tempo?: Tempo };
export type ModuleRow = Ranked & { image?: string; lessons: Ranked[] };
/** `totalSeconds`: tiempo de toda la vida (`users/{uid}`), para su nivel y rango. */
export type Person = { uid: string; name: string; level: Difficulty | null; seconds: number; days: number; completed: number; totalSeconds: number };
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
  /** Quienes practicaron esta semana, por rango. */
  byRank: { rank: string; people: number }[];
};

const lessonsById = new Map(courses.flatMap(course => course.lessons.map(lesson => [lesson.id, { lesson, course }] as const)));

// Los nombres ya vienen copiados en cada día: listar participantes no cuesta lecturas extra.
type Tally = Omit<Ranked, "participants" | "tempo"> & { uids: Map<string, Participant>; speeds: Speed[] };
const tally = (id: string, title: string): Tally => ({ id, title, users: 0, attempts: 0, seconds: 0, uids: new Map(), speeds: [] });
const byUsage = (a: Ranked, b: Ranked) => b.users - a.users || b.seconds - a.seconds || b.attempts - a.attempts;
const tempoOf = (id: string, speeds: Speed[]): Tempo | undefined => speeds.length && practiceStudies[id]
  ? { avg: Math.round(speeds.reduce((sum, value) => sum + value, 0) / speeds.length) as Speed, max: Math.max(...speeds) as Speed, target: practiceStudies[id].speed ?? 2 }
  : undefined;
const finish = ({ uids, speeds, ...row }: Tally): Ranked =>
  ({ ...row, users: uids.size, participants: [...uids.values()].sort((a, b) => b.seconds - a.seconds), tempo: tempoOf(row.id, speeds) });

const BUCKETS = [{ label: "< 15 min", max: 15 }, { label: "15–30 min", max: 30 }, { label: "30–45 min", max: 45 }, { label: "45 min o más", max: Infinity }];

export async function readAnalytics(): Promise<AnalyticsData> {
  const [userDocs, days] = await Promise.all([getDocs(collection(db, "users")), readCommunityDays(weekStartKey())]);
  const users = userDocs.size;
  const totals = new Map(userDocs.docs.map(user => [user.id, (user.get("totalSeconds") as number | undefined) ?? 0]));
  const modules = new Map<string, Tally & { image?: string; lessons: Map<string, Tally> }>();
  const heat = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const people = new Map<string, Omit<Person, "totalSeconds"> & { latest: string }>();
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
        const speed = attemptSpeed(lessonId, attempt);
        if (speed) row.speeds.push(speed);
        const at = attempt.startedAt.toDate();
        heat[(at.getDay() + 6) % 7][at.getHours()] += (attempt.seconds ?? 0) / 60;
      }
    }
  }

  const minutesPerDay = days.map(day => (day.seconds ?? 0) / 60);
  const personList = [...people.values()].map(({ uid, name, level, seconds, days, completed }): Person => ({ uid, name, level, seconds, days, completed, totalSeconds: Math.max(totals.get(uid) ?? 0, seconds) })).sort((a, b) => b.seconds - a.seconds);
  const rankCount = new Map<string, number>();
  for (const person of personList) { const { rank } = levelFromSeconds(person.totalSeconds); rankCount.set(rank.name, (rankCount.get(rank.name) ?? 0) + 1); }
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
    byRank: [...rankCount.entries()].map(([rank, people]) => ({ rank, people })),
  };
}

/** Perfil de un registrado, para la pestaña Usuarios. */
export type Member = { uid: string; name: string; level: Difficulty | null; city?: string; country?: string; guitar?: string; lastPractice: string | null; totalSeconds: number };

/**
 * Todos los registrados: una lectura por usuario, y solo al abrir la pestaña Usuarios.
 * Se ordenan por última práctica (los que nunca practicaron al final); buscar y paginar se hace aquí.
 */
export async function readMembers(): Promise<Member[]> {
  const snapshot = await getDocs(collection(db, "users"));
  const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id, name: text(data.name) ?? "Guitarrista",
      level: LEVELS.includes(data.level) ? data.level as Difficulty : null,
      city: text(data.city), country: text(data.country), guitar: text(data.guitar),
      lastPractice: text(data.lastPractice?.date) ?? null,
      totalSeconds: typeof data.totalSeconds === 'number' ? data.totalSeconds : 0,
    };
  }).sort((a, b) => (b.lastPractice ?? "").localeCompare(a.lastPractice ?? "") || a.name.localeCompare(b.name));
}

/**
 * Recalcula `users/{uid}.totalSeconds` de todos sumando sus días (una consulta de grupo sobre `days`) y guarda solo los
 * que cambiaron. Idempotente: se puede repetir. Solo el admin (las reglas le dejan tocar únicamente ese campo).
 */
export async function syncAllTotalSeconds() {
  const [users, days] = await Promise.all([getDocs(collection(db, "users")), getDocs(collectionGroup(db, "days"))]);
  const totals = new Map<string, number>();
  for (const day of days.docs) {
    const uid = day.ref.parent.parent?.id;
    if (uid) totals.set(uid, (totals.get(uid) ?? 0) + ((day.get("seconds") as number | undefined) ?? 0));
  }
  const changed = users.docs.filter(user => user.get("totalSeconds") !== (totals.get(user.id) ?? 0));
  // Firestore admite hasta 500 escrituras por lote.
  for (let i = 0; i < changed.length; i += 500) {
    const batch = writeBatch(db);
    for (const user of changed.slice(i, i + 500)) batch.update(user.ref, { totalSeconds: totals.get(user.id) ?? 0 });
    await batch.commit();
  }
  return { users: users.size, updated: changed.length };
}
