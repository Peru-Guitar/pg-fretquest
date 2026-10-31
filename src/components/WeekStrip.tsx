import { Link, useHydrated } from '@/lib/router';
import { ROUTES } from '@/lib/routes';
import { DEFAULT_RHYTHM, useAccount } from '@/lib/account';
import { completedDaysThisWeek, useProgress } from '@/lib/progressDb';
import { cn } from '@/lib/cn';

/**
 * «Tu semana» en una píldora: un punto por cada día de la meta semanal, que se llena al cumplir un día
 * (no importa cuál: la meta es cuántos días, no qué días). Lleva a Mi plan.
 */
export function WeekStrip({ className }: { className?: string }) {
    const account = useAccount();
    const hydrated = useHydrated();
    const progress = useProgress();
    if (!hydrated || !account) return null;

    const goal = account.weeklyGoal ?? DEFAULT_RHYTHM;
    const done = completedDaysThisWeek(progress);
    const reached = done >= goal;

    return <Link to={ROUTES.plan} title="Días cumplidos esta semana frente a tu meta" className={cn('h-10 items-center gap-3 -ml-3 rounded-full px-3 text-sm transition hover:bg-white/5', className)}>
        <span className="text-fg-soft">Tu semana</span>
        <span className="flex gap-1.5">{Array.from({ length: goal }, (_, i) => <span key={i} className={cn(
            'size-2.5 rounded-full',
            i < done ? (reached ? 'bg-success' : 'bg-blue') : 'bg-white/20',
        )}/>)}</span>
        <b className={cn('font-mono', reached ? 'text-success' : 'text-fg')}>{done}/{goal}</b>
    </Link>;
}
