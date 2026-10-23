import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, BookOpen, ChevronDown, Lightbulb, Lock, Minus, Pause, Play, Plus, Square, X } from "lucide-react";
import { AudioInput } from "@/components/exercise/AudioInput";
import { LiveStats } from "@/components/exercise/LiveStats";
import { SessionResult } from "@/components/exercise/SessionResult";
import { MAX_BPM, MIN_BPM, TabPlayer } from "@/components/TabPlayer";
import { Button, Meter } from "@/components/ui";
import { buttonClass } from "@/components/ui/buttonClass";
import { useAudioDevices, useMicPitch } from "@/lib/audio/mic";
import { useMetronome } from "@/lib/audio/metronome";
import { findExercise, LEVELS, type Exercise } from "@/lib/domain/catalog";
import { evaluate, simulateStep } from "@/lib/domain/evaluation";
import { exerciseAfter } from "@/lib/domain/progress";
import { exerciseHistory, xpForSession } from "@/lib/domain/report";
import { parseTab } from "@/lib/domain/tab";
import { recordPractice, usePracticeLog } from "@/lib/progress";
import { elapsedMs, newSession, retempo, setActiveSession, stepsAt, useActiveSession, type Mode, type Session } from "@/lib/session";

const DURATIONS = [5, 10, 15, 20];
const BPM_STEP = 5;

