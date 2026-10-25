/**
 * Sonido de guitarra eléctrica con distorsión para las tablaturas (mismo enfoque que erpskool y chordy).
 *
 * Tone.js se importa en la primera reproducción y las muestras se descargan una sola vez
 * de la colección tonejs-instruments (guitarra eléctrica limpia). Se cargan ocho notas repartidas por el
 * registro y Tone.js afina las intermedias a partir de la muestra más cercana. La distorsión se suma con efectos.
 */

import { audio } from "./metronome";

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
/** Las mismas muestras como búferes sueltos: el slide las reproduce cambiando la velocidad sobre la marcha. */
let buffers: Tone = null;
/** Armónicos: la misma guitarra sin graves (suena delgada y brillante) más un poco de tono puro. */
let harmonics: Tone = null;
let bell: Tone = null;
/** Entrada de la distorsión: el slide se conecta aquí para sonar igual que el resto. */
let drive: Tone = null;
/** Slides sonando, para cortarlos al detener. */
const slides = new Set<AudioBufferSourceNode>();
/** Salida común: permite cortar todo el sonido de golpe al detener. */
let master: Tone = null;
let loading: Promise<void> | null = null;

/** Carga Tone.js y las muestras. Debe llamarse desde un clic (lo exigen los navegadores). */
export function prepare(): Promise<void> {
  unlock();
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
    // Tone usa el contexto ya desbloqueado en el clic (el import asíncrono pierde el gesto y iOS no lo dejaría sonar).
    tone.setContext(audio());
    await tone.start();
    master = new tone.Gain(1).toDestination();
    // Distorsión y después un filtro que recorta los agudos ásperos, como el parlante de un amplificador.
    const cabinet = new tone.Filter(3800, "lowpass").connect(master);
    drive = new tone.Distortion({ distortion: 0.9, oversample: "4x" }).connect(cabinet);
    sampler = new tone.Sampler({
      urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
      baseUrl: SAMPLE_BASE,
      // Sin reverb y con release corto: cada nota se apaga antes de la siguiente, sin eco.
      release: 0.25,
      volume: -10,
    }).connect(drive);
    buffers = new tone.ToneAudioBuffers({
      urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
      baseUrl: SAMPLE_BASE,
    });
    const thin = new tone.Filter(1400, "highpass").connect(drive);
    harmonics = new tone.Sampler({
      urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
      baseUrl: SAMPLE_BASE,
      release: 0.8,
      volume: -6,
    }).connect(thin);
    bell = new tone.PolySynth(tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.002, decay: 1.2, sustain: 0, release: 0.4 },
      volume: -26,
    }).connect(cabinet);
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

/**
 * Desbloquea el audio dentro del clic, antes de cualquier `await`: iOS solo activa el sonido en ese momento.
 * También pide sonar aunque el iPhone esté en modo silencio, como un reproductor de música.
 */
function unlock(): void {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
  const ac = audio();
  // Un búfer mudo termina de desbloquear el audio en Safari antiguo.
  const source = ac.createBufferSource();
  source.buffer = ac.createBuffer(1, 1, 22050);
  source.connect(ac.destination);
  source.start();
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

/** Semitonos que suena un armónico natural sobre la cuerda al aire, según el traste. */
const HARMONICS: Record<number, number> = { 3: 31, 4: 28, 5: 24, 7: 19, 9: 28, 12: 12, 16: 28, 19: 19, 24: 24 };

/** Armónico natural sobre `fret` (5, 7, 12…). Otros trastes suenan una octava arriba de la nota pisada. */
export function harmonic(string: number, fret: number, durationSec: number): void {
  if (!harmonics) return;
  const open = OPEN_STRINGS[string - 1];
  if (open === undefined) return;
  const frequency = tone.Frequency(open + (HARMONICS[fret] ?? fret + 12), "midi").toFrequency();
  const length = Math.max(0.6, durationSec);
  harmonics.triggerAttackRelease(frequency, length, tone.now(), 0.9);
  bell.triggerAttackRelease(frequency, length, tone.now(), 0.7);
}

/**
 * Slide de `fromFret` a `toFret` (sube o baja) con un solo ataque: suena la muestra más cercana y su
 * velocidad sube o baja hasta la nota destino. `holdSec` es lo que dura la nota inicial antes de deslizar
 * y `totalSec` la duración completa, incluida la nota destino.
 */
export function slide(string: number, fromFret: number, toFret: number, holdSec: number, totalSec: number): void {
  if (!buffers?.loaded || !drive) return;
  const open = OPEN_STRINGS[string - 1];
  if (open === undefined) return;
  const from = open + fromFret;
  const midis = SAMPLES.map((n) => tone.Frequency(n).toMidi() as number);
  const nearest = midis.reduce((a, b) => (Math.abs(b - from) < Math.abs(a - from) ? b : a));
  const rate = (midi: number) => Math.pow(2, (midi - nearest) / 12);

  const ac = audio();
  const src = ac.createBufferSource();
  src.buffer = buffers.get(SAMPLES[midis.indexOf(nearest)]).get();
  const gain = ac.createGain();
  src.connect(gain);
  tone.connect(gain, drive);

  const t = ac.currentTime;
  // Recorrido rápido, como un slide real: cuanto más lejos, un poco más largo.
  const glide = Math.min(0.25, 0.04 + Math.abs(toFret - fromFret) * 0.025, Math.max(0.03, totalSec - holdSec));
  const end = t + Math.max(holdSec + glide + 0.1, totalSec);
  src.playbackRate.setValueAtTime(rate(from), t);
  src.playbackRate.setValueAtTime(rate(from), t + holdSec);
  src.playbackRate.exponentialRampToValueAtTime(rate(open + toFret), t + holdSec + glide);
  // Mismo nivel que el sampler (-10 dB, fuerza 0.85) y una caída corta al final, sin clic.
  gain.gain.setValueAtTime(0.27, t);
  gain.gain.setValueAtTime(0.27, end - 0.08);
  gain.gain.linearRampToValueAtTime(0, end);
  src.start(t);
  src.stop(end);
  slides.add(src);
  src.onended = () => slides.delete(src);
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
  harmonics?.releaseAll(now);
  bell?.releaseAll(now);
  for (const src of slides) src.stop();
  slides.clear();
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0, now);
  master.gain.setValueAtTime(1, now + 0.25);
}
