import { describe, expect, it } from "vitest";
import { buildReportBody, REPORT_RANKING, type WeekSummary } from "@/lib/domain/communityReport";

const person = (n: number) => ({ uid: `u${n}`, name: `Persona ${n}`, total: n, seconds: 1000 - n, active: 1 });
const summary: WeekSummary = {
  people: 20, attempts: 40, today: 3, byDay: [1, 2, 3, 4, 5, 6, 0],
  byLevel: { base: 50, intermedio: 50, avanzado: 0, experto: 0 },
  topLessons: [{ lessonId: "a", attempts: 7 }],
  ranking: Array.from({ length: 20 }, (_, i) => person(i + 1)),
  byModule: {}, byLesson: {},
};

describe("reporte de comunidad", () => {
  it("guarda solo el top del ranking, con el total de cada uno", () => {
    const body = buildReportBody("2026-10-26", summary, new Map([["u1", 150 * 3600]]));
    expect(body.ranking).toHaveLength(REPORT_RANKING);
    expect(body.ranking[0]).toEqual({ uid: "u1", name: "Persona 1", seconds: 999, days: 1, practices: 1, totalSeconds: 150 * 3600 });
    expect(body.ranking[1].totalSeconds).toBe(0);
  });

  it("guarda el avatar solo de quien eligió uno", () => {
    const body = buildReportBody("2026-10-26", summary, new Map(), new Map([["u1", "avatar-id"]]));
    expect(body.ranking[0].avatar).toBe("avatar-id");
    expect("avatar" in body.ranking[1]).toBe(false);
  });

  it("cuenta a TODOS los activos por rango, no solo al top", () => {
    const body = buildReportBody("2026-10-26", summary, new Map([["u1", 150 * 3600], ["u20", 20 * 3600]]));
    const count = Object.fromEntries(body.byRank.map(row => [row.rank, row.people]));
    expect(count).toEqual({ "Fret Legend": 1, "Riff Machine": 1, "Primer acorde": 18 });
  });
});
