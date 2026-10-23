import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, RotateCcw, XCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/buttonClass";
import { PASS_SCORE, REQUIRED_STREAK, type Evaluation } from "@/lib/domain/evaluation";
import type { PracticeEntry } from "@/lib/domain/report";
import { ScoreRing } from "./ScoreRing";

interface Props {
  ev: Evaluation;
  bpm: number;
  minutes: number;
  xp: number;
  /** Sesiones anteriores de este ejercicio (sin la actual), de la más antigua a la más reciente. */
  previous: PracticeEntry[];
  onRepeat: () => void;
  onNext: (() => void) | null;
  onBack: () => void;
}

/** Resumen breve de una sesión de progreso, con los detalles a demanda. */
export function SessionResult({ ev, bpm, minutes, xp, previous, onRepeat, onNext, onBack }: Props) {
  const [details, setDetails] = useState(false);
  const prevBestScore = previous.reduce((m, e) => Math.max(m, e.score ?? 0), 0);
  const last = previous.slice(-6);
  const lastScore = last.at(-1)?.score;
  const primaryIsNext = ev.approved && onNext;

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 md:p-8" aria-labelledby="resultado-titulo">
      <p className="text-sm text-gold">Resultado de demostración · detección de notas simulada</p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={ev.score} size={128} label="Puntuación técnica" />
        <div className="min-w-0">
          <p className={`inline-flex items-center gap-1.5 text-sm font-bold ${ev.approved ? "text-success" : "text-gold"}`}>
            {ev.approved ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
            {ev.approved ? "Aprobada" : "Aún no aprobada"}
          </p>
          <h2 id="resultado-titulo" className="mt-1 font-display text-2xl font-black text-fg md:text-3xl">{ev.approved ? "Sesión superada" : "Casi: repite para aprobar"}</h2>
          <p className="mt-2 max-w-[60ch] text-fg-soft">
            {minutes} min a {bpm} BPM · +{xp} XP
            {lastScore !== undefined && ` · ${ev.score >= lastScore ? "+" : ""}${ev.score - lastScore} respecto a la sesión anterior`}
          </p>
          {!ev.approved && <p className="mt-1 max-w-[60ch] text-sm text-muted">Para aprobar: {PASS_SCORE} puntos y {REQUIRED_STREAK} repeticiones válidas seguidas. Bajar 5 BPM suele ayudar.</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {primaryIsNext ? (
          <>
            <button type="button" onClick={onNext!} className={buttonClass("primary", "lg")}>Siguiente ejercicio<ArrowRight className="size-5" aria-hidden /></button>
            <button type="button" onClick={onRepeat} className={buttonClass("secondary", "lg")}><RotateCcw className="size-5" aria-hidden />Repetir</button>
          </>
        ) : (
          <button type="button" onClick={onRepeat} className={buttonClass("primary", "lg")}><RotateCcw className="size-5" aria-hidden />Repetir</button>
        )}
        <button type="button" onClick={onBack} className={buttonClass("ghost", "lg")}>Volver a la lección</button>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <button type="button" onClick={() => setDetails((d) => !d)} aria-expanded={details} aria-controls="resultado-detalles" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-fg-soft hover:text-fg">
          <ChevronDown className={`size-4 transition ${details ? "rotate-180" : ""}`} aria-hidden />Ver detalles
        </button>
        {details && (
          <div id="resultado-detalles" className="mt-4 flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Tile label="Notas correctas" value={`${ev.notesPct}%`} hint={`orden ${ev.orderPct}%`} />
              <Tile label="Precisión rítmica" value={`${ev.rhythmPct}%`} hint={`desfase medio ${ev.meanOffsetMs} ms`} />
              <Tile label="Repeticiones válidas" value={`${ev.validReps} / ${ev.validReps + ev.invalidReps}`} hint={`mejor racha ${ev.bestStreak}`} />
              <Tile label="Récord de puntuación" value={Math.max(ev.score, prevBestScore)} hint={ev.score > prevBestScore ? "nuevo récord" : `anterior ${prevBestScore}`} />
            </dl>
            {last.length > 0 && (
              <div>
                <h3 className="font-bold text-fg">Evolución de la puntuación</h3>
                <ol className="mt-3 flex flex-col gap-1.5">
                  {[...last.map((e) => ({ id: e.id, score: e.score ?? 0, bpm: e.bpm, label: new Date(e.at).toLocaleDateString("es", { day: "numeric", month: "short" }) })), { id: "now", score: ev.score, bpm, label: "Ahora" }].map((s) => (
                    <li key={s.id} className="flex items-center gap-3 text-sm">
                      <span className={`w-16 shrink-0 tabular-nums ${s.id === "now" ? "font-bold text-fg" : "text-muted"}`}>{s.label}</span>
                      <span className="h-2 flex-1 rounded-full bg-raised">
                        <span className={`block h-full rounded-full ${s.id === "now" ? "bg-success" : "bg-line-strong"}`} style={{ width: `${s.score}%` }} />
                      </span>
                      <span className="w-28 shrink-0 text-right text-muted tabular-nums">{s.score} · {s.bpm} BPM</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-black text-fg tabular-nums">{value}</dd>
      {hint && <dd className="text-sm text-muted">{hint}</dd>}
    </div>
  );
}
