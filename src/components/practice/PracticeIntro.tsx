import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Clock3, Music2, Play, Target, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

/** Profesor con la guitarra explicando el modo práctica. Formato vertical, 800×1000. */
const INTRO_IMAGE = '/images/practice-intro.webp';

const POINTS = [
    { icon: Music2, text: 'Toca las notas según lo que ves en la tablatura.' },
    { icon: Clock3, text: 'Tu tiempo de práctica se registrará en minutos.' },
    { icon: Target, text: 'Recuerda cumplir los objetivos que te propusiste.' },
];

/**
 * Preparación de la práctica: qué va a pasar al empezar y la configuración (`children`: velocidad, rondas, guía).
 * Sale siempre antes de practicar; cancelar no inicia nada.
 */
export function PracticeIntro({ children, onStart, onCancel }: { children: ReactNode; onStart: () => void; onCancel: () => void }) {
    const [imageOk, setImageOk] = useState(true);
    // Sin scroll detrás y Escape para cancelar.
    useEffect(() => {
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey); };
    }, [onCancel]);

    // Va en <body> porque el `transform` animado de <main> encerraría un `fixed`.
    return createPortal(<div role="dialog" aria-modal="true" aria-labelledby="practice-intro-title" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-sunken/70 p-4 backdrop-blur-md">
        <div className="relative grid w-full max-w-4xl animate-pop overflow-hidden rounded-2xl border border-line-strong bg-raised shadow-[0_30px_90px_#000b] md:grid-cols-[2fr_3fr]">
            {/* Imagen del profesor. Si aún no existe, queda el degradado de la marca. */}
            <div className="relative h-44 overflow-hidden bg-raised md:h-auto">
                {imageOk && <img src={INTRO_IMAGE} alt="" width={800} height={1000} decoding="async" onError={() => setImageOk(false)} className="absolute inset-0 size-full object-cover object-[center_25%] md:object-center"/>}
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:via-transparent md:to-raised/80"/>
            </div>

            <div className="relative flex flex-col justify-center px-6 py-8 md:px-9 md:py-10">
                <button type="button" onClick={onCancel} aria-label="Cerrar" className="absolute top-3 right-3 grid size-9 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg"><X size={18}/></button>
                <h2 id="practice-intro-title" className="text-2xl md:text-3xl">Estás a punto de comenzar el modo práctica</h2>
                <ul className="mt-6 space-y-4">
                    {POINTS.map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-fg-soft">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue/15 text-accent-strong"><Icon size={16}/></span>
                        <span className="pt-1.5">{text}</span>
                    </li>)}
                </ul>
                <p className="mt-6 text-xs text-muted">Antes de sonar hay una cuenta de entrada. Pulsa <kbd className="rounded border border-line-strong px-1.5 font-mono">Esc</kbd> para cancelar en cualquier momento.</p>
                <div className="mt-6 flex flex-col gap-3">{children}</div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={onStart}><Play size={16} fill="currentColor"/>Comenzar práctica</Button>
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                </div>
            </div>
        </div>
    </div>, document.body);
}

/** Campo de la preparación con su etiqueta encima (velocidad, rondas). */
export function PracticeField({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: ReactNode }) {
    return <label className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-2xs font-bold tracking-wider text-muted uppercase"><Icon size={13}/>{label}</span>
        {children}
    </label>;
}

/** Opción que se activa con un interruptor; `note` aparece debajo (en rojo si es `warning`). */
export function PracticeOption({ icon: Icon, title, note, warning, checked, onChange }: { icon: LucideIcon; title: string; note?: ReactNode; warning?: boolean; checked: boolean; onChange: (checked: boolean) => void }) {
    return <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition', checked ? 'border-accent/40 bg-accent/5' : 'border-line bg-sunken/50 hover:border-line-strong')}>
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', checked ? 'bg-accent/15 text-accent' : 'bg-white/5 text-muted')}><Icon size={16}/></span>
        <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-fg">{title}</span>
            {note && <span className={cn('mt-0.5 block text-xs leading-relaxed', warning ? 'text-danger' : 'text-muted')}>{note}</span>}
        </span>
        <input type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} className="peer sr-only"/>
        <span aria-hidden className="relative mt-1 h-5 w-9 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4"/>
    </label>;
}
