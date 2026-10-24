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

/** Dificultad como barras de señal (1–4); el nombre queda en el tooltip y para lectores de pantalla. */
export function DifficultySignal({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
    const label = DIFFICULTY[difficulty].label;
    return <span role="img" aria-label={`Dificultad: ${label}`} title={label} className={cn('inline-flex h-3.5 shrink-0 items-end gap-0.5', TONE[difficulty], className)}>
        {[1, 2, 3, 4].map(bar => <span key={bar} className={cn('w-1 rounded-sm', bar <= BARS[difficulty] ? 'bg-current' : 'bg-line-strong')} style={{ height: `${bar * 25}%` }}/>)}
    </span>;
}
