import { useCallback, useEffect, useRef, useState } from "react";
import { prepare } from "./guitar";
import { playPattern, type PlayOptions } from "./practiceRound";

/**
 * Estado único de la reproducción. Practicar solo avanza en este orden:
 * idle → preparing → intro → starting → countdown → playing (y en cada ronda: rest, si hay descanso → countdown → playing).
 * Reproducir va aparte: idle → demoLoading → demo.
 */
export type PlaybackStatus = "idle" | "preparing" | "intro" | "starting" | "countdown" | "playing" | "rest" | "demoLoading" | "demo";

type View = { status: PlaybackStatus; round: number; count: number; pulse: number; step: number; startedAt: number; soundError: boolean };

/** Qué suena: lo mismo para Reproducir y Practicar, cambian solo las opciones. */
export type PlayPlan = Pick<PlayOptions, "bpm" | "pattern" | "notesPerBeat" | "startAt" | "rounds" | "restSeconds" | "countIn" | "guideVelocity">;

type Options = {
  plan: (demo: boolean) => PlayPlan;
  /** Terminaron todas las rondas de la práctica. `startedAt` ya descuenta los descansos: no son tiempo de práctica. */
  onFinish: (rounds: number, startedAt: number) => void;
};

const IDLE: View = { status: "idle", round: 1, count: -1, pulse: 0, step: -1, startedAt: 0, soundError: false };
/** Pausa para que se apague lo que sonaba antes de mostrar la preparación. */
const SETTLE_MS = 150;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function usePlayback(options: Options) {
  const [view, setView] = useState(IDLE);
  const latest = useRef(options);
  useEffect(() => { latest.current = options; });
  const cancelRound = useRef<(() => void) | null>(null);
  // Sube con cada acción: lo que estaba esperando (`await`) y ya no es lo último no sigue.
  const token = useRef(0);

  const halt = useCallback(() => {
    token.current++;
    cancelRound.current?.();
    cancelRound.current = null;
  }, []);
  const stop = useCallback(() => { halt(); setView(IDLE); }, [halt]);
  useEffect(() => halt, [halt]);

  const play = (demo: boolean) => {
    let startedAt = Date.now();
    const plan = latest.current.plan(demo);
    const rest = plan.restSeconds ?? 0;
    setView({ ...IDLE, status: demo ? "demo" : "countdown", startedAt });
    cancelRound.current = playPattern({
      ...plan,
      onRoundStart: (round) => {
        // El descanso que acaba de terminar es tiempo muerto: se corre el inicio para no contarlo.
        if (round > 1) startedAt += rest * 1000;
        const since = startedAt;
        setView((current) => ({ ...current, status: demo ? "demo" : "countdown", round, count: -1, step: -1, startedAt: since }));
      },
      onCount: (count) => setView((current) => ({ ...current, count, pulse: current.pulse + 1 })),
      onStep: (step) => setView((current) => ({ ...current, status: demo ? "demo" : "playing", step })),
      onRest: (left) => setView((current) => ({ ...current, status: "rest", count: left, pulse: current.pulse + 1, step: -1 })),
      onEnd: (rounds) => {
        stop();
        if (!demo) latest.current.onFinish(rounds, startedAt);
      },
    });
  };

  /** Practicar: corta lo que suene, carga el sonido y solo entonces abre la preparación. */
  const openIntro = async () => {
    // `prepare` va primero porque debe correr dentro del clic; `halt` lo sigue y deja la salida en silencio hasta Comenzar.
    const loaded = prepare().catch(() => undefined);
    halt();
    const own = token.current;
    setView({ ...IDLE, status: "preparing" });
    await Promise.all([loaded, wait(SETTLE_MS)]);
    if (own === token.current) setView({ ...IDLE, status: "intro" });
  };

  /** Comenzar práctica: el modal sigue abierto hasta que todo está listo; luego, la cuenta de entrada. */
  const begin = async () => {
    const own = ++token.current;
    setView({ ...IDLE, status: "starting" });
    try {
      await prepare();
    } catch {
      if (own === token.current) setView({ ...IDLE, status: "intro", soundError: true });
      return;
    }
    if (own === token.current) play(false);
  };

  /** Reproducir: una pasada sin cuenta de entrada. */
  const playDemo = async () => {
    halt();
    const own = token.current;
    setView({ ...IDLE, status: "demoLoading" });
    try {
      await prepare();
    } catch {
      if (own === token.current) setView(IDLE);
      return;
    }
    if (own === token.current) play(true);
  };

  return { ...view, openIntro, begin, playDemo, stop };
}
