import { describe, expect, it } from "vitest";
import { GUITAR_STRINGS, centsBetween, detectPitch, nearestString } from "@/lib/audio/pitch";

const RATE = 48000;
/** Tono tipo cuerda: fundamental + armónicos decrecientes. */
function pluck(hz: number, n = 4096) {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    buf[i] = 0.5 * Math.sin(2 * Math.PI * hz * t) + 0.3 * Math.sin(4 * Math.PI * hz * t) + 0.15 * Math.sin(6 * Math.PI * hz * t);
  }
  return buf;
}

describe("detección de tono", () => {
  it.each(GUITAR_STRINGS)("detecta la cuerda $name a ±2 cents", ({ hz }) => {
    const f = detectPitch(pluck(hz), RATE);
    expect(f).not.toBeNull();
    expect(Math.abs(centsBetween(f!, hz))).toBeLessThan(2);
  });

  it("ignora el silencio", () => {
    expect(detectPitch(new Float32Array(4096), RATE)).toBeNull();
  });

  it("elige la cuerda más cercana", () => {
    expect(nearestString(85)).toBe(0);
    expect(nearestString(240)).toBe(4);
  });
});
