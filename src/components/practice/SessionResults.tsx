import { useState } from 'react';
import { Check, RotateCcw, Sparkles, TrendingUp } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { saveSession } from '@/lib/practiceTime';

const RATINGS = [
    { value: 1, label: 'Me costó mucho' },
    { value: 2, label: 'Con varios errores' },
    { value: 3, label: 'Bien, con algún fallo' },
    { value: 4, label: 'Limpio y cómodo' },
    { value: 5, label: 'Impecable' },
];

/** Fin de una sesión de Progreso: tiempo sumado al plan y valoración honesta de la sesión. */
export function SessionResults({ rounds, tempoName, bpm, seconds, points, backTo, onRepeat, onRate }: {
    rounds: number; tempoName: string; bpm: number; seconds: number; points: number; backTo: string; onRepeat: () => void; onRate: (rating: number) => ReturnType<typeof saveSession>;
}) {
    const [rating, setRating] = useState<number | null>(null);
    const [saved, setSaved] = useState<ReturnType<typeof saveSession> | null>(null);
    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    const choose = (value: number) => { if (rating !== null) return; setRating(value); setSaved(onRate(value)); };
    const levelUp = saved && saved.to.level > saved.from.level;

    return <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success"><Check size={28}/></span>
        <h2 className="text-2xl">¡Sesión completada!</h2>
        <p className="text-sm text-muted">{rounds} {rounds === 1 ? 'ronda' : 'rondas'} a {tempoName} · {bpm} BPM</p>
        <p className="flex flex-wrap justify-center gap-x-6 text-sm text-muted"><span>Tiempo de la sesión <b className="font-mono text-lg text-fg">{minutes}:{String(rest).padStart(2, '0')}</b></span><span>Puntos <b className="font-mono text-lg text-accent-strong">+{points}</b></span></p>

        <div className="mt-6 w-full max-w-3xl rounded-xl border border-line bg-card p-5 md:p-6">
            <h3 className="text-lg">¿Cómo te salió esta sesión?</h3>
            <p className="mt-1 text-xs text-muted">Valórala para registrarla: su tiempo y sus puntos se suman a tu plan de hoy.</p>
            <p className="mt-1 text-sm text-muted">Sé honesto: si te das más nota de la que fue, el único que pierde eres tú.</p>
            <div role="radiogroup" aria-label="Valoración de la sesión" className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-5">
                {RATINGS.map(option => <button key={option.value} type="button" role="radio" aria-checked={rating === option.value} onClick={() => choose(option.value)} disabled={rating !== null} className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-sm transition disabled:cursor-default',
                    rating === option.value ? 'border-violet bg-violet/15 text-fg' : rating !== null ? 'border-line text-subtle opacity-40' : 'border-line text-fg-soft hover:border-line-strong',
                )}>
                    <b className="font-mono text-xl">{option.value}</b>
                    <span className="text-xs leading-tight">{option.label}</span>
                </button>)}
            </div>
            {saved && <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                <p className="font-mono text-success">✓ Registrada · +{saved.points} pts · +{minutes ? `${minutes} min ` : ''}{rest} s a tu plan de hoy</p>
                {saved.bonus > 0 && <p className="flex items-center gap-1.5 font-bold text-gold"><Sparkles size={15}/>¡Plan de hoy cumplido! +{saved.bonus} pts de bono</p>}
                {levelUp && <p className="flex items-center gap-1.5 rounded-full bg-violet/15 px-4 py-1.5 font-bold text-accent-strong"><TrendingUp size={15}/>¡Subiste a nivel {saved.to.level}{saved.to.rank !== saved.from.rank ? ` · ahora eres ${saved.to.rank}` : ''}!</p>}
            </div>}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button onClick={onRepeat}><RotateCcw size={16}/>Repetir sesión</Button>
            <LinkButton to={backTo} variant="secondary">Volver al módulo</LinkButton>
        </div>
    </div>;
}
