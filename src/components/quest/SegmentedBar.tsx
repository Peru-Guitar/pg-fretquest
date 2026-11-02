import { cn } from '@/lib/cn';

const SEGMENTS = 10;

/** Barra de progreso por bloques, estilo XP. El bloque en curso parpadea; al completarse (`progress` 1) están todos llenos y ninguno parpadea. */
export function SegmentedBar({ progress, color, height = 'h-1.5', className }: { progress: number; color: string; height?: string; className?: string }) {
    const current = Math.floor(progress * SEGMENTS);
    return <span className={cn('flex gap-0.5', className)}>
        {Array.from({ length: SEGMENTS }, (_, i) => <span key={i} className={cn(height, 'flex-1 -skew-x-12', i <= current ? color : 'bg-white/15', i === current && 'animate-pulse')}/>)}
    </span>;
}
