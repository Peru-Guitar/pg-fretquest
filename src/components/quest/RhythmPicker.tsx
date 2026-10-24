import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clock3 } from 'lucide-react';
import { RHYTHMS, SESSION_MINUTES } from '@/lib/account';
import { cn } from '@/lib/cn';

/** Elección del ritmo semanal: días por semana que quieres practicar (5 tarjetas en fila). */
export function RhythmPicker({ value, onChange }: { value: number | undefined; onChange: (days: number) => void }) {
    return <>
        <div role="radiogroup" aria-label="Días por semana" className="grid gap-2 sm:grid-cols-5">
            {RHYTHMS.map(rhythm => {
                const selected = value === rhythm.days;
                const tone = selected ? 'border-blue bg-blue/15 text-fg' : 'border-line text-fg-soft hover:border-line-strong';
                return <button key={rhythm.days} type="button" role="radio" aria-checked={selected} onClick={() => onChange(rhythm.days)} className={cn('flex flex-col items-center gap-1 rounded-xl border px-2 py-4 text-center transition', tone)}>
                        <b className="font-mono text-3xl">{rhythm.days}</b>
                        <span className="text-2xs text-muted">días / semana</span>
                        <span className="mt-1 text-sm font-bold">{rhythm.label}</span>
                        <span className="text-3xs leading-snug text-muted">{rhythm.text}</span>
                    </button>;
            })}
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-fg-soft">
            <Clock3 size={16} className="mt-0.5 shrink-0 text-accent"/>
            <span>Recomendado: dedica <b className="text-fg">al menos media hora</b> a tu plan cada día que practiques.</span>
        </p>
    </>;
}

/** Desplegable del ritmo con la descripción de cada opción (para columnas estrechas, como Mi cuenta). */
export function RhythmSelect({ value, onChange }: { value: number; onChange: (days: number) => void }) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const current = RHYTHMS.find(rhythm => rhythm.days === value) ?? RHYTHMS[0];
    // Se cierra al hacer clic fuera o con Escape.
    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('pointerdown', onPointer); window.removeEventListener('keydown', onKey); };
    }, [open]);

    const row = (rhythm: typeof current) => <>
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue/15 font-mono text-xl font-black text-accent-strong">{rhythm.days}</span>
        <span className="min-w-0 flex-1 text-left">
            <b className="block text-sm text-fg">{rhythm.label} <span className="font-normal text-muted">· {rhythm.days} días por semana</span></b>
            <span className="block text-xs text-muted">{rhythm.text}</span>
        </span>
    </>;

    return <div ref={root} className="relative">
        <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
            className={cn('flex w-full items-center gap-3.5 rounded-xl border bg-field p-2.5 pr-4 transition', open ? 'border-blue' : 'border-line-strong hover:border-blue/60')}>
            {row(current)}
            <ChevronDown size={18} className={cn('shrink-0 text-muted transition', open && 'rotate-180')}/>
        </button>
        {open && <ul role="listbox" aria-label="Días por semana" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line-strong bg-raised p-1.5 shadow-[0_20px_60px_#0009]">
            {RHYTHMS.map(rhythm => <li key={rhythm.days}>
                <button type="button" role="option" aria-selected={rhythm.days === value} onClick={() => { onChange(rhythm.days); setOpen(false); }}
                    className={cn('flex w-full items-center gap-3.5 rounded-lg p-2.5 pr-3 transition', rhythm.days === value ? 'bg-blue/12' : 'hover:bg-white/5')}>
                    {row(rhythm)}
                    {rhythm.days === value && <Check size={17} className="shrink-0 text-accent"/>}
                </button>
            </li>)}
        </ul>}
    </div>;
}

const SESSION_TEXT: Record<number, string> = { 15: 'Lo justo para mantener la mano.', 30: 'Recomendado: el equilibrio.', 45: 'Sesión completa, sin llegar a la fatiga.' };

/** Duración de la sesión: 15, 30 o 45 min. */
export function SessionPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
    return <div role="radiogroup" aria-label="Duración de la sesión" className="grid grid-cols-3 gap-2">
        {SESSION_MINUTES.map(minutes => <button key={minutes} type="button" role="radio" aria-checked={value === minutes} onClick={() => onChange(minutes)}
            className={cn('flex flex-col items-center gap-1 rounded-xl border px-2 py-3.5 text-center transition', value === minutes ? 'border-blue bg-blue/15 text-fg' : 'border-line text-fg-soft hover:border-line-strong')}>
            <b className="font-mono text-2xl">{minutes}<span className="text-sm font-bold text-muted"> min</span></b>
            <span className="text-3xs leading-snug text-muted">{SESSION_TEXT[minutes]}</span>
        </button>)}
    </div>;
}
