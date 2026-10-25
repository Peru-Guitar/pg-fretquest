import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Repeat, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { harmonic, play as playNote, prepare, silence, slide } from "@/lib/audio/guitar";
import { createLocalStore } from "@/lib/localStore";
import { parseTab, pickDirections, type Picking } from "@/lib/domain/tab";

export const MIN_BPM = 30;
export const MAX_BPM = 260;

/** Tamaño de las cifras (px), elegido por el usuario y recordado entre ejercicios. */
const SIZES = [20, 24, 28, 34];
const sizeStore = createLocalStore<number>("fretquest.tabSize", 1);

const PICKING_TEXT: Record<Picking, string> = {
  alternate: "púa alternada empezando abajo",
  "alternate-up": "púa alternada empezando arriba",
  down: "todas las púas hacia abajo",
  up: "todas las púas hacia arriba",
};

interface Props {
  tab: string;
  bpm: number;
  /** Notas por pulso: 1 = negras, 2 = corcheas, 3 = tresillos, 4 = semicorcheas. */
  notesPerBeat?: number;
  picking?: Picking;
  /**
   * Modo seguimiento: la columna que se está tocando la decide quien usa el
   * componente (una sesión) y se ocultan los controles de demostración.
   */
  cursor?: number | null;
  /** Resultado por columna ya tocada en la repetición actual: acierto o fallo. */
  marks?: ReadonlyMap<number, "hit" | "miss">;
  /** Texto de estado bajo la tablatura. */
  caption?: string;
}

/**
 * Tablatura interactiva: cuerdas, cifras y dirección de púa con una línea sobre
 * la nota activa. Fuera de una sesión ofrece «Escuchar ejemplo» con guitarra
 * sintetizada al tempo indicado (play/stop, nota anterior/siguiente, loop).
 */
