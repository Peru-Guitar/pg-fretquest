import { describe, expect, it } from "vitest";
import { LEVELS } from "@/lib/domain/catalog";
import { parseTab, pickDirections } from "@/lib/domain/tab";

describe("parser de tablatura", () => {
  it("separa ligados en notas y marcas, y agrupa columnas", () => {
    const { rows, steps } = parseTab(`e|-12p8---|
B|-----10-|
G|-9------|`);
    const notes = rows[0].notes.map((n) => [n.string, n.fret, n.col]);
    expect(notes).toEqual([[1, 12, 1], [1, 8, 4], [2, 10, 5], [3, 9, 1]]);
    expect(rows[0].marks).toMatchObject([{ string: 1, label: "p" }]);
    // 12 y 9 están en la misma columna: suenan juntas en un solo paso.
    expect(steps).toEqual([1, 4, 5]);
  });

  it("encadena filas separadas por una línea en blanco", () => {
    const { rows, steps } = parseTab("e|-1-|\n\ne|-2-|");
    expect(rows).toHaveLength(2);
    expect(steps).toEqual([1, 4]);
  });

  it("alterna la púa por golpe", () => {
    const d = pickDirections([1, 3, 5], "alternate");
    expect([...d.values()]).toEqual([true, false, true]);
    expect([...pickDirections([1, 3], "alternate-up").values()]).toEqual([false, true]);
  });

  it("todas las tablaturas del catálogo tienen notas", () => {
    for (const lv of LEVELS) for (const l of lv.lessons) for (const e of l.exercises) {
      expect(parseTab(e.tab).steps.length, e.id).toBeGreaterThan(3);
    }
  });
});
