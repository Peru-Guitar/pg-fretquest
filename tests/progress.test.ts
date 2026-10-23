import { describe, expect, it } from "vitest";
import { LEVELS } from "@/lib/domain/catalog";
import { exerciseAfter, isLessonDone, nextPractice, routeProgress } from "@/lib/domain/progress";

const ids = (levelIdx: number, lessons: number) =>
  LEVELS[levelIdx].lessons.slice(0, lessons).flatMap((l) => l.exercises.map((e) => e.id));

describe("progreso en la ruta", () => {
  it("sin práctica: nivel 1, rango inicial y la primera lección como siguiente", () => {
    const p = routeProgress(LEVELS, new Set());
    expect(p).toMatchObject({ levelDone: 0, levelTotal: 8, totalDone: 0, total: 72, finished: false });
    expect(p.level.rank).toBe("Principiante");
    expect(p.nextLesson?.id).toBe(LEVELS[0].lessons[0].id);
  });

  it("una lección se termina solo con todos sus ejercicios", () => {
    const lesson = LEVELS[0].lessons[0];
    expect(isLessonDone(lesson, new Set([lesson.exercises[0].id]))).toBe(false);
    expect(isLessonDone(lesson, new Set(lesson.exercises.map((e) => e.id)))).toBe(true);
  });

  it("al terminar el nivel 1 pasa al nivel 2", () => {
    const p = routeProgress(LEVELS, new Set([...ids(0, 8), ...ids(1, 3)]));
    expect(p).toMatchObject({ levelDone: 3, totalDone: 11 });
    expect(p.level.number).toBe(2);
    expect(p.level.rank).toBe("Aprendiz");
  });

  it("la ruta completa queda en el último nivel", () => {
    const all = new Set(LEVELS.flatMap((l) => l.lessons.flatMap((x) => x.exercises.map((e) => e.id))));
    const p = routeProgress(LEVELS, all);
    expect(p).toMatchObject({ finished: true, nextLesson: null, totalDone: 72 });
    expect(p.level.number).toBe(8);
  });
});

describe("siguiente práctica", () => {
  it("primera visita: primer ejercicio de la primera lección", () => {
    const n = nextPractice(LEVELS, new Set());
    expect(n).toMatchObject({ exerciseIndex: 0, started: false });
    expect(n?.lesson.id).toBe(LEVELS[0].lessons[0].id);
  });

  it("lección a medias: continúa con su ejercicio pendiente", () => {
    const n = nextPractice(LEVELS, new Set([...ids(0, 2), LEVELS[0].lessons[2].exercises[0].id]));
    expect(n?.lesson.id).toBe(LEVELS[0].lessons[2].id);
    expect(n).toMatchObject({ exerciseIndex: 1, started: true });
  });

  it("ruta completa: no hay siguiente; el siguiente ejercicio cruza lecciones", () => {
    const all = new Set(LEVELS.flatMap((l) => l.lessons.flatMap((x) => x.exercises.map((e) => e.id))));
    expect(nextPractice(LEVELS, all)).toBeNull();
    const l0 = LEVELS[0].lessons;
    expect(exerciseAfter(LEVELS, l0[0].exercises[1].id)?.id).toBe(l0[1].exercises[0].id);
  });
});
