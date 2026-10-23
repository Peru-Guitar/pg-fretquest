import { describe, expect, it } from "vitest";
import { LEVELS } from "@/lib/domain/catalog";
import { addDays, computeReport, exerciseHistory, weekStart, xpForSession, type PracticeEntry } from "@/lib/domain/report";

const at = (date: string, hour = 20) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, hour).getTime();
};
const lesson = LEVELS[0].lessons[0];
const entry = (id: string, exerciseId: string, date: string, minutes = 5): PracticeEntry => ({ id, exerciseId, minutes, bpm: 60, xp: minutes * 10, at: at(date) });

describe("reporte", () => {
  const NOW = at("2026-10-22", 12); // jueves
  const entries = [
    entry("a", lesson.exercises[0].id, "2026-10-20"),
    entry("b", lesson.exercises[1].id, "2026-10-21", 10),
    entry("c", lesson.exercises[1].id, "2026-10-21"),
    entry("d", LEVELS[1].lessons[0].exercises[0].id, "2026-10-02"),
  ];

  it("suma minutos por semana, mes y día", () => {
    const r = computeReport(entries, LEVELS, NOW);
    expect(r).toMatchObject({ totalMinutes: 25, sessions: 4, daysPracticed: 3, weekMinutes: 20, monthMinutes: 25 });
    expect(r.minutesByDate["2026-10-21"]).toBe(15);
    expect(r.lastDays).toHaveLength(14);
    expect(r.lastDays.at(-1)).toEqual({ date: "2026-10-22", minutes: 0 });
  });

  it("cuenta la racha hasta ayer si hoy aún no se practicó", () => {
    expect(computeReport(entries, LEVELS, NOW).streak).toBe(2);
    expect(computeReport(entries, LEVELS, at("2026-10-24")).streak).toBe(0);
  });

  it("progreso por nivel y ejercicios", () => {
    const r = computeReport(entries, LEVELS, NOW);
    expect(r.levels[0]).toMatchObject({ done: 1, total: 8 });
    expect(r.levels[1]).toMatchObject({ done: 0 });
    expect(r).toMatchObject({ exercisesDone: 3, exercisesTotal: 144 });
  });

  it("fechas locales: semana desde el lunes", () => {
    expect(weekStart("2026-10-22")).toBe("2026-10-19");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("XP por sesión e historial por ejercicio", () => {
    expect(xpForSession(5, 60)).toBe(50);
    expect(xpForSession(10, 120)).toBe(150);
    expect(computeReport(entries, LEVELS, NOW).totalXP).toBe(250);
    const h = exerciseHistory([...entries, { ...entries[1], id: "e", bpm: 90, at: at("2026-10-22") }], lesson.exercises[1].id);
    expect(h).toMatchObject({ sessions: 3, bestBpm: 90 });
    expect(h.entries.at(-1)?.id).toBe("e");
  });
});
