import { cn } from '@/lib/cn';

const BLOCKS = 10;

/** Columna por bloques, como el medidor de un amplificador. Cualquier valor mayor que 0 enciende al menos un bloque. */
export function BlockColumn({ ratio, active, off, className }: { ratio: number; active?: boolean; off?: boolean; className?: string }) {
    const lit = ratio > 0 ? Math.max(1, Math.round(ratio * BLOCKS)) : 0;
    return <span aria-hidden className={cn('flex min-h-0 w-full flex-1 flex-col-reverse gap-0.5', className)}>
        {Array.from({ length: BLOCKS }, (_, i) => <span key={i} className={cn('min-h-0 flex-1 rounded-[1px] transition-colors', i < lit ? (active ? 'bg-accent shadow-[0_0_8px_#5ab8ec80]' : 'bg-blue/55 group-hover/face:bg-blue/80') : off ? 'bg-white/3' : 'bg-white/7')}/>)}
    </span>;
}
