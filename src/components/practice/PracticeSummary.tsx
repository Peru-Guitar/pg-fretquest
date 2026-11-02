import type { Speed } from '@/data/practiceStudies';
import { ROUTES } from '@/lib/routes';
import { useEffect, useState } from 'react';
import { useScrollLock } from '@/lib/scrollLock';
import { createPortal } from 'react-dom';
import { Clock3, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { Link } from '@/lib/router';
import { useAccount } from '@/lib/account';
import { timeLabel } from '@/lib/domain/weeklyGoal';
import { WHATSAPP_GROUP_URL } from '@/lib/links';

/** Guitarrista animado celebrando la práctica. Formato vertical, 800×1000. */
const SUMMARY_IMAGE = '/images/practice-done.webp';

/** Lo que suma la práctica a la semana (null sin sesión). */
export type SummaryProgress = { beforeSeconds: number; addedSeconds: number; goalHours: number };

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

/**
 * Resumen al terminar las rondas de una práctica, a pantalla completa con el fondo borroso:
 * rondas, velocidad y tiempo. No se guarda nada.
 */
export function PracticeSummary({ rounds, bpm, seconds, progress, onClose }: { rounds: number; speed: Speed; bpm: number; seconds: number; progress: SummaryProgress | null; onClose: () => void }) {
    const signedIn = useAccount() !== null;
    // Minutos que suma esta práctica y cómo queda la meta de la semana (solo con sesión).
    const goalSeconds = (progress?.goalHours ?? 0) * 3600;
    const added = Math.max(1, Math.round((progress?.addedSeconds ?? 0) / 60));
    const after = (progress?.beforeSeconds ?? 0) + (progress?.addedSeconds ?? 0);
    const reached = after >= goalSeconds;
    const [imageOk, setImageOk] = useState(true);
    // La velocidad va solo en BPM, con la unidad chica: el nombre del nivel no entra en la ficha.
    const stats = [['Rondas', String(rounds)], ['Velocidad', String(bpm), 'BPM'], ['Tiempo', formatTime(seconds)]];
    // Sin scroll detrás y Escape para cerrar.
    useScrollLock();
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Va en <body> porque el `transform` animado de <main> encerraría un `fixed`.
    return createPortal(<div role="dialog" aria-modal="true" aria-label="Resumen de la práctica" className="fixed inset-0 z-50 flex overflow-y-auto bg-sunken/70 p-4 backdrop-blur-md">
        <div className="m-auto relative grid w-full max-w-4xl animate-pop overflow-hidden rounded-2xl border border-line-strong bg-raised shadow-[0_30px_90px_#000b] md:grid-cols-[2fr_3fr]">
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
                    <h2 className="mt-4 text-3xl">¡Terminaste!</h2>
                    <p className="mt-1 font-serif text-lg text-fg-soft italic">Otra sesión que suma a tu técnica.</p>

                    <dl className="mt-6 grid w-full grid-cols-3 gap-2">
                        {stats.map(([label, value, unit]) => <div key={label} className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                            <dt className="text-2xs font-bold tracking-wider text-muted uppercase">{label}</dt>
                            <dd className="mt-1 font-mono text-3xl font-bold whitespace-nowrap text-fg">{value}{unit && <span className="ml-1 text-sm font-bold text-muted">{unit}</span>}</dd>
                        </div>)}
                    </dl>
                    {progress && <div className="mt-6 flex w-full items-center gap-3 rounded-full border border-line bg-card py-2 pr-4 pl-2">
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue/20 px-3 py-1 text-sm font-bold text-fg"><Clock3 size={15} className="text-accent"/>+{added} min</span>
                        <span className="block h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className={cn('block h-full rounded-full', reached ? 'bg-success' : 'bg-blue')} style={{ width: `${Math.min(100, after / goalSeconds * 100)}%` }}/></span>
                        <span className={cn('shrink-0 font-mono text-xs', reached ? 'font-bold text-success' : 'text-fg-soft')}>{reached ? '¡Meta de la semana!' : `${timeLabel(after)} / ${progress.goalHours} h esta semana`}</span>
                    </div>}

                    <p className="mt-4 text-xs text-muted">¿Te trabaste o quieres que te corrijan? <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Pide ayuda en el grupo de WhatsApp</a>.</p>

                    {!signedIn && <p className="mt-4 text-xs text-muted">Practicaste sin sesión: no se registró. <Link to={ROUTES.login} onClick={onClose} className="text-accent hover:underline">Entra</Link> para guardar tu progreso.</p>}
                    <Button onClick={onClose} className="mt-6 min-w-40">Cerrar</Button>
                </div>
            </div>
        </div>
    </div>, document.body);
}
