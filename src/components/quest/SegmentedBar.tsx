import { cn } from '@/lib/cn';

/**
 * Barra por bloques, estilo XP. Con `meter` compara cantidades: solo llena bloques, sin parpadeo.
 * Si no, muestra un avance: el bloque en curso parpadea; en 0 o al completarse (`progress` 1) ninguno parpadea.
 */
export function SegmentedBar({ progress, color, height = 'h-1.5', segments = 10, meter, className }: { progress: number; color: string; height?: string; segments?: number; meter?: boolean; className?: string }) {
    const value = Math.min(1, Math.max(0, progress || 0));
    const filled = meter ? Math.ceil(value * segments) : Math.floor(value * segments);
    const pulsing = !meter && value > 0 && filled < segments;
    return <span className={cn('flex gap-0.5', className)}>
        {Array.from({ length: segments }, (_, i) => <span key={i} style={{ transitionDelay: `${i * 60}ms` }} className={cn(height, 'flex-1 -skew-x-12 transition-colors duration-200', i < filled || (pulsing && i === filled) ? color : 'bg-white/15', pulsing && i === filled && 'animate-pulse')}/>)}
    </span>;
}
