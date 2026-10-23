import { Check, Clock3 } from 'lucide-react';
import { Meter } from '@/components/ui';
import { useDailyPractice } from '@/lib/practiceTime';
import { cn } from '@/lib/cn';

/** Plan del día: minutos planificados, practicados y restantes. */
export function DailyGoal({ compact, className, extraSeconds = 0 }: { compact?: boolean; className?: string; extraSeconds?: number }) {
    // `extraSeconds`: tiempo de la sesión en curso, aún sin guardar, para ver el plan avanzar en vivo.
    const daily = useDailyPractice();
    const seconds = daily.seconds + extraSeconds;
    const goal = daily.goal;
    const done = seconds >= goal * 60;
    const remaining = Math.ceil(Math.max(0, goal * 60 - seconds) / 60);
    const clock = `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    const message = done ? '¡Cumpliste tu plan de hoy!' : seconds === 0 ? `Hoy tienes planificado practicar ${goal} min` : `Te faltan ${remaining} min para tu plan de hoy`;

    return <div className={cn('rounded-xl border border-line bg-card', compact ? 'flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-6' : 'p-6', className)}>
        <div className={cn('flex items-center gap-3', compact && 'md:w-80 md:shrink-0')}>
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', done ? 'bg-success/15 text-success' : 'bg-violet/15 text-accent-strong')}>{done ? <Check size={20}/> : <Clock3 size={20}/>}</span>
            <div>
                <p className="text-xs text-muted">Plan de hoy</p>
                <p className="text-sm font-bold">{message}</p>
            </div>
        </div>
        <div className={cn('flex flex-1 items-center gap-4', !compact && 'mt-5')}>
            <Meter value={(seconds / (goal * 60)) * 100} tone={done ? 'success' : 'brand'} size="md" label="Minutos practicados hoy"/>
            <span className="shrink-0 font-mono text-sm"><b className="text-fg">{clock}</b><span className="text-muted"> / {goal}:00</span></span>
        </div>
    </div>;
}

/** Versión en línea para la barra superior: siempre visible. */
export function HeaderDailyGoal() {
    const { goal, seconds, remaining, done } = useDailyPractice();
    return <div className="hidden items-center gap-3 text-xs md:flex">
        <span className="font-bold text-fg-soft">Plan de hoy</span>
        <span className="font-mono text-muted"><b className="text-fg">{Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, '0')}</b> / {goal}:00</span>
        <Meter value={(seconds / (goal * 60)) * 100} tone={done ? 'success' : 'brand'} label="Plan de práctica de hoy" className="w-28 xl:w-40"/>
        <span className={cn('hidden lg:inline', done ? 'text-success' : 'text-muted')}>{done ? '✓ Plan cumplido' : `Te faltan ${remaining} min`}</span>
    </div>;
}
