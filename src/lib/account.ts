import { courses, type Difficulty, type PracticeLesson } from "@/data/questMock";
import { DIFFICULTY } from "@/lib/points";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { watchProgress } from "@/lib/progressDb";
import { createLocalStore } from "@/lib/localStore";
import { addDays, weekStart } from "@/lib/domain/report";

/**
 * Cuenta: el login es REAL (Google, Firebase Auth); los datos de la cuenta todavía viven en localStorage.
 * Con Firestore, este mismo objeto será el documento `users/{uid}`.
 */
export type Account = {
  /** De Firebase Auth / Google: solo lectura. */
  uid: string;
  email: string;
  /** Datos propios del usuario, independientes de Google: los edita en Mi cuenta. */
  name: string;
  city?: string;
  country?: string;
  guitar?: string;
  level: Difficulty | null;
  /** Ya se leyó `users/{uid}` de Firestore en esta sesión: hasta entonces no se sabe si tiene nivel y ritmo. */
  synced?: boolean;
  /** Ritmo: días por semana que quiere practicar (se puede practicar cualquier día; es una meta). */
  weeklyGoal?: number;
  /** Duración de la sesión del plan: 15, 30 o 45 min. Un día cuenta para el ritmo si completas una sesión. */
  sessionMinutes?: number;
  /** Solo la lección: su módulo se busca en el temario, así una lección puede cambiar de módulo sin romper nada. */
  lastPractice: { lessonId: string; date: string } | null;
  /**
   * Prácticas registradas: como mucho UNA por lección y día (repetirla ese día es práctica libre).
   * Simula los eventos `practices/{uid}_{lessonId}_{date}` que alimentan Comunidad.
   */
  practices?: { lessonId: string; date: string }[];
};

const store = createLocalStore<Account | null>("fretquest.account", null);
export const useAccount = store.use;

/** Login con Google en una ventana emergente. La cuenta se crea o se retoma en `onAuthStateChanged`. */
export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signOut = () => firebaseSignOut(auth);

// Sesión de Firebase → cuenta. Si es otro usuario (o la primera vez), se crea con el nombre de Google;
// a partir de ahí el nombre es del usuario (lo edita en Mi cuenta).
// Solo en el navegador: al generar el HTML estático no hay sesión que escuchar.
if (typeof window !== 'undefined') onAuthStateChanged(auth, user => {
  // Progreso en vivo (días de la semana y resúmenes por lección) solo con sesión.
  watchProgress(user?.uid ?? null);
  if (!user) { store.set(null); return; }
  const current = store.get();
  if (current?.uid !== user.uid) store.set({ uid: user.uid, email: user.email ?? "", name: user.displayName ?? "Guitarrista", level: null, lastPractice: null, synced: false });
  // En Firestore (`users/{uid}`) se persisten el nivel (la lógica para calcularlo está en el código), la ciudad y el país.
  getDoc(doc(db, "users", user.uid)).then(snapshot => {
    const data = snapshot.data() ?? {};
    const account = store.get();
    if (account?.uid !== user.uid) return;
    const level = LEVELS.includes(data.level) ? data.level as Difficulty : account.level;
    const weeklyGoal = RHYTHMS.some(rhythm => rhythm.days === data.weeklyGoal) ? data.weeklyGoal as number : account.weeklyGoal;
    const sessionMinutes = SESSION_MINUTES.includes(data.sessionMinutes) ? data.sessionMinutes as number : account.sessionMinutes;
    store.set({ ...account, level, weeklyGoal, sessionMinutes, city: data.city ?? account.city, country: data.country ?? account.country, synced: true });
  }).catch(() => {
    // Sin conexión: se sigue con lo guardado en el navegador.
    const account = store.get();
    if (account?.uid === user.uid) store.set({ ...account, synced: true });
  });
});
export const updateProfile = (changes: Pick<Account, "name" | "city" | "country" | "guitar">) => {
  const account = store.get();
  if (!account) return;
  store.set({ ...account, ...changes });
  void setDoc(doc(db, "users", account.uid), { name: changes.name, city: changes.city ?? "", country: changes.country ?? "" }, { merge: true }).catch(() => { /* queda local */ });
};
export const setLevel = (level: Difficulty) => {
  const account = store.get();
  if (!account) return;
  store.set({ ...account, level });
  void setDoc(doc(db, "users", account.uid), { level }, { merge: true }).catch(() => { /* se reintenta la próxima vez que cambie */ });
};

/** Ritmos de práctica (días por semana). 3 es el recomendado para empezar. */
export const RHYTHMS = [
  { days: 2, label: "Tranquilo", text: "Para mantener la mano activa." },
  { days: 3, label: "Constante", text: "Recomendado: progreso real sin agobio." },
  { days: 4, label: "Comprometido", text: "Avance visible semana a semana." },
  { days: 5, label: "Intenso", text: "Casi a diario, con días de descanso." },
  { days: 6, label: "Máximo", text: "Solo con un día libre a la semana." },
];
export const DEFAULT_RHYTHM = 3;

/** Duración de la sesión del plan. Más de 45 min de técnica seguida trae fatiga: no se ofrece. */
export const SESSION_MINUTES = [15, 30, 45];
export const DEFAULT_SESSION_MINUTES = 30;
export const setSessionMinutes = (minutes: number) => {
  const account = store.get();
  if (!account) return;
  store.set({ ...account, sessionMinutes: minutes });
  void setDoc(doc(db, "users", account.uid), { sessionMinutes: minutes }, { merge: true }).catch(() => { /* queda local */ });
};

