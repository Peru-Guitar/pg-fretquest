import type { Exercise, Lesson, Level } from "./catalog";

export interface RouteProgress {
  /** Nivel actual: el primero con lecciones sin terminar (o el último si todo está hecho). */
  level: Level;
  levelDone: number;
  levelTotal: number;
  totalDone: number;
  total: number;
  /** Primera lección sin terminar de la ruta, o null si está completa. */
  nextLesson: Lesson | null;
  finished: boolean;
}

/** Una lección está terminada cuando todos sus ejercicios lo están. */
export function isLessonDone(lesson: Lesson, completed: ReadonlySet<string>): boolean {
  return lesson.exercises.length > 0 && lesson.exercises.every((e) => completed.has(e.id));
}

export function routeProgress(levels: Level[], completed: ReadonlySet<string>): RouteProgress {
  const lessons = levels.flatMap((l) => l.lessons);
  const totalDone = lessons.filter((l) => isLessonDone(l, completed)).length;
  const level = levels.find((lv) => lv.lessons.some((l) => !isLessonDone(l, completed))) ?? levels[levels.length - 1];
  return {
    level,
    levelDone: level.lessons.filter((l) => isLessonDone(l, completed)).length,
    levelTotal: level.lessons.length,
    totalDone,
    total: lessons.length,
    nextLesson: lessons.find((l) => !isLessonDone(l, completed)) ?? null,
    finished: totalDone === lessons.length,
  };
}

export interface NextPractice {
  level: Level;
  lesson: Lesson;
  exercise: Exercise;
  exerciseIndex: number;
  /** La lección ya tiene algún ejercicio completado. */
  started: boolean;
}

/** Siguiente lección pendiente y, dentro de ella, su primer ejercicio pendiente. */
export function nextPractice(levels: Level[], completed: ReadonlySet<string>): NextPractice | null {
  for (const level of levels) {
    for (const lesson of level.lessons) {
      if (isLessonDone(lesson, completed)) continue;
      const exerciseIndex = lesson.exercises.findIndex((e) => !completed.has(e.id));
      return {
        level,
        lesson,
        exercise: lesson.exercises[exerciseIndex],
        exerciseIndex,
        started: lesson.exercises.some((e) => completed.has(e.id)),
      };
    }
  }
  return null;
}

/** Ejercicio que sigue a `exerciseId` en la ruta (para «Siguiente ejercicio»). */
export function exerciseAfter(levels: Level[], exerciseId: string): Exercise | null {
  const all = levels.flatMap((l) => l.lessons.flatMap((x) => x.exercises));
  const i = all.findIndex((e) => e.id === exerciseId);
  return i >= 0 ? (all[i + 1] ?? null) : null;
}
