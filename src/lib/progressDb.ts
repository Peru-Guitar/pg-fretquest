import { useSyncExternalStore } from "react";
import { arrayUnion, collection, deleteDoc, collectionGroup, doc, getDocs, increment, onSnapshot, query, serverTimestamp, setDoc, Timestamp, where, writeBatch } from "firebase/firestore";
import type { Difficulty } from "@/data/questMock";
import { practiceStudies, speedFromBpm, type Speed } from "@/data/practiceStudies";
import { db } from "@/lib/firebase";
import { invalidateCommunity } from "@/lib/community";

/**
 * Modelo de progreso en Firestore. Se registra al terminar una práctica con sesión iniciada (al salir el resumen).
 *
 *   users/{uid}/days/{fecha}          Registro del día: tiempo total, si se completó la sesión y los intentos por lección.
 *   users/{uid}/lessons/{lessonId}    Resumen por lección de PRÁCTICA para Mi plan: días, intentos y última vez.
 *   users/{uid}/readings/{lessonId}   Lecciones de LECTURA marcadas como leídas: `readAt`.
 *   rankings/{semana}                 Ranking precalculado (solo lo escribe una Cloud Function, más adelante).
 *
 * Los documentos guardan solo `lessonId`, nunca el módulo: la lección puede cambiar de módulo sin migrar nada.
 * Las horas van en UTC (Timestamp); la web las muestra en la hora del navegador.
 */

/**
 * Un intento: rondas completadas de una lección, con fecha y hora exactas. `speed`: nivel de velocidad (1–5); los
 * intentos anteriores a los niveles solo traen `bpm` (ver `attemptSpeed`).
 */
export type Attempt = { startedAt: Timestamp; endedAt: Timestamp; seconds: number; rounds: number; bpm: number; speed?: Speed };

/** Nivel de velocidad de un intento; los antiguos (solo BPM) se pasan al nivel más cercano según la figura de la lección. */
export const attemptSpeed = (lessonId: string, attempt: Pick<Attempt, "bpm" | "speed">): Speed | null =>
  attempt.speed ?? (attempt.bpm ? speedFromBpm(practiceStudies[lessonId]?.figure ?? "negras", attempt.bpm) : null);

export type DayDoc = {
  /** Día local del usuario, YYYY-MM-DD (= id del documento). */
  date: string;
  /** Copias al momento de practicar, para que el ranking no necesite joins. */
  name: string;
  level: Difficulty | null;
  /** Segundos practicados ese día, todas las lecciones. */
  seconds: number;
  /** Llegó a su duración de sesión (15/30/45 min): el día cuenta para su ritmo. */
  completed: boolean;
  lessons: Record<string, { attempts: number; seconds: number; sessions: Attempt[] }>;
  updatedAt: Timestamp;
};

export type LessonSummary = { days: number; attempts: number; lastAt: Timestamp };
/** `name`: copia del nombre al marcarla, para mostrar quién la leyó sin joins (las antiguas no lo tienen). */
export type Reading = { readAt: Timestamp; name?: string };

