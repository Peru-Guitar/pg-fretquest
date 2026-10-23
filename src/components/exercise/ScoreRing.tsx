import { PASS_SCORE } from "@/lib/domain/evaluation";

/** Puntuación 0-100 en un anillo; verde si alcanza la nota de aprobación. */
export function ScoreRing({ score, size = 160, label = "Puntuación" }: { score: number; size?: number; label?: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pass = score >= PASS_SCORE;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score} de 100`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-raised)" strokeWidth="8" />
        {/* Marca de la nota mínima */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-line-strong)" strokeWidth="8" strokeDasharray={`0.8 ${c}`} strokeDashoffset={-c * (PASS_SCORE / 100)} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={pass ? "var(--color-success)" : "var(--color-gold)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className="transition-[stroke-dashoffset] duration-500" />
      </svg>
      <div className="text-center">
        <p className="font-display font-black text-fg tabular-nums" style={{ fontSize: size * 0.3 }}>{score}</p>
        <p className="-mt-1 text-xs text-muted">de 100</p>
      </div>
    </div>
  );
}
