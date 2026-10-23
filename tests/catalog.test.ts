import { describe, expect, it } from "vitest";
import { findExercise, findLesson, LEVELS } from "@/lib/domain/catalog";

describe("ruta de aprendizaje", () => {
  const lessons = LEVELS.flatMap((l) => l.lessons);
  const exercises = lessons.flatMap((l) => l.exercises);

  it("tiene 8 niveles en orden y 72 lecciones con dos ejercicios cada una", () => {
    expect(LEVELS.map((l) => l.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(lessons).toHaveLength(72);
    for (const l of lessons) expect(l.exercises, l.id).toHaveLength(2);
  });

  it("los ids de lecciones y ejercicios son únicos", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
  });

  it("enlaza lecciones vecinas a través de los niveles", () => {
    const last1 = LEVELS[0].lessons.at(-1)!;
    expect(findLesson(last1.id)?.next?.id).toBe(LEVELS[1].lessons[0].id);
    expect(findLesson(LEVELS[0].lessons[0].id)?.prev).toBeNull();
    expect(findExercise(`${last1.id}-2`)?.level.number).toBe(1);
  });

  it("las tablaturas tienen seis cuerdas del mismo largo", () => {
    for (const e of exercises) {
      const lines = e.tab.split("\n");
      expect(lines.map((l) => l[0]).join(""), e.id).toBe("eBGDAE");
      expect(new Set(lines.map((l) => l.length)).size, e.id).toBe(1);
    }
  });
});
