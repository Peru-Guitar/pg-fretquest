import { Link, useHydrated } from '@/lib/router';
import { ROUTES } from '@/lib/routes';
import { useAccount } from '@/lib/account';
import { DEFAULT_WEEKLY_HOURS, timeLabel } from '@/lib/domain/weeklyGoal';
import { weekSecondsOf, useProgress } from '@/lib/progressDb';
import { cn } from '@/lib/cn';

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
            <span className="text-fg-soft">Tu semana</span>
            <span className="flex items-center gap-3"><span className="block h-2 w-16 overflow-hidden rounded-full bg-white/20"><span className={cn('block h-full rounded-full', reached ? 'bg-success' : 'bg-blue')} style={{ width: `${Math.min(100, seconds / (goal * 36))}%` }}/></span>
            <b className={cn('font-mono', reached ? 'text-success' : 'text-fg')}>{timeLabel(seconds)} / {goal} h</b></span>
        </Link>
        <Link to={ROUTES.training} className="shrink-0 whitespace-nowrap px-3 text-xs text-accent hover:underline">Cambiar meta</Link>
    </div>;
}
