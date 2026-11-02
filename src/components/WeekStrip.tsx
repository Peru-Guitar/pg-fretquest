import { Link, useHydrated } from '@/lib/router';
import { ROUTES } from '@/lib/routes';
import { useAccount } from '@/lib/account';
import { DEFAULT_WEEKLY_HOURS, timeLabel } from '@/lib/domain/weeklyGoal';
import { weekSecondsOf, useProgress } from '@/lib/progressDb';
import { SegmentedBar } from '@/components/quest/SegmentedBar';
import { cn } from '@/lib/cn';

/** Recorta el texto a su altura real para que las dos fuentes y la barra queden centradas a la misma altura. */
const trimmed = '[text-box:trim-both_cap_alphabetic]';

/**
 * «Tu semana» en una píldora: horas practicadas frente a la meta semanal. Lleva a Mi plan, y al lado se cambia la meta.
 */
export function WeekStrip({ className }: { className?: string }) {
    const account = useAccount();
    const hydrated = useHydrated();
    const progress = useProgress();
    if (!hydrated || !account) return null;

    const goal = account.weeklyHours ?? DEFAULT_WEEKLY_HOURS;
    const seconds = weekSecondsOf(progress);
    const reached = seconds >= goal * 3600;

    // Dos enlaces hermanos: un enlace no puede ir dentro de otro.
    return <div className={cn('items-center gap-1', className)}>
        <Link to={ROUTES.plan} title="Horas practicadas esta semana frente a tu meta" className="flex h-10 grow items-center justify-between gap-3 rounded-full px-3 text-sm transition hover:bg-white/5">
            <span className={cn(trimmed, 'text-fg-soft')}>Tu semana</span>
            <span className="flex items-center gap-3"><SegmentedBar progress={reached ? 1 : seconds / (goal * 3600)} color={reached ? 'bg-success' : 'bg-blue'} height="h-2.5" className="w-32"/>
            <b className={cn(trimmed, 'font-mono', reached ? 'text-success' : 'text-fg')}>{timeLabel(seconds)} / {goal} h</b></span>
        </Link>
        <Link to={ROUTES.training} className={cn(trimmed, 'shrink-0 whitespace-nowrap px-3 text-xs text-accent hover:underline')}>Cambiar meta</Link>
    </div>;
}