function fmt(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function ExercisePage() {
  const { exerciseId = "" } = useParams<{ exerciseId: string }>();
  // La key reinicia el estado al cambiar de ejercicio.
  return <ExerciseView key={exerciseId} exerciseId={exerciseId} />;
}

function ExerciseView({ exerciseId }: { exerciseId: string }) {
  const navigate = useNavigate();
  const ref = findExercise(exerciseId);
  const history = exerciseHistory(usePracticeLog(), exerciseId);
  const steps = useMemo(() => (ref ? parseTab(ref.exercise.tab).steps : []), [ref]);
  const notesPerBeat = ref?.exercise.notesPerBeat ?? 4;
  const bpmTarget = ref?.exercise.bpmTarget ?? 120;

  // Preparación (un único tempo compartido por el ejemplo y la sesión)
  const [mode, setMode] = useState<Mode>("practice");
  const [bpm, setBpm] = useState(() => history.bestBpm ?? ref?.exercise.bpmStart ?? 60);
  const [minutes, setMinutes] = useState(5);
  const [metronome, setMetronome] = useState(true);
  const [practiceEnded, setPracticeEnded] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");

  const active = useActiveSession();
  const session = active?.exerciseId === exerciseId ? active : null;
  const otherSession = active && !session ? active : null;

  const [now, setNow] = useState(() => Date.now());
  const running = session !== null && session.pausedAt === null;
  useEffect(() => {
    if (!running) return;
    // Tic fino: el cursor de la tablatura avanza nota a nota.
    const id = setInterval(() => setNow(Date.now()), 40);
    return () => clearInterval(id);
  }, [running]);

  const update = useCallback((s: Session | null) => {
    setActiveSession(s);
    setNow(Date.now());
  }, []);

  const elapsed = session ? elapsedMs(session, now) : 0;
  const capped = session?.durationMs != null ? Math.min(elapsed, session.durationMs) : elapsed;
  const finished = session?.mode === "progress" && session.durationMs !== null && elapsed >= session.durationMs;
  useMetronome(session?.bpm ?? bpm, running && metronome && !finished);

  // Detección simulada: cada nota se evalúa de forma determinista por sesión.
  const seed = session ? session.startedAt % 2 ** 31 : 0;
  const stepsPlayed = session ? stepsAt(session, capped, notesPerBeat) : 0;
  const sessionBpm = session?.bpm ?? bpm;
  const ev = evaluate(seed, stepsPlayed, Math.max(1, steps.length), sessionBpm, bpmTarget);
  const repStart = steps.length ? stepsPlayed - (stepsPlayed % steps.length) : 0;
  const cursor = session && !finished && steps.length ? steps[stepsPlayed % steps.length] : null;
  const marks = new Map<number, "hit" | "miss">();
  for (let i = repStart; i < stepsPlayed; i++) marks.set(steps[i - repStart], simulateStep(seed, i, sessionBpm, bpmTarget).hit ? "hit" : "miss");

  const sessionMinutes = session?.durationMs ? Math.round(session.durationMs / 60_000) : 0;
  const sessionXp = finished && session ? Math.round(xpForSession(sessionMinutes, session.bpm) * (ev.score / 100)) : 0;

  // Completar una sesión de progreso la registra (una sola vez por sesión).
  const done = finished ? session : null;
  useEffect(() => {
    if (!done || done.durationMs === null) return;
    recordPractice({
      id: `${done.exerciseId}@${done.startedAt}`,
      exerciseId: done.exerciseId,
      minutes: sessionMinutes,
      bpm: done.bpm,
      xp: sessionXp,
      score: ev.score,
      approved: ev.approved,
      notesPct: ev.notesPct,
      rhythmPct: ev.rhythmPct,
      validReps: ev.validReps,
      invalidReps: ev.invalidReps,
      at: done.startedAt + done.durationMs + done.pausedMs,
    });
  }, [done, sessionMinutes, sessionXp, ev]);

  const start = (m: Mode) => {
    setPracticeEnded(null);
    update(newSession(exerciseId, m, bpm, minutes));
    setAnnounce(m === "progress" ? "Sesión de progreso iniciada" : "Práctica libre iniciada");
  };
  const pause = () => {
    if (!session || session.pausedAt) return;
    update({ ...session, pausedAt: Date.now() });
    setAnnounce("En pausa");
  };
  const resume = () => {
    if (!session?.pausedAt) return;
    update({ ...session, pausedMs: session.pausedMs + (Date.now() - session.pausedAt), pausedAt: null });
    setAnnounce("Reanudado");
  };
  const endPractice = () => {
    setPracticeEnded(elapsed);
    setBpm(session?.bpm ?? bpm);
    update(null);
    setAnnounce("Práctica terminada. No se guardó en el historial.");
  };
  const abandon = () => {
    if (!confirm("¿Finalizar ahora? Al terminar antes de tiempo la sesión no se registra ni suma XP.")) return;
    update(null);
    setAnnounce("Sesión finalizada sin registrar");
  };
  const changeSessionBpm = (b: number) => session && update(retempo(session, b, Date.now(), notesPerBeat));

  // Espacio pausa/reanuda durante la sesión, salvo en controles que ya lo usan.
  const pauseRef = useRef({ pause, resume, session });
  useEffect(() => {
    pauseRef.current = { pause, resume, session };
  });
  const sessionActive = session !== null && !finished;
  useEffect(() => {
    if (!sessionActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " || (e.target as HTMLElement).closest("input, textarea, select, button, a, [role=switch], [role=radio]")) return;
      e.preventDefault();
      const { session: s, pause: p, resume: r } = pauseRef.current;
      if (s?.pausedAt) r();
      else p();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sessionActive]);

  if (!ref) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-muted">Este ejercicio no existe.</p>
        <Link to="/" className="mt-4 inline-block font-bold text-success">Volver a la ruta</Link>
      </div>
    );
  }
  const { lesson, exercise } = ref;
  const exerciseNumber = lesson.exercises.indexOf(exercise) + 1;
  const liveRegion = <p className="sr-only" role="status" aria-live="polite">{announce}</p>;

  // Resultado de una sesión de progreso
  if (session && finished) {
    const nextEx = exerciseAfter(LEVELS, exerciseId);
    return (
      <div className="flex flex-col gap-6">
        {liveRegion}
        <SessionHeader lessonId={lesson.id} lessonTitle={lesson.title} title={`${lesson.title} · ${exercise.title}`} />
        <SessionResult
          ev={ev}
          bpm={session.bpm}
          minutes={sessionMinutes}
          xp={sessionXp}
          previous={history.entries.filter((e) => e.id !== `${session.exerciseId}@${session.startedAt}`)}
          onRepeat={() => update(newSession(exerciseId, "progress", session.bpm, sessionMinutes))}
          onNext={nextEx ? () => { update(null); navigate(`/practice/${nextEx.id}`); } : null}
          onBack={() => { update(null); navigate(`/lessons/${lesson.id}`); }}
        />
      </div>
    );
  }

  // Sesión activa: la tablatura manda; el resto es secundario.
  if (session) {
    const isProgress = session.mode === "progress";
    return (
      <div className="flex flex-col gap-4 pb-24 md:pb-0">
        {liveRegion}
        <SessionHeader
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          title={`${lesson.title} · ${exercise.title}`}
          badge={isProgress ? "Sesión de progreso" : "Práctica libre"}
          instructions={<InstructionsButton exercise={exercise} onOpen={pause} />}
        />

        <TabPlayer tab={exercise.tab} bpm={session.bpm} notesPerBeat={notesPerBeat} picking={exercise.picking} cursor={cursor} marks={marks} caption="Audio simulado: los aciertos y fallos son de demostración." />

        {/* Transporte: fijo abajo en móvil, en línea en escritorio */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:rounded-2xl md:border md:bg-surface md:p-4">
          {isProgress && (
            <div className="mb-3">
              <Meter value={(capped / session.durationMs!) * 100} size="sm" label="Tiempo de la sesión" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {session.pausedAt ? (
              <Button size="lg" onClick={resume}><Play className="size-5 fill-current" aria-hidden />Reanudar</Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={pause}><Pause className="size-5" aria-hidden />Pausar</Button>
            )}
            <p className="font-mono text-2xl font-bold text-fg tabular-nums" role="timer" aria-live="off">
              {fmt(isProgress ? session.durationMs! - capped : elapsed)}
              <span className="ml-2 font-sans text-sm font-medium text-muted">{isProgress ? `restantes de ${sessionMinutes} min` : "tocados"}{session.pausedAt ? " · en pausa" : ""}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3 md:ml-auto">
              {isProgress ? (
                <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-raised px-3 text-sm font-bold text-fg tabular-nums"><Lock className="size-4 text-muted" aria-hidden />{session.bpm} BPM fijo</span>
              ) : (
                <BpmStepper bpm={session.bpm} onChange={changeSessionBpm} />
              )}
              <MetronomeToggle on={metronome} onChange={setMetronome} />
              {isProgress ? (
                <Button variant="danger" onClick={abandon}><X className="size-4" aria-hidden />Finalizar</Button>
              ) : (
                <Button variant="secondary" onClick={endPractice}><Square className="size-4" aria-hidden />Terminar</Button>
              )}
            </div>
          </div>
        </div>

        <LiveStats ev={ev} />
        <p className="text-xs text-subtle">Espacio: pausar o reanudar.</p>
      </div>
    );
  }

  // Preparación
  return (
    <div className="@container">
      {liveRegion}
      <header>
        <Link to={`/lessons/${lesson.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />{lesson.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl font-black text-fg md:text-4xl">{lesson.title}</h1>
          <span className="text-muted">Ejercicio {exerciseNumber} de {lesson.exercises.length}</span>
        </div>
        <p className="mt-2 max-w-[65ch] text-lg text-fg-soft">{exercise.objective}</p>
        <p className="mt-2 text-sm text-muted">{exercise.technique} · {exercise.bpmStart} → {exercise.bpmTarget} BPM{history.bestBpm !== null && ` · tu récord ${history.bestBpm} BPM`} · <span className="text-gold">contenido provisional</span></p>
      </header>

      {practiceEnded !== null && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-blue/40 bg-surface px-5 py-4" role="status">
          <p className="flex-1 text-fg-soft"><span className="font-bold text-fg">Práctica terminada</span> · {fmt(practiceEnded)} tocados · no se guardó en el historial.</p>
          <Button onClick={() => start("practice")}>Volver a practicar</Button>
          <Button variant="secondary" onClick={() => { setPracticeEnded(null); setMode("progress"); document.getElementById("preparar")?.focus(); }}>Preparar sesión de progreso</Button>
        </div>
      )}

      {/* Una columna: tablatura → preparación → ayuda. Desde 880 px: preparación a la derecha. */}
      <div className="mt-6 grid gap-6 @min-[880px]:grid-cols-[minmax(0,1fr)_300px] @min-[880px]:gap-x-8">
        <div className="min-w-0">
          <TabPlayer tab={exercise.tab} bpm={bpm} notesPerBeat={notesPerBeat} picking={exercise.picking} />
        </div>

        <aside aria-labelledby="preparar" className="flex flex-col gap-5 self-start rounded-2xl border border-line bg-surface p-5 @min-[880px]:sticky @min-[880px]:top-24 @min-[880px]:row-span-2">
          <h2 id="preparar" tabIndex={-1} className="font-display text-xl font-black text-fg">Preparar práctica</h2>

          <ModeSelector mode={mode} onChange={setMode} />
          <p className="-mt-2 text-sm text-muted">
            {mode === "practice" ? "Tempo ajustable mientras tocas. No se guarda en tu historial." : "Duración y tempo fijos. Se registra al completar el tiempo y suma XP."}
          </p>

          <Field label="Tempo">
            <BpmStepper bpm={bpm} onChange={setBpm} />
            <p className="mt-1.5 text-xs text-subtle">Objetivo {exercise.bpmTarget} BPM: es una referencia, empieza cómodo.</p>
          </Field>
          <Field label="Metrónomo">
            <MetronomeToggle on={metronome} onChange={setMetronome} />
          </Field>
          {mode === "progress" && (
            <Field label="Duración">
              <DurationSelector minutes={minutes} onChange={setMinutes} />
            </Field>
          )}

          {otherSession ? (
            <OtherSessionNotice session={otherSession} onDiscard={() => update(null)} />
          ) : (
            <Button size="lg" onClick={() => start(mode)} className="w-full">
              <Play className="size-5 fill-current" aria-hidden />{mode === "practice" ? "Empezar práctica" : "Iniciar sesión de progreso"}
            </Button>
          )}

          <AudioStatus />
        </aside>

        <div className="min-w-0">
          <HowTo exercise={exercise} />
        </div>
      </div>
    </div>
  );
}

function SessionHeader({ lessonId, lessonTitle, title, badge, instructions }: { lessonId: string; lessonTitle: string; title: string; badge?: string; instructions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Link to={`/lessons/${lessonId}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-fg" aria-label={`Volver a la lección ${lessonTitle}`}>
        <ArrowLeft className="size-4" aria-hidden />Volver a la lección
      </Link>
      <h1 className="min-w-0 flex-1 truncate font-display text-xl font-black text-fg md:text-2xl">{title}</h1>
      {badge && <span className="rounded-lg bg-raised px-3 py-1.5 text-sm font-bold text-fg-soft">{badge}</span>}
      <span className="rounded-lg bg-gold/10 px-3 py-1.5 text-sm text-gold">Audio simulado</span>
      {instructions}
    </header>
  );
}

function HowTo({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = exercise.steps;
  return (
    <section aria-labelledby="como-titulo" className="max-w-[75ch]">
      <h2 id="como-titulo" className="font-display text-xl font-black text-fg">Cómo tocarlo</h2>
      <p className="mt-2 text-fg-soft">{first}</p>
      {open && (
        <ol id="como-pasos" start={2} className="mt-3 flex list-decimal flex-col gap-2 pl-6 text-fg-soft marker:text-muted">
          {rest.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      )}
      {rest.length > 0 && (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="como-pasos" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-success hover:text-success">
          <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />{open ? "Ocultar pasos" : `Ver los ${rest.length + 1} pasos`}
        </button>
      )}
      <Disclosure id="recomendaciones" title="Recomendaciones" icon={<Lightbulb className="size-4 text-gold" aria-hidden />} items={exercise.tips} />
      <Disclosure id="errores" title="Errores comunes" icon={<AlertTriangle className="size-4 text-warn" aria-hidden />} items={exercise.mistakes} />
    </section>
  );
}

function Disclosure({ id, title, icon, items }: { id: string; title: string; icon: React.ReactNode; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="flex min-h-12 w-full items-center gap-2 text-left font-bold text-fg">
        {icon}<span className="flex-1">{title}</span><ChevronDown className={`size-4 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul id={id} className="mb-3 flex flex-col gap-2 pl-6 text-fg-soft">
          {items.map((t, i) => <li key={i} className="list-disc marker:text-line-strong">{t}</li>)}
        </ul>
      )}
    </div>
  );
}

/** Ayuda durante la sesión: pausa al abrir y devuelve el foco al cerrar. */
function InstructionsButton({ exercise, onOpen }: { exercise: Exercise; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button ref={trigger} type="button" onClick={() => { onOpen(); setOpen(true); }} className={buttonClass("ghost")}>
        <BookOpen className="size-4" aria-hidden />Ver instrucciones
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal aria-labelledby="ayuda-titulo" onClick={close}>
          <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h2 id="ayuda-titulo" className="font-display text-xl font-black text-fg">Cómo tocarlo</h2>
              <button type="button" onClick={close} autoFocus className="grid size-11 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg" aria-label="Cerrar"><X className="size-5" /></button>
            </div>
            <p className="mt-1 text-sm text-muted">La sesión está en pausa.</p>
            <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6 text-fg-soft marker:text-muted">
              {exercise.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <h3 className="mt-5 font-bold text-fg">Recomendaciones</h3>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-6 text-fg-soft">{exercise.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            <h3 className="mt-5 font-bold text-fg">Errores comunes</h3>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-6 text-fg-soft">{exercise.mistakes.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      )}
    </>
  );
}

function OtherSessionNotice({ session, onDiscard }: { session: Session; onDiscard: () => void }) {
  const other = findExercise(session.exerciseId);
  return (
    <div className="rounded-xl border border-blue/40 p-4" role="status">
      <p className="text-sm text-fg-soft">Tienes {session.mode === "progress" ? "una sesión de progreso" : "una práctica libre"} sin terminar en <span className="font-bold text-fg">{other ? `${other.lesson.title} · ${other.exercise.title}` : "otro ejercicio"}</span>. Reanúdala o descártala antes de empezar otra.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/practice/${session.exerciseId}`} className={buttonClass("primary")}>Reanudar</Link>
        <button type="button" onClick={() => confirm("¿Descartar la sesión sin terminar? No se registrará.") && onDiscard()} className={buttonClass("ghost")}>Descartar</button>
      </div>
    </div>
  );
}

function AudioStatus() {
  const [open, setOpen] = useState(false);
  const audio = useAudioDevices();
  const mic = useMicPitch(audio.deviceId, audio.refresh);
  const listening = mic.status === "on";
  return (
    <div className="border-t border-line pt-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="entrada-audio" className="flex min-h-11 w-full items-center gap-2 text-left text-sm">
        <span className={`size-2 rounded-full ${listening ? "bg-success" : "bg-gold"}`} aria-hidden />
        <span className="min-w-0 flex-1"><span className="font-bold text-fg-soft">Entrada de audio: {listening ? "activa" : "inactiva"}</span><span className="block truncate text-muted">{audio.label}</span></span>
        <ChevronDown className={`size-4 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div id="entrada-audio" className="mt-3">
          <AudioInput audio={audio} mic={mic} />
          <p className="mt-2 text-xs text-subtle">El nivel y el afinador usan tu entrada real. La evaluación de la ejecución todavía es de demostración.</p>
        </div>
      )}
    </div>
  );
}

/** Libre / Progreso como grupo de radio: flechas para cambiar, como manda el patrón. */
function ModeSelector({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const options: { value: Mode; label: string }[] = [
    { value: "practice", label: "Libre" },
    { value: "progress", label: "Progreso" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de sesión"
      className="grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1"
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        const next = mode === "practice" ? "progress" : "practice";
        onChange(next);
        (e.currentTarget.querySelector(`[data-value="${next}"]`) as HTMLElement | null)?.focus();
      }}
    >
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" data-value={o.value} aria-checked={mode === o.value} tabIndex={mode === o.value ? 0 : -1} onClick={() => onChange(o.value)} className={`min-h-11 rounded-lg text-sm font-bold transition ${mode === o.value ? "bg-raised text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DurationSelector({ minutes, onChange }: { minutes: number; onChange: (m: number) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Duración"
      className="grid grid-cols-4 gap-1 rounded-xl bg-canvas p-1"
      onKeyDown={(e) => {
        const i = DURATIONS.indexOf(minutes);
        const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = DURATIONS[(i + d + DURATIONS.length) % DURATIONS.length];
        onChange(next);
        (e.currentTarget.querySelector(`[data-value="${next}"]`) as HTMLElement | null)?.focus();
      }}
    >
      {DURATIONS.map((d) => (
        <button key={d} type="button" role="radio" data-value={d} aria-checked={minutes === d} tabIndex={minutes === d ? 0 : -1} onClick={() => onChange(d)} className={`min-h-11 rounded-lg text-sm font-bold tabular-nums transition ${minutes === d ? "bg-raised text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"}`}>
          {d} min
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-fg-soft">{label}</p>
      {children}
    </div>
  );
}

function BpmStepper({ bpm, onChange }: { bpm: number; onChange: (bpm: number) => void }) {
  const change = (d: number) => onChange(Math.min(MAX_BPM, Math.max(MIN_BPM, bpm + d)));
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-canvas p-1" role="group" aria-label="Tempo">
      <button type="button" onClick={() => change(-BPM_STEP)} disabled={bpm <= MIN_BPM} className="grid size-11 place-items-center rounded-lg text-fg-soft hover:bg-raised disabled:opacity-40" aria-label="Bajar 5 BPM"><Minus className="size-4" /></button>
      <span className="min-w-24 text-center font-bold text-fg tabular-nums" aria-live="polite">{bpm} BPM</span>
      <button type="button" onClick={() => change(BPM_STEP)} disabled={bpm >= MAX_BPM} className="grid size-11 place-items-center rounded-lg text-fg-soft hover:bg-raised disabled:opacity-40" aria-label="Subir 5 BPM"><Plus className="size-4" /></button>
    </div>
  );
}

function MetronomeToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="inline-flex min-h-11 items-center gap-3 text-sm font-bold text-fg-soft">
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-violet" : "bg-line"}`}>
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} />
      </span>
      Metrónomo {on ? "activado" : "desactivado"}
    </button>
  );
}
