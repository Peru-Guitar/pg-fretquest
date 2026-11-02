import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';
import { cn } from '@/lib/cn';

const minutesLabel = (ms: number) => {
    const minutes = Math.ceil(ms / 60000);
    return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;
};

/** Aviso de que los datos no son en vivo: cuándo se tomaron y cuándo se pueden renovar. Se actualiza solo cada 30 s. */
export function DataFreshness({ updatedAt, nextAt, nextPrefix, dueText, className }: { updatedAt: number; nextAt: number; nextPrefix: string; dueText: string; className?: string }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);
    const left = nextAt - now;
    return <p className={cn('flex items-start gap-1.5 text-2xs text-subtle', className)}>
        <Clock3 size={13} className="mt-0.5 shrink-0"/>
        <span>No es en vivo · actualizado {timeAgo(updatedAt, now)} · {left > 0 ? `${nextPrefix} ${minutesLabel(left)}` : dueText}</span>
    </p>;
}

/** Cuenta atrás en vivo hasta la próxima actualización posible, para el lado derecho del título. Al llegar a cero, los datos se están actualizando. */
export function RefreshCountdown({ nextAt }: { nextAt: number }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    const left = Math.max(0, Math.ceil((nextAt - now) / 1000));
    const clock = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    return <p className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap text-muted md:self-end" role={left ? 'timer' : undefined}>
        <Clock3 size={15} className="text-accent"/>
        {left ? <>Actualizando en <b className="font-mono font-bold text-fg tabular-nums">{clock}</b></> : 'Actualizando…'}
    </p>;
}
