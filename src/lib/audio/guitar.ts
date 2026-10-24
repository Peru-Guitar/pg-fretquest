/**
 * Sonido de guitarra eléctrica con distorsión para las tablaturas (mismo enfoque que erpskool y chordy).
 *
 * Tone.js se importa en la primera reproducción y las muestras se descargan una sola vez
 * de la colección tonejs-instruments (guitarra eléctrica limpia). Se cargan ocho notas repartidas por el
 * registro y Tone.js afina las intermedias a partir de la muestra más cercana. La distorsión se suma con efectos.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tone = any;

const SAMPLE_BASE = "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-electric/";
// Nota → archivo (la colección escribe los sostenidos con «s»: Fs3 = F#3).
const SAMPLES = ["E2", "A2", "C3", "F#3", "C4", "F#4", "C5", "A5"];

// Afinación estándar en MIDI, de la cuerda 1 (Mi agudo) a la 6 (Mi grave)
const OPEN_STRINGS = [64, 59, 55, 50, 45, 40];

let tone: Tone = null;
let sampler: Tone = null;
let clicker: Tone = null;
/** Salida común: permite cortar todo el sonido de golpe al detener. */
let master: Tone = null;
let loading: Promise<void> | null = null;

/** Carga Tone.js y las muestras. Debe llamarse desde un clic (lo exigen los navegadores). */
export function prepare(): Promise<void> {
  if (tone && master) {
    // El navegador suspende el audio al cambiar de pestaña, bloquear el celular o cambiar de salida: se reactiva en cada clic.
    if (tone.getContext().state !== "running") void tone.start();
    // Si se acaba de detener, la salida sigue en 0 un momento (`silence`): vuelve ya para no perder las primeras notas.
    const now = tone.now();
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(1, now);
  }
  loading ??= (async () => {
    tone = await import("tone");
    await tone.start();
    master = new tone.Gain(1).toDestination();
    // Distorsión y después un filtro que recorta los agudos ásperos, como el parlante de un amplificador.
    const cabinet = new tone.Filter(3800, "lowpass").connect(master);
    const drive = new tone.Distortion({ distortion: 0.9, oversample: "4x" }).connect(cabinet);
    sampler = new tone.Sampler({
      urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
      baseUrl: SAMPLE_BASE,
      // Sin reverb y con release corto: cada nota se apaga antes de la siguiente, sin eco.
      release: 0.25,
      volume: -10,
    }).connect(drive);
    // Clic corto del metrónomo: «tick» agudo en el tiempo, «tac» más grave en el contratiempo.
    clicker = new tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.01 },
      volume: -16,
    }).connect(master);
    await tone.loaded();
  })().catch((error) => {
    loading = null; // permite reintentar
    throw error;
  });
  return loading;
}

/** Toca una nota. `string`: 1 (aguda) a 6 (grave). */
export function play(string: number, fret: number, durationSec: number): void {
  if (!sampler) return;
  const open = OPEN_STRINGS[string - 1];
  if (open === undefined) return;
  const frequency = tone.Frequency(open + fret, "midi").toFrequency();
  sampler.triggerAttackRelease(frequency, Math.max(0.15, durationSec), tone.now(), 0.85);
}

/** Toca una nota en un instante del reloj de audio (para programar con antelación). */
export function playAt(string: number, fret: number, durationSec: number, time: number): void {
  if (!sampler) return;
  const open = OPEN_STRINGS[string - 1];
  if (open === undefined) return;
  sampler.triggerAttackRelease(tone.Frequency(open + fret, "midi").toFrequency(), Math.max(0.05, durationSec), time, 0.85);
}

/** Clic del metrónomo: `accent` = tick (tiempo), si no tac (contratiempo). */
export function clickAt(time: number, accent: boolean): void {
  clicker?.triggerAttackRelease(accent ? 1800 : 1100, 0.03, time, accent ? 1 : 0.6);
}

/** Tone.js ya cargado (tras `prepare`). */
export function getTone(): Tone {
  return tone;
}

/**
 * Corta el sonido al instante (al pulsar Detener o Esc). Además de soltar las notas, baja la salida a 0:
 * Tone programa los eventos con unos milisegundos de antelación y, si no, aún sonaría un clic o una nota.
 * La salida vuelve a su nivel poco después, lista para la siguiente práctica.
 */
export function silence(): void {
  if (!tone || !master) return;
  const now = tone.now();
  sampler?.releaseAll(now);
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0, now);
  master.gain.setValueAtTime(1, now + 0.25);
}
