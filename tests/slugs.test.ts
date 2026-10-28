import { describe, expect, it } from "vitest";
import { courses } from "@/data/questMock";
import { practiceStudies } from "@/data/practiceStudies";
import { lessonSlug } from "@/lib/routes";

describe("títulos y slugs de lección", () => {
  const lessons = courses.flatMap((course) => course.lessons);
  const repeated = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);

  it("cada título es único en toda la app", () => {
    expect(repeated(lessons.map((lesson) => lesson.title))).toEqual([]);
  });

  it("cada slug es único en toda la app", () => {
    expect(repeated(lessons.map((lesson) => lessonSlug(lesson.id)))).toEqual([]);
  });
});

describe("descripciones de los ejercicios", () => {
  const descriptions = Object.values(practiceStudies).map((study) => study.description);

  it("cada descripción es única", () => {
    expect(descriptions.filter((value, index) => descriptions.indexOf(value) !== index)).toEqual([]);
  });

  it("ninguna pasa de 200 caracteres", () => {
    expect(descriptions.filter((value) => value.length > 200)).toEqual([]);
  });
});
