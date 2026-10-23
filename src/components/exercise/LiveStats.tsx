import { PASS_SCORE, REQUIRED_STREAK, type Evaluation } from "@/lib/domain/evaluation";

/** Franja secundaria con la evaluación en curso (detección simulada por ahora). */
export function LiveStats({ ev }: { ev: Evaluation }) {
  const started = ev.stepsPlayed > 0;
  const dash = (v: string) => (started ? v : "—");
  const offset = ev.meanOffsetMs;
  return (
    <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-line px-5 py-3 text-sm">
      <Item label="Puntuación" value={dash(String(ev.score))} tone={started ? (ev.score >= PASS_SCORE ? "text-success" : "text-gold") : undefined} hint={`mín. ${PASS_SCORE}`} />
      <Item label="Notas" value={dash(`${ev.notesPct}%`)} />
      <Item label="Ritmo" value={dash(`${ev.rhythmPct}%`)} hint={started && offset !== 0 ? `${offset > 0 ? "atrasado" : "adelantado"} ${Math.abs(offset)} ms` : undefined} />
      <div className="flex items-center gap-2">
        <dt className="text-muted">Repeticiones</dt>
        <dd className="flex items-center gap-1" aria-label={`${Math.min(ev.currentStreak, REQUIRED_STREAK)} de ${REQUIRED_STREAK} válidas seguidas; ${ev.validReps} válidas y ${ev.invalidReps} fallidas en total`}>
          {Array.from({ length: REQUIRED_STREAK }, (_, i) => (
            <span key={i} className={`size-3 rounded-full ${i < ev.currentStreak ? "bg-success" : "border border-line-strong"}`} />
          ))}
          <span className="ml-1 text-muted tabular-nums">{ev.validReps}/{ev.validReps + ev.invalidReps}</span>
        </dd>
      </div>
    </dl>
  );
}

function Item({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-bold tabular-nums ${tone ?? "text-fg"}`}>
        {value}
        {hint && <span className="ml-1.5 text-xs font-medium text-muted">{hint}</span>}
      </dd>
    </div>
  );
}
