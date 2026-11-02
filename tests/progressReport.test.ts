import { describe, expect, it } from "vitest";
import { applyPractice, buildProgress, emptyProgress } from "@/lib/domain/progressReport";

const monday = "2026-10-26";
const practice = (date: string, lessonId: string, seconds: number) => ({ date, lessonId, seconds, endedAt: new Date(`${date}T20:00:00`).getTime() });

describe("applyPractice", () => {
  it("suma veces y tiempo por lección y cuenta el día una sola vez", () => {
    let report = applyPractice(emptyProgress(), practice("2026-10-27", "a", 300), monday);
    report = applyPractice(report, practice("2026-10-27", "a", 200), monday);
    report = applyPractice(report, practice("2026-10-28", "b", 100), monday);
    expect(report).toMatchObject({ practices: 3, practiceDays: 2, firstDate: "2026-10-27", lastDate: "2026-10-28" });
    expect(report.lessons.a).toMatchObject({ practices: 2, seconds: 500 });
    expect(report.days).toEqual({ "2026-10-27": 500, "2026-10-28": 100 });
  });

  it("guarda solo las últimas 8 semanas de días", () => {
    const old = { ...emptyProgress(), days: { "2026-08-01": 600, "2026-09-07": 60 } };
    expect(applyPractice(old, practice("2026-10-27", "a", 30), monday).days).toEqual({ "2026-09-07": 60, "2026-10-27": 30 });
  });
});

describe("buildProgress", () => {
  it("rearma lo mismo desde los días", () => {
    const at = (iso: string) => ({ endedAt: { toMillis: () => new Date(iso).getTime() } });
    const report = buildProgress([
      { date: "2026-10-28", seconds: 100, lessons: { b: { attempts: 1, seconds: 100, sessions: [at("2026-10-28T20:00:00")] } } },
      { date: "2026-10-27", seconds: 500, lessons: { a: { attempts: 2, seconds: 500, sessions: [at("2026-10-27T20:00:00")] } } },
    ], monday);
    expect(report).toMatchObject({ practices: 3, practiceDays: 2, firstDate: "2026-10-27", lastDate: "2026-10-28" });
    expect(report.lessons.a).toMatchObject({ practices: 2, seconds: 500 });
  });
});
