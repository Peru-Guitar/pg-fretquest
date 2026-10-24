import type { Difficulty } from '@/data/questMock';
import { DIFFICULTY } from '@/lib/points';
import { cn } from '@/lib/cn';

const BARS: Record<Difficulty, number> = { base: 1, intermedio: 2, avanzado: 3, experto: 4 };

/** Dificultad como barras de señal (1–4), siempre en celeste: más barras llenas, más difícil; el nombre sale en un tooltip al pasar el cursor, alineado a la derecha para no desbordar en móvil (y para lectores de pantalla). */
export function DifficultySignal({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
    const label = DIFFICULTY[difficulty].label;
    return <span role="img" aria-label={`Dificultad: ${label}`} className={cn('group/difficulty relative inline-flex h-3.5 shrink-0 items-end gap-0.5 text-accent', className)}>
        {[1, 2, 3, 4].map(bar => <span key={bar} className={cn('w-1 rounded-sm', bar <= BARS[difficulty] ? 'bg-current' : 'bg-line-strong')} style={{ height: `${bar * 25}%` }}/>)}
        <span aria-hidden="true" className="pointer-events-none absolute right-0 bottom-full z-50 mb-2.5 translate-y-1 whitespace-nowrap rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-[0_10px_30px_#0008] transition duration-150 group-hover/difficulty:translate-y-0 group-hover/difficulty:opacity-100">
            <span className="text-muted">Dificultad · </span><span className="text-accent">{label}</span>
            <span className="absolute top-full right-0.5 -mt-1 size-2 rotate-45 border-r border-b border-line bg-raised"/>
        </span>
    </span>;
}