export function TabPlayer({ tab, bpm, notesPerBeat = 4, picking, cursor, marks, caption }: Props) {
  const parsed = useMemo(() => parseTab(tab), [tab]);
  const picks = useMemo(() => (picking ? pickDirections(parsed.steps, picking) : null), [parsed, picking]);
  const sizeIdx = sizeStore.use();
  const fontPx = SIZES[Math.min(SIZES.length - 1, Math.max(0, sizeIdx))];
  const rowPx = Math.round(fontPx * 1.85);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loop, setLoop] = useState(true);
  const [step, setStep] = useState<number | null>(null);
  const following = cursor !== undefined;
  const activeCol = following ? cursor : step === null ? null : parsed.steps[step];

  // La reproducción lee siempre el valor más reciente sin reiniciarse.
  const bpmRef = useRef(bpm);
  const loopRef = useRef(loop);
  const timer = useRef<number | undefined>(undefined);
  const active = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    bpmRef.current = bpm;
    loopRef.current = loop;
  }, [bpm, loop]);

  const stepDuration = () => 60 / bpmRef.current / notesPerBeat;
  /** `alone`: nota suelta (siguiente/anterior), así la destino de un slide también se oye. */
  const sound = (i: number, alone = false) => {
    const col = parsed.steps[i];
    for (const row of parsed.rows)
      for (const n of row.notes) {
        if (n.col !== col) continue;
        if (n.harmonic) harmonic(n.string, n.fret, stepDuration() * 4);
        else if (n.slideTo !== undefined && !alone) {
          // La nota inicial ocupa sus pasos hasta la destino; desliza al final y la destino sigue sonando un paso.
          const steps = Math.max(1, parsed.steps.indexOf(n.slideToCol!) - i);
          slide(n.string, n.fret, n.slideTo, steps * stepDuration() * 0.6, (steps + 1) * stepDuration());
        } else if (!n.slid || alone) playNote(n.string, n.fret, stepDuration());
      }
  };

  function stop() {
    window.clearTimeout(timer.current);
    active.current = false;
    silence();
    setPlaying(false);
    setLoading(false);
  }

  function advance(i: number) {
    if (!active.current) return;
    if (i >= parsed.steps.length) {
      if (!loopRef.current) {
        stop();
        setStep(null);
        return;
      }
      i = 0;
    }
    sound(i);
    setStep(i);
    timer.current = window.setTimeout(() => advance(i + 1), stepDuration() * 1000);
  }

  async function toggle() {
    if (active.current) return stop();
    active.current = true;
    setPlaying(true);
    setLoading(true);
    // Primera vez: descarga Tone.js y las muestras. Si falla, se informa y sigue sin sonido.
    const ok = await prepare().then(
      () => true,
      () => false,
    );
    setLoading(false);
    if (!ok) setAudioError(true);
    advance(step ?? 0);
  }
  const [audioError, setAudioError] = useState(false);

  /** Avanza o retrocede una nota con la demostración detenida, para revisar a mano. */
  async function nudge(delta: number) {
    if (active.current) stop();
    const n = parsed.steps.length;
    const next = step === null ? (delta > 0 ? 0 : n - 1) : (step + delta + n) % n;
    setStep(next);
    await prepare().catch(() => {});
    sound(next, true);
  }

  // Detiene el sonido al salir de la pantalla (p. ej. al empezar una sesión).
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      active.current = false;
      silence();
    },
    [],
  );

  // Mantiene visible la nota actual con un salto instantáneo (sin animación que compita con el ritmo).
  useEffect(() => {
    if (activeCol === null || activeCol === undefined) return;
    const note = rootRef.current?.querySelector<HTMLElement>(`[data-col="${activeCol}"]`);
    const scroller = note?.closest<HTMLElement>("[data-scroll]");
    if (!note || !scroller) return;
    const left = note.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    if (left < scroller.scrollLeft + 40 || left > scroller.scrollLeft + scroller.clientWidth - 80) {
      scroller.scrollLeft = left - scroller.clientWidth / 3;
    }
  }, [activeCol]);

  const live = playing || following;
  const noteTone = (col: number) => {
    if (col === activeCol) return "bg-success/30 text-fg ring-2 ring-success";
    const mark = marks?.get(col);
    if (mark === "hit") return "bg-surface text-success underline decoration-2 underline-offset-4";
    if (mark === "miss") return "bg-[#ff4b4b]/20 text-[#ff8a8a] line-through decoration-2";
    return live ? "bg-surface text-muted" : "bg-surface text-fg";
  };

  const usedStrings = [...new Set(parsed.rows.flatMap((r) => r.notes.map((n) => r.names[n.string - 1])))];
  const summary = `Tablatura de ${parsed.steps.length} golpes en las cuerdas ${usedStrings.join(", ")}${picking ? `, ${PICKING_TEXT[picking]}` : ""}.`;

  return (
    <figure
      ref={rootRef}
      tabIndex={following ? undefined : 0}
      aria-label={summary}
      onKeyDown={(e) => {
        // Espacio: reproducir/detener el ejemplo, solo con el reproductor enfocado.
        if (!following && e.key === " " && e.target === e.currentTarget) {
          e.preventDefault();
          void toggle();
        }
      }}
      className="rounded-2xl border border-line bg-surface focus-visible:outline-2"
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 md:px-5">
        <span className="font-display text-base font-black text-fg">Tablatura</span>
        <span className="flex items-center gap-1" role="group" aria-label="Tamaño de la tablatura">
          <button type="button" onClick={() => sizeStore.set(Math.max(0, sizeIdx - 1))} disabled={sizeIdx <= 0} className="grid size-11 place-items-center rounded-lg text-fg-soft hover:bg-raised disabled:opacity-40" aria-label="Cifras más pequeñas"><Minus className="size-4" /></button>
          <span className="w-8 text-center text-sm font-bold text-muted" aria-hidden>Aa</span>
          <button type="button" onClick={() => sizeStore.set(Math.min(SIZES.length - 1, sizeIdx + 1))} disabled={sizeIdx >= SIZES.length - 1} className="grid size-11 place-items-center rounded-lg text-fg-soft hover:bg-raised disabled:opacity-40" aria-label="Cifras más grandes"><Plus className="size-4" /></button>
        </span>
      </figcaption>

      <div className="mx-2 mt-1 rounded-xl bg-canvas/70 md:mx-3">
        {parsed.rows.map((row, r) => {
          const rowPicks = picks ? [...new Set(row.notes.map((n) => n.col))].map((col) => ({ col, x: row.notes.find((n) => n.col === col)!.x, down: picks.get(col)! })) : [];
          const head = row.notes.find((n) => n.col === activeCol);
          return (
            <div key={r} data-scroll className="overflow-x-auto px-3 pt-6 pb-5 md:px-6">
              <div className="grid grid-cols-[auto_1fr] gap-x-4" style={{ minWidth: `calc(${row.cols} * ${fontPx * 0.7}px + 3rem)` }} aria-hidden>
                {rowPicks.length > 0 && (
                  <div className="relative col-start-2" style={{ height: fontPx * 1.2 }}>
                    {rowPicks.map((p) => (
                      <span key={p.col} className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${live ? (p.col === activeCol ? "text-success" : "text-subtle") : "text-muted"}`} style={{ left: `${p.x * 100}%` }}>
                        <svg viewBox="0 0 14 14" className="fill-none stroke-current" style={{ width: fontPx * 0.6, height: fontPx * 0.6 }} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d={p.down ? "M2.5 12V2.5h9V12" : "M2.5 2.5L7 12l4.5-9.5"} />
                        </svg>
                      </span>
                    ))}
                  </div>
                )}
                <div className="col-start-1 grid" style={{ gridAutoRows: rowPx }}>
                  {row.names.map((name, i) => (
                    <span key={i} className="grid place-items-center font-mono font-semibold text-muted" style={{ fontSize: fontPx * 0.62 }}>{name}</span>
                  ))}
                </div>
                <div className="relative col-start-2 grid" style={{ gridAutoRows: rowPx }}>
                  {/* Línea de reproducción sobre la nota activa */}
                  {head && (
                    <span className="pointer-events-none absolute -top-8 -bottom-3 z-10 -translate-x-1/2 border-l-2 border-dashed border-success" style={{ left: `${head.x * 100}%` }} />
                  )}
                  {row.names.map((_, i) => (
                    <div key={i} className="relative">
                      {/* La cuerda: más gruesa hacia los graves */}
                      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-line-strong" style={{ height: 1 + i * 0.4 }} />
                      {row.marks
                        .filter((m) => m.string === i + 1)
                        .map((m, k) => (
                          <span key={k} className="absolute top-0 -translate-x-1/2 font-mono font-bold text-muted italic" style={{ left: `${m.x * 100}%`, fontSize: fontPx * 0.5 }}>{m.label}</span>
                        ))}
                      {row.notes
                        .filter((n) => n.string === i + 1)
                        .map((n) => (
                          <span key={n.col} data-col={n.col} className={`absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-lg px-1.5 text-center font-mono leading-tight font-bold tabular-nums ${noteTone(n.col)}`} style={{ left: `${n.x * 100}%`, fontSize: fontPx, minWidth: fontPx * 1.3 }}>
                            {n.label}
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          {caption && <span>{caption}</span>}
          {audioError && !following && <span className="text-gold" role="status">No se pudo cargar el sonido; la tablatura sigue funcionando.</span>}
          {picking && (
            <span className="inline-flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1"><svg viewBox="0 0 14 14" className="size-3 fill-none stroke-current" strokeWidth={1.8}><path d="M2.5 12V2.5h9V12" /></svg>Abajo</span>
              <span className="inline-flex items-center gap-1"><svg viewBox="0 0 14 14" className="size-3 fill-none stroke-current" strokeWidth={1.8}><path d="M2.5 2.5L7 12l4.5-9.5" /></svg>Arriba</span>
            </span>
          )}
          {marks && marks.size > 0 && (
            <span className="inline-flex items-center gap-3 text-xs">
              <span className="text-success underline decoration-2 underline-offset-4">5</span> correcta
              <span className="text-[#ff8a8a] line-through decoration-2">5</span> fallada
            </span>
          )}
        </div>
        {!following && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => nudge(-1)} className="grid size-11 place-items-center rounded-full text-fg-soft hover:bg-raised" aria-label="Nota anterior"><SkipBack className="size-4" /></button>
            <button type="button" onClick={toggle} aria-pressed={playing} className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-bold text-fg hover:bg-raised ${loading ? "animate-pulse" : ""}`}>
              {playing ? <Square className="size-4 fill-current" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
              {loading ? "Cargando sonido…" : playing ? "Detener ejemplo" : "Escuchar ejemplo"}
            </button>
            <button type="button" onClick={() => nudge(1)} className="grid size-11 place-items-center rounded-full text-fg-soft hover:bg-raised" aria-label="Nota siguiente"><SkipForward className="size-4" /></button>
            <button type="button" onClick={() => setLoop((l) => !l)} aria-pressed={loop} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${loop ? "text-success" : "text-muted hover:text-fg"}`}>
              <Repeat className="size-4" aria-hidden />Loop
            </button>
          </div>
        )}
      </div>
      <pre className="sr-only">{tab}</pre>
    </figure>
  );
}

