/**
 * Sonido de guitarra acústica para las tablaturas (mismo enfoque que erpskool y chordy).
 *
 * Tone.js se importa en la primera reproducción y las muestras se descargan una sola vez
 * de la colección tonejs-instruments. Solo se cargan las cuerdas al aire y dos notas agudas;
 * Tone.js afina las notas intermedias a partir de la muestra más cercana.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tone = any;

const SAMPLE_BASE = "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/";
const SAMPLES = ["E2", "A2", "D3", "G3", "B3", "E4", "A4", "D5"];

// Afinación estándar en MIDI, de la cuerda 1 (Mi agudo) a la 6 (Mi grave)
const OPEN_STRINGS = [64, 59, 55, 50, 45, 40];

let tone: Tone = null;
let sampler: Tone = null;
let clicker: Tone = null;
let loading: Promise<void> | null = null;

/** Carga Tone.js y las muestras. Debe llamarse desde un clic (lo exigen los navegadores). */
export function prepare(): Promise<void> {
  loading ??= (async () => {
    tone = await import("tone");
    await tone.start();
    const reverb = new tone.Reverb({ decay: 1.4, wet: 0.15 }).toDestination();
    sampler = new tone.Sampler({
      urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n}.mp3`])),
      baseUrl: SAMPLE_BASE,
      release: 1,
      volume: -4,
    }).connect(reverb);
    // Clic corto del metrónomo: «tick» agudo en el tiempo, «tac» más grave en el contratiempo.
    clicker = new tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.01 },
      volume: -16,
    }).toDestination();
    await Promise.all([reverb.ready, tone.loaded()]);
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
  sampler.triggerAttackRelease(tone.Frequency(open + fret, "midi").toFrequency(), Math.max(0.15, durationSec), time, 0.85);
}

/** Clic del metrónomo: `accent` = tick (tiempo), si no tac (contratiempo). */
export function clickAt(time: number, accent: boolean): void {
  clicker?.triggerAttackRelease(accent ? 1800 : 1100, 0.03, time, accent ? 1 : 0.6);
}

/** Tone.js ya cargado (tras `prepare`). */
export function getTone(): Tone {
  return tone;
}

/** Corta el sonido de inmediato (al pulsar detener). */
export function silence(): void {
  sampler?.releaseAll();
}
