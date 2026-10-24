import { clickAt, getTone, playAt, silence } from "./guitar";

/**
 * Programa una ronda sobre el transporte de Tone.js: cuenta de entrada de 8 clics con sonido
 * (4 para sentir el pulso + 3·2·1·Ronda N) → patrón con metrónomo. El BPM es clics por minuto y cada clic es un pulso
 * con `notesPerBeat` notas (1 = negras, 6 = sextillos); los clics alternan tick (acentuado) y tac. Todo queda en el reloj de audio; la interfaz se sincroniza con `Draw`.
 */

export type PatternNote = { string: number; fret: number };

type RoundOptions = {
  /** Toca la guitarra de guía (Práctica). En Progreso solo suena el metrónomo. */
  guide: boolean;
  /** Con cuenta de entrada (por defecto). Al escuchar el ejercicio empieza directo. */
  countIn?: boolean;
  /** Notas por clic del metrónomo (1 por defecto). */
  notesPerBeat?: number;
  /** Clics del metrónomo por pulso (1 por defecto; 2 = marca las corcheas). El primero de cada pulso va acentuado. */
  clicksPerBeat?: number;
  /** Cuenta de entrada: -1 = sentir el pulso; luego 3, 2, 1, 0 (= «Ronda N»). */
  onCount: (value: number) => void;
  /** Índice de la nota que toca en ese momento. */
  onStep: (index: number) => void;
  /** Fin del patrón. */
  onEnd: () => void;
};

const COUNT_IN = 8;
const COUNT_DOWN = 4;

export function scheduleRound(bpm: number, pattern: PatternNote[], options: RoundOptions): () => void {
  const tone = getTone();
  const transport = tone.getTransport();
  const draw = tone.getDraw();
  const click = 60 / bpm;

  transport.stop();
  transport.cancel();
  transport.position = 0;
  // Los tiempos se programan en segundos al BPM actual y Tone los guarda en ticks:
  // cambiar después el BPM del transporte (setRoundBpm) reescala la ronda en curso sin reiniciarla.
  transport.bpm.value = bpm;

  // Draw puede entregar avisos ya en cola después de cancelar la ronda; se ignoran para no «revivirla».
  let cancelled = false;
  const ui = (callback: () => void) => () => { if (!cancelled) callback(); };
  const countIn = options.countIn === false ? 0 : COUNT_IN;
  for (let i = 0; i < countIn; i++) {
    transport.schedule((time: number) => {
      clickAt(time, i % 2 === 0);
      const remaining = COUNT_IN - 1 - i;
      draw.schedule(ui(() => options.onCount(remaining < COUNT_DOWN ? remaining : -1)), time);
    }, i * click);
  }

  const start = countIn * click;
  const perBeat = options.notesPerBeat ?? 1;
  const step = click / perBeat;
  const clicksPerBeat = options.clicksPerBeat ?? 1;
  const clickEvery = perBeat / clicksPerBeat;
  pattern.forEach((note, index) => {
    transport.schedule((time: number) => {
      if (index % clickEvery === 0) clickAt(time, clicksPerBeat > 1 ? index % perBeat === 0 : (index / perBeat) % 2 === 0);
      if (options.guide) playAt(note.string, note.fret, step * 0.95, time);
      draw.schedule(ui(() => options.onStep(index)), time);
    }, start + index * step);
  });
  // El fin no va por `Draw`: Draw descarta los eventos atrasados (pestaña en segundo plano, scroll pesado)
  // y la ronda se quedaría «reproduciendo» para siempre. Un temporizador siempre llega.
  let ended: ReturnType<typeof setTimeout> | undefined;
  transport.schedule((time: number) => {
    ended = setTimeout(ui(options.onEnd), Math.max(0, (time - tone.now()) * 1000));
  }, start + pattern.length * step);

  transport.start("+0.05");
  return () => {
    cancelled = true;
    clearTimeout(ended);
    draw.cancel();
    transport.stop();
    transport.cancel();
    silence();
  };
}

/** Cambia la velocidad de la ronda en curso. */
export function setRoundBpm(bpm: number) {
  getTone().getTransport().bpm.value = bpm;
}
