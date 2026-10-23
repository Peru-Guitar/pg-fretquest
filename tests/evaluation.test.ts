import { describe, expect, it } from "vitest";
import { evaluate, simulateStep } from "@/lib/domain/evaluation";

describe("evaluación (detección simulada)", () => {
  it("es determinista para la misma sesión y paso", () => {
    expect(simulateStep(42, 7, 80, 120)).toEqual(simulateStep(42, 7, 80, 120));
  });

  it("sin notas tocadas no hay puntuación", () => {
    expect(evaluate(1, 0, 16, 60, 120)).toMatchObject({ score: 0, approved: false, validReps: 0 });
  });

  it("a tempo cómodo aprueba; muy por encima del objetivo baja la puntuación", () => {
    const easy = evaluate(7, 16 * 20, 16, 60, 120);
    const hard = evaluate(7, 16 * 20, 16, 200, 120);
    expect(easy.score).toBeGreaterThanOrEqual(85);
    expect(easy.approved).toBe(true);
    expect(hard.score).toBeLessThan(easy.score);
  });

  it("cuenta repeticiones completas y aplica los pesos 40/40/20", () => {
    const e = evaluate(3, 16 * 5 + 4, 16, 90, 120);
    expect(e.validReps + e.invalidReps).toBe(5);
    expect(e.score).toBe(Math.round(0.4 * ((e.notesPct + e.orderPct) / 2) + 0.4 * e.rhythmPct + 0.2 * e.continuityPct));
  });
});