/**
 * Sesión del plan en curso: se repiten los ejercicios hasta completar el tiempo.
 * Vive en localStorage para sobrevivir al cambio de lección. `autostart`: al abrir la siguiente lección, arranca sola.
 */
export type PlanSession = { startedAt: number; minutes: number; autostart?: boolean };
const sessionStore = createLocalStore<PlanSession | null>("fretquest.planSession", null);
export const usePlanSession = sessionStore.use;
export const getPlanSession = sessionStore.get;
export const setPlanSession = sessionStore.set;
/** Días con sesión completada (DATOS LOCALES de la maqueta; con Firestore, `sessions/{uid}_{día}`). */
const sessionDays = createLocalStore<string[]>("fretquest.sessionDays", []);
export const completeSessionToday = () => { const days = sessionDays.get(); if (!days.includes(todayKey())) sessionDays.set([...days, todayKey()]); };
export const setWeeklyGoal = (days: number) => {
  const account = store.get();
  if (!account) return;
  store.set({ ...account, weeklyGoal: days });
  void setDoc(doc(db, "users", account.uid), { weeklyGoal: days }, { merge: true }).catch(() => { /* queda local */ });
};

/** Días distintos con práctica registrada esta semana (lunes a domingo, hora de Lima). */
export const daysPracticedThisWeek = (account: Account | null) => {
  const week = thisWeek();
  return new Set((account?.practices ?? []).map(practice => practice.date).filter(date => week.includes(date))).size;
};

export const LEVELS: Difficulty[] = ["base", "intermedio", "avanzado", "experto"];
export const levelLabel = (level: Difficulty) => DIFFICULTY[level].label;
export const nextLevel = (level: Difficulty) => LEVELS[LEVELS.indexOf(level) + 1] ?? null;

/**
 * Las fechas de la comunidad van en hora de Lima, para que el día y la semana (lunes a domingo)
 * cambien a la misma hora para todos, estén donde estén. `en-CA` da el formato YYYY-MM-DD.
 */
export const COMMUNITY_TIME_ZONE = "America/Lima";
const limaDate = new Intl.DateTimeFormat("en-CA", { timeZone: COMMUNITY_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
export const todayKey = (date = new Date()) => limaDate.format(date);

/** Registra la práctica completada de hoy (solo con sesión iniciada). */
export function recordPractice(lessonId: string) {
  const account = store.get();
  if (!account) return;
  const date = todayKey();
  const practices = account.practices ?? [];
  const counted = practices.some(practice => practice.lessonId === lessonId && practice.date === date);
  store.set({ ...account, lastPractice: { lessonId, date }, practices: counted ? practices : [...practices, { lessonId, date }] });
}

/** Un módulo del plan: el módulo con las lecciones de práctica de ese nivel. */
export type PlanBlock = { moduleId: string; title: string; lessons: PracticeLesson[] };

/** Dificultades de lección que entran en el plan de cada nivel. */
export const PLAN_DIFFICULTIES: Record<Difficulty, Difficulty[]> = {
  base: ["base"],
  intermedio: ["base", "intermedio"],
  avanzado: ["intermedio", "avanzado"],
  experto: ["avanzado"],
};

/**
 * El plan de un nivel sale del temario: cada módulo DISPONIBLE aporta sus lecciones de las dificultades
 * de ese nivel (PLAN_DIFFICULTIES), en el orden del temario. Los módulos «próximamente» se suman solos.
 */
export function planFor(level: Difficulty): PlanBlock[] {
  return courses
    .filter(course => course.available)
    .map(course => ({
      moduleId: course.id,
      title: course.title,
      lessons: course.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === "practice" && PLAN_DIFFICULTIES[level].includes(lesson.difficulty)),
    }))
    .filter(block => block.lessons.length > 0);
}

/** Lecciones del plan en orden, aplanadas. */
const planLessons = (level: Difficulty) => planFor(level).flatMap(block => block.lessons.map(lesson => ({ moduleId: block.moduleId, lesson })));

/**
 * Lo que toca hoy: la lección del plan que sigue a la última practicada (o la primera).
 * `done` = hoy ya practicó; `finished` = la última practicada era la última del plan.
 */
export function suggestion(account: Account) {
  if (!account.level) return null;
  const lessons = planLessons(account.level);
  if (lessons.length === 0) return null;
  const last = account.lastPractice;
  const index = last ? lessons.findIndex(item => item.lesson.id === last.lessonId) : -1;
  const done = last?.date === todayKey();
  const finished = index === lessons.length - 1;
  const next = lessons[(index + 1) % lessons.length];
  return { next, done, finished, position: index + 1, total: lessons.length, lastLesson: index >= 0 ? lessons[index] : null };
}

/** Días de esta semana (lunes → domingo) en hora de Lima, como claves YYYY-MM-DD. */
export const thisWeek = () => { const monday = weekStart(todayKey()); return Array.from({ length: 7 }, (_, day) => addDays(monday, day)); };

/** Prácticas completadas por la cuenta esta semana. */
export const practicesThisWeek = (account: Account | null) => {
  const from = thisWeek()[0];
  return (account?.practices ?? []).filter(practice => practice.date >= from).length;
};
