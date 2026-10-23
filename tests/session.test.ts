import { describe, expect, it } from "vitest";
import { elapsedMs, newSession, retempo, stepsAt } from "@/lib/session";

describe("sesión", () => {
  it("avanza una nota por subdivisión", () => {
    const s = { ...newSession("x", "practice", 60, 5), startedAt: 0 };
    // 60 BPM en semicorcheas: 250 ms por nota.
    expect(stepsAt(s, 1000, 4)).toBe(4);
  });

  it("cambiar el tempo conserva la posición del cursor", () => {
    const s = { ...newSession("x", "practice", 60, 5), startedAt: 0 };
    const now = 10_000; // 40 notas a 60 BPM
    const faster = retempo(s, 120, now, 4);
    expect(stepsAt(faster, elapsedMs(faster, now), 4)).toBe(40);
    // Un segundo después a 120 BPM: 8 notas más (125 ms por nota).
    expect(stepsAt(faster, elapsedMs(faster, now + 1000), 4)).toBe(48);
  });

  it("las pausas no cuentan como tiempo tocado", () => {
    const s = { ...newSession("x", "progress", 60, 5), startedAt: 0, pausedMs: 3000 };
    expect(elapsedMs(s, 10_000)).toBe(7000);
    expect(s.durationMs).toBe(300_000);
  });
});
