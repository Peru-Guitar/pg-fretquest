/**
 * Lee una tablatura ASCII (cuerda aguda arriba) y la convierte en notas
 * posicionadas para dibujarla y reproducirla.
 *
 * - Una línea en blanco empieza una nueva fila; la reproducción sigue de fila en fila.
 * - Cada grupo de dígitos es una nota. Las letras entre notas (h, p, t, /, \, ~, x)
 *   son marcas de técnica: se dibujan y, salvo las siguientes, no cambian el sonido.
 * - `5/7` y `7\5`: slide de una nota a la siguiente en la misma cuerda (sube o baja).
 * - `<12>`: armónico natural sobre ese traste.
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
  /** Slide: traste al que desliza esta nota (la nota destino no se vuelve a pulsar). */
  slideTo?: number;
  /** Columna de la nota destino del slide. */
  slideToCol?: number;
  /** Es la nota destino de un slide: suena por el deslizamiento, sin ataque propio. */
  slid?: boolean;
  /** Armónico natural (`<12>`). */
  harmonic?: boolean;
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
      const tokens = [...s.body.matchAll(/\d+|[^-\s\d]/g)];
      let prev: TabNote | null = null;
      let slide = false;
      tokens.forEach((m, t) => {
        const x = (m.index! + m[0].length / 2) / cols;
        if (/^\d+$/.test(m[0])) {
          const harmonic = tokens[t - 1]?.[0] === "<" && tokens[t + 1]?.[0] === ">";
          const note: TabNote = { string: idx + 1, fret: Number(m[0]), col: offset + m.index!, x, label: m[0], ...(harmonic && { harmonic }) };
          if (slide && prev && !prev.harmonic && !harmonic) {
            prev.slideTo = note.fret;
            prev.slideToCol = note.col;
            note.slid = true;
          }
          notes.push(note);
          prev = note;
          slide = false;
        } else {
          marks.push({ string: idx + 1, x, label: m[0] });
          // Solo cuenta un `/` o `\` pegado entre dos notas.
          slide = (m[0] === "/" || m[0] === "\\") && tokens[t - 1] !== undefined && /^\d+$/.test(tokens[t - 1][0]);
        }
      });
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
