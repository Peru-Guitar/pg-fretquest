import { clickAt, getTone, playAt, silence } from "./guitar";

/**
 * Programa una ronda sobre el transporte de Tone.js: cuenta de entrada de 8 clics con sonido
 * (4 para sentir el pulso + 3·2·1·¡Vamos!) → patrón con metrónomo. El BPM es clics por minuto: cada clic es una nota, alternando
 * tick (acentuado) y tac. Todo queda en el reloj de audio; la interfaz se sincroniza con `Draw`.
 */

export type PatternNote = { string: number; fret: number };

type RoundOptions = {
  /** Toca la guitarra de guía (Práctica). En Progreso solo suena el metrónomo. */
  guide: boolean;
  /** Con cuenta de entrada (por defecto). Al escuchar el ejercicio empieza directo. */
  countIn?: boolean;
  /** Cuenta de entrada: -1 = sentir el pulso; luego 3, 2, 1, 0 (= ¡Vamos!). */
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

  const countIn = options.countIn === false ? 0 : COUNT_IN;
  for (let i = 0; i < countIn; i++) {
    transport.schedule((time: number) => {
      clickAt(time, i % 2 === 0);
      const remaining = COUNT_IN - 1 - i;
      draw.schedule(() => options.onCount(remaining < COUNT_DOWN ? remaining : -1), time);
    }, i * click);
  }

  const start = countIn * click;
  pattern.forEach((note, index) => {
    transport.schedule((time: number) => {
      clickAt(time, index % 2 === 0);
      if (options.guide) playAt(note.string, note.fret, click * 1.6, time);
      draw.schedule(() => options.onStep(index), time);
    }, start + index * click);
  });
  transport.schedule((time: number) => draw.schedule(options.onEnd, time), start + pattern.length * click);

  transport.start("+0.05");
  return () => {
    transport.stop();
    transport.cancel();
    silence();
  };
}
