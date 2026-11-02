/**
 * Reporte de progreso: UN documento por usuario (`progressReports/{uid}`) con su resumen ya calculado.
 * El perfil solo lo lee (1 lectura). Al terminar cada lección se lee, se le suma la práctica (`applyPractice`)
 * y se reescribe. No guarda cada práctica: por lección, solo cuántas veces y cuánto tiempo; por día, solo las
 * últimas 8 semanas. Así su tamaño tiene techo (el catálogo de lecciones) y no crece con el tiempo.
 */
const PROGRESS_VERSION = 2;
/** Semanas de días que se guardan (para «Esta semana» y «Últimas 8 semanas»). */
const PROGRESS_WEEKS = 8;

type ProgressLesson = { practices: number; seconds: number; /** Fin de la última práctica, en ms. */ lastAt: number };
export type ProgressReport = {
  version: number;
  /** Prácticas terminadas y días con práctica, desde siempre. */
  practices: number;
  practiceDays: number;
  /** Primer y último día con práctica (YYYY-MM-DD). */
  firstDate: string | null;
  lastDate: string | null;
  /** Segundos por día (YYYY-MM-DD), solo las últimas PROGRESS_WEEKS semanas. */
  days: Record<string, number>;
  /** Histórico por lección. */
  lessons: Record<string, ProgressLesson>;
};

/** Una práctica terminada, con lo que ya sabe la app al guardarla. */
export type FinishedPractice = { date: string; lessonId: string; seconds: number; endedAt: number };

export const emptyProgress = (): ProgressReport => ({ version: PROGRESS_VERSION, practices: 0, practiceDays: 0, firstDate: null, lastDate: null, days: {}, lessons: {} });

export const addDays = (key: string, days: number) => {
  const [y, m, d] = key.split("-").map(Number);
  const at = new Date(y, m - 1, d + days);
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
};

/** Deja en `days` solo las semanas que se muestran, contadas desde el lunes `monday`. */
function trimDays(days: Record<string, number>, monday: string) {
  const from = addDays(monday, -(PROGRESS_WEEKS - 1) * 7);
  return Object.fromEntries(Object.entries(days).filter(([date]) => date >= from));
}

/** Suma una práctica al reporte. No modifica el original. */
export function applyPractice(report: ProgressReport, practice: FinishedPractice, monday: string): ProgressReport {
  const lesson = report.lessons[practice.lessonId] ?? { practices: 0, seconds: 0, lastAt: 0 };
  // El día de hoy siempre está dentro de la ventana: si no figura, es la primera práctica del día.
  const firstOfDay = !(practice.date in report.days);
  return {
    version: PROGRESS_VERSION,
    practices: report.practices + 1,
    practiceDays: report.practiceDays + (firstOfDay ? 1 : 0),
    firstDate: report.firstDate && report.firstDate < practice.date ? report.firstDate : practice.date,
    lastDate: report.lastDate && report.lastDate > practice.date ? report.lastDate : practice.date,
    days: trimDays({ ...report.days, [practice.date]: (report.days[practice.date] ?? 0) + practice.seconds }, monday),
    lessons: {
      ...report.lessons,
      [practice.lessonId]: { practices: lesson.practices + 1, seconds: lesson.seconds + practice.seconds, lastAt: Math.max(lesson.lastAt, practice.endedAt) },
    },
  };
}

/** Un día guardado (`users/{uid}/days`), con lo justo para reconstruir el reporte. */
export type SourceDay = {
  date: string; seconds?: number;
  lessons?: Record<string, { attempts?: number; seconds?: number; sessions?: { endedAt: { toMillis(): number } }[] }>;
};

/** Reconstruye el reporte completo desde todos los días del usuario (botón de Backstage o quien aún no tiene). */
export function buildProgress(days: SourceDay[], monday: string): ProgressReport {
  const report = emptyProgress();
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    report.practiceDays += 1;
    report.firstDate ??= day.date;
    report.lastDate = day.date;
    report.days[day.date] = day.seconds ?? 0;
    for (const [lessonId, item] of Object.entries(day.lessons ?? {})) {
      const lesson = report.lessons[lessonId] ?? (report.lessons[lessonId] = { practices: 0, seconds: 0, lastAt: 0 });
      lesson.practices += item.attempts ?? 0;
      lesson.seconds += item.seconds ?? 0;
      for (const session of item.sessions ?? []) lesson.lastAt = Math.max(lesson.lastAt, session.endedAt.toMillis());
      report.practices += item.attempts ?? 0;
    }
  }
  report.days = trimDays(report.days, monday);
  return report;
}
