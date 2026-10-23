import { useEffect, useRef } from "react";

/**
 * Metrónomo con Web Audio. Los clics se programan con un poco de antelación sobre
 * el reloj de audio (no con setTimeout), así el pulso no se desfasa aunque la
 * pestaña esté ocupada. El primer tiempo de cada compás suena acentuado.
 */
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
/** Contexto compartido; los clics pasan por `clickBus` para poder grabarlos. */
export function audio(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
export function clickBus(): GainNode {
  if (!bus) {
    bus = audio().createGain();
    bus.connect(audio().destination);
  }
  return bus;
}

function click(at: number, accent: boolean) {
  const ac = audio();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  osc.connect(gain).connect(clickBus());
  osc.start(at);
  osc.stop(at + 0.06);
}

/**
 * Hace sonar el metrónomo mientras `on` es true. El tempo puede cambiar sin cortarlo.
 * `onBeat` recibe el tiempo (0-based) y el instante en que se oirá, en reloj `performance.now()`.
 */
export function useMetronome(bpm: number, on: boolean, { beats = 4, onBeat }: { beats?: number; onBeat?: (beat: number, at: number) => void } = {}) {
  const bpmRef = useRef(bpm);
  const onBeatRef = useRef(onBeat);
  useEffect(() => {
    bpmRef.current = bpm;
    onBeatRef.current = onBeat;
  });

  useEffect(() => {
    if (!on) return;
    const ac = audio();
    let next = ac.currentTime + 0.05;
    let beat = 0;
    const id = window.setInterval(() => {
      while (next < ac.currentTime + SCHEDULE_AHEAD_S) {
        click(next, beat % beats === 0);
        // Se oye tras la latencia de salida del sistema.
        const heard = performance.now() + (next - ac.currentTime + (ac.outputLatency || ac.baseLatency || 0)) * 1000;
        onBeatRef.current?.(beat % beats, heard);
        next += 60 / bpmRef.current;
        beat++;
      }
    }, LOOKAHEAD_MS);
    return () => window.clearInterval(id);
  }, [on, beats]);
}
