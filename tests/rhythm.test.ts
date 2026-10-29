import { describe, expect, it } from "vitest";
import { rhythmOf, rhythmSummary } from "@/lib/rhythm";

const notes = (...beats: (number | undefined)[]) => beats.map(value => ({ string: 1, fret: 0, ...(value !== undefined && { beats: value }) }));

describe("ritmo de la tablatura", () => {
  it("semicorcheas: dos barras, un grupo por pulso", () => {
    const marks = rhythmOf(notes(...Array(8).fill(undefined)), 4);
    expect(marks.map(mark => mark.beams)).toEqual([2, 2, 2, 2, 2, 2, 2, 2]);
    expect(marks.map(mark => mark.joined)).toEqual([0, 2, 2, 2, 0, 2, 2, 2]);
  });

  it("tresillos de semicorchea: grupos de medio pulso con el 3 en la nota del medio", () => {
    const marks = rhythmOf(notes(...Array(6).fill(undefined)), 6);
    expect(marks.map(mark => mark.joined)).toEqual([0, 2, 2, 0, 2, 2]);
    expect(marks.map(mark => mark.tuplet?.label)).toEqual([false, true, false, false, true, false]);
  });

  it("ritmo mixto: tresillos de semicorchea y semicorcheas, y la negra final sin barras", () => {
    const marks = rhythmOf(notes(1 / 6, 1 / 6, 1 / 6, 0.25, 0.25, 1), 6);
    expect(marks.map(mark => mark.beams)).toEqual([2, 2, 2, 2, 2, 0]);
    expect(marks.map(mark => mark.joined)).toEqual([0, 2, 2, 0, 2, 0]);
    expect(marks[3].tuplet).toBeUndefined();
    expect(rhythmSummary(notes(1 / 6, 0.25, 1), "Sextillos", 6)).toBe("Ritmo mixto");
    expect(rhythmSummary(notes(undefined, undefined, 1), "Sextillos", 6)).toBe("Sextillos");
  });
});
