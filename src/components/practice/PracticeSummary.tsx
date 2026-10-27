import { speedName, type Speed } from '@/data/practiceStudies';
import { ROUTES } from '@/lib/routes';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Clock3, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { Link } from '@/lib/router';
import { useAccount } from '@/lib/account';

const RATINGS = [
    { value: 1, label: 'Me costó mucho' },
    { value: 2, label: 'Con varios errores' },
    { value: 3, label: 'Bien, con algún fallo' },
    { value: 4, label: 'Limpio y cómodo' },
    { value: 5, label: 'Impecable' },
];

/** Guitarrista animado celebrando la práctica. Formato vertical, 800×1000. */
const SUMMARY_IMAGE = '/images/practice-done.webp';

/** Lo que suma la práctica al día de hoy (null sin sesión). */
export type SummaryProgress = { beforeSeconds: number; addedSeconds: number; goalMinutes: number; completedBefore: boolean };

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

/**
 * Resumen al terminar las rondas de una práctica, a pantalla completa con el fondo borroso:
 * rondas, velocidad, tiempo y una valoración opcional. No se guarda nada.
 */
export function PracticeSummary({ rounds, speed, bpm, seconds, sessionMinutes, progress, children, onClose }: { rounds: number; speed: Speed; bpm: number; seconds: number; sessionMinutes?: number; progress: SummaryProgress | null; children?: ReactNode; onClose: () => void }) {
    const signedIn = useAccount() !== null;
    // Minutos que suma esta práctica a la de hoy (solo con sesión y si el día aún no estaba completo).
    const goal = progress?.goalMinutes ?? 0;
    const added = Math.max(1, Math.round((progress?.addedSeconds ?? 0) / 60));
    const after = Math.min(goal, Math.floor(((progress?.beforeSeconds ?? 0) + (progress?.addedSeconds ?? 0)) / 60));
    const showMinutes = progress !== null && !progress.completedBefore;
    const [rating, setRating] = useState<number | null>(null);
    const [imageOk, setImageOk] = useState(true);
    const stats = [['Rondas', String(rounds)], ['Velocidad', `${speedName(speed)} · ${bpm}`], ['Tiempo', formatTime(seconds)]];
    // Sin scroll detrás y Escape para cerrar.
    useEffect(() => {
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey); };
    }, [onClose]);

    // Va en <body> porque el `transform` animado de <main> encerraría un `fixed`.
    return createPortal(<div role="dialog" aria-modal="true" aria-label="Resumen de la práctica" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-sunken/70 p-4 backdrop-blur-md">
        <div className="relative grid w-full max-w-4xl animate-pop overflow-hidden rounded-2xl border border-line-strong bg-raised shadow-[0_30px_90px_#000b] md:grid-cols-[2fr_3fr]">
            {/* Imagen del guitarrista. Si aún no existe, queda el degradado de la marca. */}
            <div className="relative h-44 overflow-hidden bg-raised md:h-auto">
                {imageOk && <img src={SUMMARY_IMAGE} alt="" width={800} height={1000} decoding="async" onError={() => setImageOk(false)} className="absolute inset-0 size-full object-cover object-[center_25%] md:object-center"/>}
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:via-transparent md:to-raised/80"/>
            </div>

            <div className="relative flex flex-col justify-center overflow-hidden px-6 py-8 text-center md:px-9 md:py-10">
                {/* Luces de fondo: le dan vida al panel sin un color plano. */}

                <button type="button" aria-label="Cerrar resumen" onClick={onClose} className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded text-muted hover:bg-white/5 hover:text-fg"><X size={16}/></button>
                <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
                    <span className="grid size-14 place-items-center rounded-full bg-gold text-canvas"><Trophy size={26}/></span>
                    <h2 className="mt-4 text-3xl">{sessionMinutes ? '¡Sesión completada!' : '¡Terminaste!'}</h2>
                    <p className="mt-1 font-serif text-lg text-fg-soft italic">{sessionMinutes ? `${sessionMinutes} minutos de práctica: hoy cuenta para tu ritmo.` : 'Otra sesión que suma a tu técnica.'}</p>

                    <dl className="mt-6 grid w-full grid-cols-3 gap-2">
                        {stats.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                            <dt className="text-2xs font-bold tracking-wider text-muted uppercase">{label}</dt>
                            <dd className="mt-1 font-mono text-3xl font-bold text-fg">{value}</dd>
                        </div>)}
                    </dl>
                    {showMinutes && <div className="mt-6 flex w-full items-center gap-3 rounded-full border border-line bg-card py-2 pr-4 pl-2">
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue/20 px-3 py-1 text-sm font-bold text-fg"><Clock3 size={15} className="text-accent"/>+{added} min</span>
                        <span className="block h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className={cn('block h-full rounded-full', after >= goal ? 'bg-success' : 'bg-blue')} style={{ width: `${after / goal * 100}%` }}/></span>
                        <span className={cn('shrink-0 font-mono text-xs', after >= goal ? 'font-bold text-success' : 'text-fg-soft')}>{after >= goal ? '¡Hoy completo!' : `${after}/${goal} min hoy`}</span>
                    </div>}
                    {children && <div className="mt-6 w-full">{children}</div>}

                    <p className="mt-6 text-sm text-fg-soft">¿Cómo te sentiste practicando? <span className="text-muted">(opcional)</span></p>
                    <div role="radiogroup" aria-label="Valoración de la práctica" className="mt-3 grid w-full grid-cols-5 gap-1.5">
                        {RATINGS.map(option => <button key={option.value} type="button" role="radio" aria-checked={rating === option.value} title={option.label} onClick={() => setRating(option.value)} className={cn(
                            'flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 transition',
                            rating === option.value ? 'border-blue bg-blue/20 text-fg' : 'border-white/10 bg-white/3 text-fg-soft hover:border-blue/60 hover:bg-white/6 hover:text-fg',
                        )}>
                            <b className="font-mono text-lg">{option.value}</b>
                            <span className="text-3xs leading-tight">{option.label}</span>
                        </button>)}
                    </div>
                    {rating !== null && <p className="mt-3 text-sm text-success">¡Gracias! Sé honesto contigo: así sabrás cuándo subir la velocidad.</p>}

                    {!signedIn && <p className="mt-4 text-xs text-muted">Practicaste sin sesión: no se registró. <Link to={ROUTES.login} onClick={onClose} className="text-accent hover:underline">Entra</Link> para guardar tu progreso.</p>}
                    <Button onClick={onClose} className="mt-6 min-w-40">Cerrar</Button>
                </div>
            </div>
        </div>
    </div>, document.body);
}