/** Clave YYYY-MM-DD de un instante en la hora del navegador. */
export const localDateKey = (at = new Date()) => `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;

/**
 * Registra un intento. Una sola escritura por documento, sin leer antes:
 * los contadores suben con `increment` y el intento se añade con `arrayUnion`.
 * `firstToday`: primera vez que se practica esta lección hoy (sube `days` del resumen).
 */
export async function recordAttempt(params: {
  uid: string; name: string; level: Difficulty | null; lessonId: string;
  startedAt: Date; endedAt: Date; rounds: number; speed: Speed; bpm: number;
  sessionSeconds: number; daySecondsBefore: number; completedBefore: boolean; firstToday: boolean;
}) {
  const seconds = Math.round((params.endedAt.getTime() - params.startedAt.getTime()) / 1000);
  const date = localDateKey(params.endedAt);
  const attempt: Attempt = { startedAt: Timestamp.fromDate(params.startedAt), endedAt: Timestamp.fromDate(params.endedAt), seconds, rounds: params.rounds, speed: params.speed, bpm: params.bpm };
  const batch = writeBatch(db);
  batch.set(doc(db, "users", params.uid, "days", date), {
    date, name: params.name, level: params.level,
    seconds: increment(seconds),
    // Una vez completado, el día no vuelve atrás.
    completed: params.completedBefore || params.daySecondsBefore + seconds >= params.sessionSeconds,
    lessons: { [params.lessonId]: { attempts: increment(1), seconds: increment(seconds), sessions: arrayUnion(attempt) } },
    updatedAt: serverTimestamp(),
  }, { merge: true });
  batch.set(doc(db, "users", params.uid, "lessons", params.lessonId), {
    days: increment(params.firstToday ? 1 : 0),
    attempts: increment(1),
    lastAt: attempt.endedAt,
  }, { merge: true });
  await batch.commit();
}

/** Días del usuario desde `from` (YYYY-MM-DD): progreso de hoy y de la semana. */
export async function readMyDays(uid: string, from: string) {
  const snapshot = await getDocs(query(collection(db, "users", uid, "days"), where("date", ">=", from)));
  return snapshot.docs.map(item => item.data() as DayDoc);
}

/** Resumen de todas las lecciones practicadas por el usuario (Mi plan). */
export async function readLessonSummaries(uid: string) {
  const snapshot = await getDocs(collection(db, "users", uid, "lessons"));
  return Object.fromEntries(snapshot.docs.map(item => [item.id, item.data({ serverTimestamps: "estimate" }) as LessonSummary]));
}

/** Días de todos los usuarios desde `from`: base del ranking semanal (con caché en el front, más adelante). */
export async function readCommunityDays(from: string) {
  const snapshot = await getDocs(query(collectionGroup(db, "days"), where("date", ">=", from)));
  return snapshot.docs.map(item => ({ uid: item.ref.parent.parent?.id ?? "", ...(item.data() as DayDoc) }));
}

/** Lecturas marcadas de todos desde el lunes `from` (consulta de grupo sobre `readings`): quién leyó cada lección esta semana. */
export async function readCommunityReadings(from: string) {
  const [y, m, d] = from.split("-").map(Number);
  const snapshot = await getDocs(query(collectionGroup(db, "readings"), where("readAt", ">=", Timestamp.fromDate(new Date(y, m - 1, d)))));
  return snapshot.docs.map(item => ({ uid: item.ref.parent.parent?.id ?? "", lessonId: item.id, name: (item.data() as Reading).name }));
}

/** Guarda el nombre visible en el perfil (lo copian los días para el ranking). */
export const saveName = (uid: string, name: string) => setDoc(doc(db, "users", uid), { name }, { merge: true });

/* ── Progreso en vivo de la cuenta ─────────────────────────────────────────
 * Con sesión iniciada se escuchan los días de esta semana y los resúmenes por lección.
 * Sin sesión, el progreso queda vacío y no se registra nada. */

export type Progress = { uid: string | null; days: Record<string, DayDoc>; lessons: Record<string, LessonSummary>; readings: Record<string, Reading> };
const empty: Progress = { uid: null, days: {}, lessons: {}, readings: {} };
let progress = empty;
const listeners = new Set<() => void>();
const emit = (next: Progress) => { progress = next; listeners.forEach(listener => listener()); };
let unsubscribe: (() => void) | null = null;

/** Lunes de esta semana en la hora del navegador. */
export function weekStartKey(at = new Date()) {
  const monday = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDateKey(monday);
}

/** Empieza (o corta, con null) la escucha del progreso de un usuario. */
// `estimate`: las horas del servidor recién escritas llegan ya con valor (no null) mientras se confirman.
export function watchProgress(uid: string | null) {
  unsubscribe?.();
  unsubscribe = null;
  if (!uid) { emit(empty); return; }
  emit({ uid, days: {}, lessons: {}, readings: {} });
  const stopDays = onSnapshot(query(collection(db, "users", uid, "days"), where("date", ">=", weekStartKey())), snapshot => {
    emit({ ...progress, days: Object.fromEntries(snapshot.docs.map(item => [item.id, item.data({ serverTimestamps: "estimate" }) as DayDoc])) });
  }, error => console.warn("progreso: días", error)); // sin permisos o sin conexión: queda lo último conocido
  const stopLessons = onSnapshot(collection(db, "users", uid, "lessons"), snapshot => {
    emit({ ...progress, lessons: Object.fromEntries(snapshot.docs.map(item => [item.id, item.data({ serverTimestamps: "estimate" }) as LessonSummary])) });
  }, error => console.warn("progreso: lecciones", error));
  const stopReadings = onSnapshot(collection(db, "users", uid, "readings"), snapshot => {
    emit({ ...progress, readings: Object.fromEntries(snapshot.docs.map(item => [item.id, item.data({ serverTimestamps: "estimate" }) as Reading])) });
  }, error => console.warn("progreso: lecturas", error));
  unsubscribe = () => { stopDays(); stopLessons(); stopReadings(); };
}

export const getProgress = () => progress;
export const useProgress = () => useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getProgress, () => empty);

/** Lo de hoy: segundos practicados, si ya se completó la sesión y qué lecciones se tocaron. */
export const todayOf = (current: Progress) => current.days[localDateKey()] ?? null;
/** Días con la sesión completada esta semana (cuentan para el ritmo). */
export const completedDaysThisWeek = (current: Progress) => Object.values(current.days).filter(day => day.completed).length;

/**
 * Registra la práctica que acaba de terminar (al mostrarse el resumen). Devuelve los minutos de hoy
 * antes y después, para el modal. Sin sesión no hace nada y devuelve null.
 */
export async function recordFinishedPractice(params: { name: string; level: Difficulty | null; sessionMinutes: number; lessonId: string; startedAt: Date; endedAt: Date; rounds: number; speed: Speed; bpm: number }) {
  const { uid } = progress;
  if (!uid) return null;
  const today = todayOf(progress);
  const daySecondsBefore = today?.seconds ?? 0;
  const seconds = Math.round((params.endedAt.getTime() - params.startedAt.getTime()) / 1000);
  await recordAttempt({
    uid, name: params.name, level: params.level, lessonId: params.lessonId,
    startedAt: params.startedAt, endedAt: params.endedAt, rounds: params.rounds, speed: params.speed, bpm: params.bpm,
    sessionSeconds: params.sessionMinutes * 60, daySecondsBefore, completedBefore: today?.completed ?? false,
    firstToday: !today?.lessons?.[params.lessonId],
  });
  // Tu práctica tiene que verse ya en Comunidad: se descarta su caché.
  invalidateCommunity();
  return { beforeSeconds: daySecondsBefore, addedSeconds: seconds };
}

/** Marca (o desmarca) una lección de lectura como leída. Sin sesión no hace nada. */
export function setReadingDone(lessonId: string, done: boolean, name: string) {
  const { uid } = progress;
  if (!uid) return Promise.resolve();
  const ref = doc(db, "users", uid, "readings", lessonId);
  return done ? setDoc(ref, { readAt: serverTimestamp(), name: name.slice(0, 40) }) : deleteDoc(ref);
}
