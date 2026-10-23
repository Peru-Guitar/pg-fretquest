import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { tempoName } from '@/data/questMock';

/** Casilla de lectura: la persona marca la lección como leída. */
export function ReadToggle({ done, onToggle, size = 'sm' }: { done: boolean; onToggle: () => void; size?: 'sm' | 'lg' }) {
    return <button type="button" role="checkbox" aria-checked={done} onClick={onToggle} className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-md border font-bold transition',
        size === 'sm' ? 'min-h-9 px-2.5 text-2xs' : 'min-h-11 px-4 text-sm',
        done ? 'border-success/40 bg-success/10 text-success' : 'border-line-strong text-muted hover:border-accent/60 hover:text-fg',
    )}>
        <span className={cn('grid size-4 place-items-center rounded border', done ? 'border-success bg-success text-canvas' : 'border-current')}>{done && <Check size={12} strokeWidth={3}/>}</span>
        <span className={cn(size === 'sm' && 'sr-only md:not-sr-only')}>{done ? 'Leída' : 'Marcar como leída'}</span>
    </button>;
}

/** Récord de una lección de práctica: la velocidad más alta completada en modo Progreso. */
export function TempoRecord({ record }: { record?: number }) {
    if (!record) return <span className="shrink-0 text-2xs text-subtle">Sin registrar</span>;
    return <span className="flex shrink-0 flex-col items-end text-2xs">
        <span className="text-subtle">Récord</span>
        <b className="text-sm text-success">{tempoName(record)} · {record}</b>
    </span>;
}

/** Estado de una lectura en listas (solo indicador; se marca dentro de la lectura). */
export function ReadStatus({ done }: { done: boolean }) {
    return <span className={cn('flex shrink-0 items-center gap-1 text-2xs', done ? 'text-success' : 'text-subtle')}>{done ? <><Check size={13}/>Leída</> : 'Sin leer'}</span>;
}
