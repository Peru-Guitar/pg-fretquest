import type { Difficulty } from '@/data/questMock';
import { DIFFICULTY } from '@/lib/points';
import { cn } from '@/lib/cn';

const BARS: Record<Difficulty, number> = { base: 1, intermedio: 2, avanzado: 3, experto: 4 };

const TONE: Record<Difficulty, string> = {
    base: 'text-success',
    intermedio: 'text-gold',
    avanzado: 'text-orange-400',
    experto: 'text-red-400',
};

/** Dificultad como barras de señal (1–4); el nombre sale en un tooltip al pasar el cursor (y para lectores de pantalla). */
export function DifficultySignal({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
    const label = DIFFICULTY[difficulty].label;
    return <span role="img" aria-label={`Dificultad: ${label}`} className={cn('group/difficulty relative inline-flex h-3.5 shrink-0 items-end gap-0.5', TONE[difficulty], className)}>
        {[1, 2, 3, 4].map(bar => <span key={bar} className={cn('w-1 rounded-sm', bar <= BARS[difficulty] ? 'bg-current' : 'bg-line-strong')} style={{ height: `${bar * 25}%` }}/>)}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-[0_10px_30px_#0008] transition duration-150 group-hover/difficulty:translate-y-0 group-hover/difficulty:opacity-100">
            <span className="text-muted">Dificultad · </span><span className={TONE[difficulty]}>{label}</span>
            <span className="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 border-r border-b border-line bg-raised"/>
        </span>
    </span>;
}
