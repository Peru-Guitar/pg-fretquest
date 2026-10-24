import { describe, expect, it } from "vitest";
import { courses } from "@/data/questMock";
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
