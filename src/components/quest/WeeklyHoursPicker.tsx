import { WEEKLY_HOURS } from '@/lib/domain/weeklyGoal';
import { cn } from '@/lib/cn';

/** Elección de la meta semanal: horas por semana que quieres practicar. */
export function WeeklyHoursPicker({ value, onChange }: { value: number | undefined; onChange: (hours: number) => void }) {
    return <div role="radiogroup" aria-label="Horas por semana" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {WEEKLY_HOURS.map(option => {
            const selected = value === option.hours;
            const tone = selected ? 'border-blue bg-blue/15 text-fg' : 'border-line text-fg-soft hover:border-line-strong';
            return <button key={option.hours} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.hours)} className={cn('flex flex-col items-center gap-1 rounded-xl border px-2 py-4 text-center transition', tone)}>
                <b className="font-mono text-3xl">{option.hours}<span className="text-sm font-bold text-muted"> h</span></b>
                <span className="text-2xs text-muted">por semana</span>
                <span className="mt-1 text-sm font-bold">{option.label}</span>
                <span className="text-3xs leading-snug text-muted">{option.text}</span>
            </button>;
        })}
    </div>;
}
