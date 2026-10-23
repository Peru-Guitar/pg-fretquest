import { useState } from 'react';
import { Clock3, Flame, Target, Trophy, Zap } from 'lucide-react';
import { player } from '@/data/questMock';
import { Achievements } from '@/components/quest/QuestUI';
import { Caption, Card, Eyebrow, IconTile, Meter, PageTitle, SectionTitle, Stat } from '@/components/ui';
import { cn } from '@/lib/cn';

// Mes de demostración: octubre de 2026, hoy es 22.
const today = new Date(2026, 9, 22);
const monthName = today.toLocaleDateString('es', { month: 'long', year: 'numeric' }).replace(/^./, letter => letter.toUpperCase());
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstWeekday = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
// Minutos practicados por día (índice 0 = día 1). Datos de ejemplo.
const minutesByDay = [20, 35, 12, 0, 25, 45, 0, 18, 30, 8, 0, 0, 22, 40, 0, 15, 28, 50, 10, 20, 35, 40];
const practicedDays = minutesByDay.filter(minutes => minutes > 0).length;
const heatLevels = [
    { label: 'Sin práctica', max: 0, className: 'bg-white/5' },
    { label: '1–15 min', max: 15, className: 'bg-[#3b3580]' },
    { label: '16–30 min', max: 30, className: 'bg-[#5d4bc4]' },
    { label: '31+ min', max: Infinity, className: 'bg-[#a181ff]' },
];
const heatLevel = (minutes: number) => heatLevels.find(level => minutes <= level.max)!;
const history = [['Púa alternada', 'Hoy, 18:30', '96%', '+150 XP'], ['Cruces de cuerda', 'Ayer, 19:10', '92%', '+120 XP'], ['Sincronización de manos', '19 oct, 17:45', '94%', '+180 XP']];

export default function ProgressPage() {
    const [period, setPeriod] = useState('Esta semana');
    const current = period === 'Esta semana';
    return <>
        <PageTitle eyebrow="CADA NOTA CUENTA" title="Mira todo lo que has avanzado." text="El progreso no siempre se escucha en un día. Aquí puedes verlo.">
            <select aria-label="Periodo" value={period} onChange={event => setPeriod(event.target.value)}><option>Esta semana</option><option>Semana anterior</option></select>
        </PageTitle>
        <div className="mb-6 grid grid-cols-2 gap-2.5 md:mb-8 lg:grid-cols-4 xl:gap-4">
            <Stat tone="blue" icon={<Clock3/>} value={current ? '2 h 35 min' : '1 h 58 min'} label="Tiempo de práctica" detail="Un espacio para ti y tu guitarra"/>
            <Stat tone="green" icon={<Target/>} value={current ? '94%' : '89%'} label="Precisión promedio" detail="Tu técnica sigue creciendo"/>
            <Stat tone="orange" icon={<Flame/>} value="7 días" label="Racha actual" detail="Tu mejor racha: 12 días"/>
            <Stat tone="gold" icon={<Zap/>} value="2.450" label="Experiencia total" detail="Nivel 12 · Explorador"/>
        </div>
        <Card className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Trophy className="shrink-0 text-accent" size={35}/>
            <div className="flex-1">
                <Eyebrow className="mb-1">NIVEL {player.level}</Eyebrow>
                <h2>{player.rank}</h2>
            </div>
            <div className="md:w-72">
                <Meter value={82} label="Experiencia"/>
                <Caption className="mt-2">{player.xp} / 3.000 XP para el siguiente nivel</Caption>
            </div>
        </Card>
        <div className="mb-6 flex flex-col gap-6">
            <Card>
                <SectionTitle title="El ritmo de tu semana" className="mb-4"/>
                <p className="text-sm text-muted">Minutos de práctica · {period.toLowerCase()}</p>
                <div className="flex h-56 items-end justify-around gap-4 pt-7.5" role="img" aria-label="Práctica por día: lunes 20, martes 35, miércoles 15, jueves 40, viernes 25, sábado 10, domingo 10 minutos.">
                    {[20, 35, 15, 40, 25, 10, 10].map((value, index) => {
                        const minutes = current ? value : Math.max(5, value - 6);
                        return <div key={index} className="flex h-full w-10 flex-col items-center justify-end gap-2.5 text-3xs whitespace-nowrap text-muted">
                            <span>{minutes} min</span>
                            <i className="min-h-2.5 w-full rounded-t bg-linear-to-b from-[#9a74ff] to-[#4261f3] shadow-[0_0_12px_#6153ff22]" style={{ height: `${minutes * 3}px` }}/>
                            <small>{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}</small>
                        </div>;
                    })}
                </div>
            </Card>
            <Card>
                <SectionTitle title="Tu actividad del mes" className="mb-4"/>
                <p className="text-sm text-muted">{monthName} · practicaste <strong className="text-fg">{practicedDays} de {today.getDate()} días</strong></p>
                <div className="mt-6 overflow-x-auto pb-1">
                    <div className="grid min-w-160 grid-cols-[repeat(31,minmax(0,1fr))] gap-1 text-center text-3xs text-subtle md:gap-1.5">
                        {Array.from({ length: daysInMonth }, (_, index) => {
                            const day = index + 1;
                            const future = day > today.getDate();
                            const minutes = minutesByDay[index] ?? 0;
                            const weekday = (firstWeekday + index) % 7;
                            return <div key={day} className="flex flex-col items-center gap-1.5">
                                <span className={cn(weekday >= 5 && 'text-muted')}>{'LMXJVSD'[weekday]}</span>
                                <span title={future ? `${day} oct` : `${day} oct · ${minutes ? `${minutes} min` : 'sin práctica'}`} className={cn('aspect-square w-full rounded-md',
                                    future ? 'border border-line' : heatLevel(minutes).className,
                                    day === today.getDate() && 'ring-2 ring-accent ring-offset-2 ring-offset-raised')}/>
                                <span className={cn(day === today.getDate() && 'font-bold text-fg')}>{day}</span>
                            </div>;
                        })}
                    </div>
                </div>
                <div className="my-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-2xs text-muted">
                    {heatLevels.map(level => <span key={level.label} className="flex items-center gap-1.5"><span className={cn('size-3 rounded', level.className)}/>{level.label}</span>)}
                </div>
                <div className="border-t border-line pt-4.5 text-xs text-[#b7bee2]">✦ Tu mejor semana: <strong>3 h 20 min</strong></div>
            </Card>
        </div>
        <SectionTitle title="Tus logros" className="mt-7 mb-4"/>
        <Achievements/>
        <SectionTitle title="Últimas aventuras" className="mt-7 mb-4"/>
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {history.map(([title, time, accuracy, xp]) => <div key={title} className="flex items-center gap-3 bg-surface p-4 md:gap-4.5 xl:px-5.5">
                <IconTile className="hidden size-9 xs:grid md:size-10.5"><Target/></IconTile>
                <div className="flex-1"><h3 className="text-sm md:text-[0.9375rem]">{title}</h3><p className="text-2xs text-muted">{time}</p></div>
                <span className="text-xs md:mr-5 md:text-md">{accuracy} <small className="block text-2xs text-muted">precisión</small></span>
                <b className="text-2xs text-success md:text-sm">{xp}</b>
            </div>)}
        </div>
    </>;
}
