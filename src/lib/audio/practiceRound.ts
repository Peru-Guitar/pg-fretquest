import { clickAt, expressiveAt, getTone, playAt, silence } from "./guitar";

/**
 * `slide`: se llega deslizando el dedo desde la nota anterior en la misma cuerda, sin púa.
 * `beats`: duración en pulsos cuando no es la figura del estudio (p. ej. 1 = negra para la nota final).
 */
export type PatternNote = {
  string: number; fret: number; slide?: boolean; /** Nota con tapping (mano derecha). */ tap?: boolean; beats?: number;
  /** Se liga desde la nota anterior en la misma cuerda: hammer-on si sube, pull-off si baja (sin púa). */
  legato?: boolean;
  /** Bend: semitonos que sube la nota (1 = ½ tono, 2 = 1 tono). `release`: vuelve a la nota pisada antes de terminar. */
  bend?: number; release?: boolean;
  /** Pre-bend: la cuerda ya está estirada al atacar (suena `bend` semitonos arriba); con `release` baja a la nota pisada. */
  prebend?: boolean;
  vibrato?: boolean;
  /** Silencio de `beats` pulsos (cuerda y traste 0). */
  rest?: boolean;
};

export type PlayOptions = {
  bpm: number;
  pattern: PatternNote[];
  /** Notas por clic del metrónomo (1 por defecto). */
  notesPerBeat?: number;
  /** Índice de la nota por la que empieza (0 por defecto). */
  startAt?: number;
  /** Rondas que toca (1 por defecto). */
  rounds?: number;
  /** En vez de `rounds`: repite hasta esta hora (ms); se consulta al final de cada ronda, que siempre termina. */
  until?: () => number;
  /** Descanso en silencio entre rondas, en segundos (0 por defecto). */
  restSeconds?: number;
  /** Cuenta de entrada antes de cada ronda. */
  countIn?: boolean;
  /** Fuerza de la guitarra (0 = solo metrónomo). */
  guideVelocity?: number;
  /** Empieza una ronda (con su cuenta de entrada, si tiene). */
  onRoundStart?: (round: number) => void;
  /** Cuenta de entrada: -1 = sentir el pulso; luego 3, 2, 1, 0 (= «Ronda N»). */
  onCount?: (value: number) => void;
  /** Índice en `pattern` de la nota que toca en ese momento. */
  onStep?: (index: number) => void;
  /** Descanso: segundos que faltan, una vez por segundo. */
  onRest?: (secondsLeft: number) => void;
  /** Terminó una ronda. */
  onRoundEnd?: (round: number) => void;
  /** Terminó todo, tras `rounds` rondas. */
  onEnd?: (rounds: number) => void;
};

const COUNT_IN = 8;
const COUNT_DOWN = 4;

/**
 * Único punto de entrada para hacer sonar una tablatura. Calcula la hora de cada clic y cada nota en el reloj de audio
 * y los dispara con un poco de antelación. No usa el Transport de Tone (global, conserva su estado entre reproducciones):
 * todo lo de esta reproducción vive aquí y se desecha al terminar. Devuelve la función que la detiene.
 * Requiere `prepare`.
 */
export function playPattern({ bpm, pattern, notesPerBeat = 1, startAt = 0, rounds = 1, until, restSeconds = 0, countIn = false, guideVelocity = 0.85, onRoundStart, onCount, onStep, onRest, onRoundEnd, onEnd }: PlayOptions): () => void {
  const tone = getTone();
  const context = tone.getContext();
  const click = 60 / bpm;
  const step = click / notesPerBeat;
  const notes = pattern.slice(startAt);
  // Cada nota dura un paso de la figura, salvo las que llevan `beats`.
  const lengths = notes.map((note) => (note.beats ? note.beats * notesPerBeat : 1));
  const totalSteps = lengths.reduce((sum, length) => sum + length, 0);

  let queue: { time: number; run: (time: number) => void }[] = [];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const pending = new Map<number, (() => void)[]>();
  /** Avisa a la interfaz cuando el sonido llega a `time`. Los avisos del mismo instante salen juntos y en orden (inicio de ronda antes que su primera nota). */
  const notify = (time: number, callback: () => void) => {
    const waiting = pending.get(time);
    if (waiting) { waiting.push(callback); return; }
    const callbacks = [callback];
    pending.set(time, callbacks);
    const id = setTimeout(() => {
      timers.delete(id);
      pending.delete(time);
      callbacks.forEach((run) => run());
    }, Math.max(0, (time - context.currentTime) * 1000));
    timers.add(id);
  };

  const addRound = (round: number, begin: number) => {
    const events: typeof queue = [];
    notify(begin, () => onRoundStart?.(round));
    const countClicks = countIn ? COUNT_IN : 0;
    for (let i = 0; i < countClicks; i++) {
      events.push({ time: begin + i * click, run: (time) => {
        clickAt(time, i % 2 === 0);
        const remaining = COUNT_IN - 1 - i;
        notify(time, () => onCount?.(remaining < COUNT_DOWN ? remaining : -1));
      } });
    }
    const start = begin + countClicks * click;
    // El metrónomo va en su propia rejilla: sigue sonando mientras se sostiene una nota larga.
    for (let at = 0; at < totalSteps; at += notesPerBeat) {
      events.push({ time: start + at * step, run: (time) => clickAt(time, (at / notesPerBeat) % 2 === 0) });
    }
    let position = 0;
    notes.forEach((note, index) => {
      const length = lengths[index];
      events.push({ time: start + position * step, run: (time) => {
        if (guideVelocity > 0 && !note.rest) {
          if (note.bend || note.vibrato) expressiveAt(note.string, note.fret, length * step * 0.95, time, note, guideVelocity);
          else playAt(note.string, note.fret, length * step * 0.95, time, guideVelocity);
        }
        notify(time, () => onStep?.(index + startAt));
      } });
      position += length;
    });
    events.push({ time: start + totalSteps * step, run: (time) => {
      notify(time, () => onRoundEnd?.(round));
      if (until ? Date.now() < until() : round < rounds) {
        for (let i = 0; i < restSeconds; i++) notify(time + i, () => onRest?.(restSeconds - i));
        addRound(round + 1, time + restSeconds);
      } else { context.off("tick", tick); notify(time, () => onEnd?.(round));
      }
    } });
    queue = [...queue, ...events].sort((a, b) => a.time - b.time);
  };

  // `tone.now()` ya trae la antelación del contexto; este aviso sigue llegando con la pestaña en segundo plano.
  const tick = () => {
    while (queue.length && queue[0].time < tone.now()) {
      const event = queue.shift()!;
      event.run(event.time);
    }
  };

  addRound(1, tone.now() + 0.05);
  context.on("tick", tick);
  return () => {
    context.off("tick", tick);
    queue = [];
    timers.forEach(clearTimeout);
    timers.clear();
    silence();
  };
}
