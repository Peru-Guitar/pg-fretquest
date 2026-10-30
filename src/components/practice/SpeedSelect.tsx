import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { FIGURES, speedPlan, speedsOf, type Figure, type Speed } from '@/data/practiceStudies';
import { cn } from '@/lib/cn';

export type RichOption<T> = { value: T; badge: string; title: string; detail: string };

/**
 * Desplegable con título y descripción por opción (velocidad, rondas). `suggested` se marca como «Sugerida».
 * `full`: ocupa todo el ancho (en el diálogo de práctica); sin él, 16 rem en la cabecera (todo el ancho en móvil).
 * La lista va en <body> con posición fija para que no la recorte un diálogo con scroll; se abre hacia arriba si abajo no cabe.
 */
export function RichSelect<T extends number>({ label, options, value, onChange, suggested, full }: { label: string; options: RichOption<T>[]; value: T; onChange: (value: T) => void; suggested?: T; full?: boolean }) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const [place, setPlace] = useState<CSSProperties>({});
    useLayoutEffect(() => {
        if (!open) return;
        const measure = () => {
            const box = root.current!.getBoundingClientRect();
            const height = list.current?.offsetHeight ?? 0;
            const below = window.innerHeight - box.bottom - 8;
            const width = Math.max(box.width, 240);
            const left = Math.min(box.right - width, window.innerWidth - width - 8);
            setPlace(height > below && box.top > below
                ? { left, width, bottom: window.innerHeight - box.top + 8 }
                : { left, width, top: box.bottom + 8 });
        };
        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
    }, [open]);
    // Se cierra al hacer clic fuera o con Escape.
    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node) && !list.current?.contains(event.target as Node)) setOpen(false); };
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('pointerdown', onPointer); window.removeEventListener('keydown', onKey); };
    }, [open]);
    const current = options.find(option => option.value === value) ?? options[0];

    const row = (option: RichOption<T>) => <>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue/15 font-mono text-base font-black text-accent-strong">{option.badge}</span>
        <span className="min-w-0 flex-1 text-left">
            <b className="block truncate text-sm text-fg">{option.title}{option.value === suggested && <span className="ml-1.5 text-2xs font-bold text-accent">Sugerida</span>}</b>
            <span className="block truncate text-xs text-muted">{option.detail}</span>
        </span>
    </>;

    return <div ref={root} className={cn('relative', full ? 'w-full' : 'w-full sm:w-64')}>
        <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}
            className={cn('flex w-full items-center gap-3 rounded-xl border bg-field p-1.5 pr-3 transition', open ? 'border-blue' : 'border-line-strong hover:border-blue/60')}>
            {row(current)}
            <ChevronDown size={17} className={cn('shrink-0 text-muted transition', open && 'rotate-180')}/>
        </button>
        {open && createPortal(<ul ref={list} role="listbox" aria-label={label} style={place} className="fixed z-[60] overflow-hidden rounded-xl border border-line-strong bg-raised p-1.5 shadow-[0_20px_60px_#0009]">
            {options.map(option => <li key={option.value}>
                <button type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }}
                    className={cn('flex w-full items-center gap-3 rounded-lg p-1.5 pr-2.5 transition', option.value === value ? 'bg-blue/12' : 'hover:bg-white/5')}>
                    {row(option)}
                    {option.value === value && <Check size={16} className="shrink-0 text-accent"/>}
                </button>
            </li>)}
        </ul>, document.body)}
    </div>;
}

/** Velocidad: cada nivel con su nombre y, debajo, cómo suena en esta lección (figura y BPM). `figure`: la figura base. */
export function SpeedSelect({ value, onChange, figure, originalBpm, suggested, full }: { value: Speed; onChange: (speed: Speed) => void; figure: Figure; originalBpm?: number; suggested: Speed; full?: boolean }) {
    // Ordenados por notas por segundo: «Original» queda en su lugar, no siempre al final. El número es la posición.
    const options = speedsOf(originalBpm)
        .map(({ speed, name }) => ({ speed, name, plan: speedPlan(figure, speed, originalBpm) }))
        .sort((a, b) => a.plan.bpm * FIGURES[a.plan.figure].notesPerBeat - b.plan.bpm * FIGURES[b.plan.figure].notesPerBeat)
        .map(({ speed, name, plan }, index): RichOption<Speed> => ({ value: speed, badge: String(index + 1), title: name, detail: `${plan.bpm} BPM · ${plan.figure}` }));
    return <RichSelect label="Velocidad" options={options} value={value} onChange={onChange} suggested={suggested} full={full}/>;
}
