/**
 * Lee una tablatura ASCII (cuerda aguda arriba) y la convierte en notas
 * posicionadas para dibujarla y reproducirla.
 *
 * - Una línea en blanco empieza una nueva fila; la reproducción sigue de fila en fila.
 * - Cada grupo de dígitos es una nota. Las letras entre notas (h, p, t, /, \, ~, x)
 *   son marcas de técnica: se dibujan pero no suenan.
 * - Las notas en la misma columna suenan juntas y cuentan como un solo golpe.
 */

export type Picking = "alternate" | "alternate-up" | "down" | "up";

export interface TabNote {
  /** 1 = cuerda aguda … 6 = grave. */
  string: number;
  fret: number;
  /** Columna global (a través de todas las filas): define el orden de reproducción. */
  col: number;
  /** Posición horizontal dentro de su fila, 0..1 (centro de la nota). */
  x: number;
  label: string;
}

export interface TabMark {
  string: number;
  x: number;
  label: string;
}

export interface TabRow {
  names: string[];
  cols: number;
  notes: TabNote[];
  marks: TabMark[];
}

export interface ParsedTab {
  rows: TabRow[];
  /** Columnas con al menos una nota, en orden: cada una es un paso de reproducción. */
  steps: number[];
}

export function parseTab(text: string): ParsedTab {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const i = line.indexOf("|");
          const name = i >= 0 ? line.slice(0, i).trim() : "";
          // Sin barras de compás: un `|` intermedio cuenta como columna vacía.
          const body = (i >= 0 ? line.slice(i + 1) : line).replace(/\|\s*$/, "").replace(/\|/g, "-");
          return { name, body };
        }),
    )
    .filter((b) => b.length);

  let offset = 0;
  const rows = blocks.map((strings): TabRow => {
    const cols = Math.max(1, ...strings.map((s) => s.body.length));
    const notes: TabNote[] = [];
    const marks: TabMark[] = [];
    strings.forEach((s, idx) => {
      for (const m of s.body.matchAll(/\d+|[^-\s\d]/g)) {
        const x = (m.index! + m[0].length / 2) / cols;
        if (/^\d+$/.test(m[0])) notes.push({ string: idx + 1, fret: Number(m[0]), col: offset + m.index!, x, label: m[0] });
        else marks.push({ string: idx + 1, x, label: m[0] });
      }
    });
    offset += cols;
    return { names: strings.map((s) => s.name), cols, notes, marks };
  });

  const steps = [...new Set(rows.flatMap((r) => r.notes.map((n) => n.col)))].sort((a, b) => a - b);
  return { rows, steps };
}

/** Dirección de púa de cada golpe (true = abajo), alternando de izquierda a derecha. */
export function pickDirections(steps: number[], picking: Picking): Map<number, boolean> {
  const startsDown = picking !== "alternate-up";
  return new Map(
    steps.map((col, i) => [col, picking === "down" ? true : picking === "up" ? false : (i % 2 === 0) === startsDown]),
  );
}
