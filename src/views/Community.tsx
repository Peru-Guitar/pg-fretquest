'use client';

import { Fragment } from 'react';
import { ROUTES, practiceUrl, userProfileUrl } from '@/lib/routes';
import { Link, useHydrated } from '@/lib/router';
import { Activity, CalendarRange, Crown, Flame, Guitar, Loader2, LogIn, Users } from 'lucide-react';
import { Card, Caption, PageTitle, SectionTitle } from '@/components/ui';
import { courses, type PracticeLesson } from '@/data/questMock';
import { LEVELS, levelLabel, useAccount } from '@/lib/account';
import { useCommunity } from '@/lib/community';
import { timeAgo } from '@/lib/timeAgo';
import { weekStartKey } from '@/lib/progressDb';
import { cn } from '@/lib/cn';
import { initials, toneOf } from '@/lib/avatar';
import { levelFromSeconds } from '@/lib/ranks';
import { RankGlyph } from '@/components/RankIcon';
import { TIER_COLOR } from '@/components/quest/rankStyle';
import { RankDistribution } from '@/components/quest/RankDistribution';

/**
 * Comunidad: el progreso de todos esta semana, con datos reales (ver `lib/community`).
 * Se necesita sesión iniciada para leerlos.
 */
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const lessonsById = new Map(courses.flatMap(course => course.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice').map(lesson => [lesson.id, { lesson, moduleId: course.id }] as const)));

/** Ranking visible: podio (3) + los 9 siguientes; el resto solo se cuenta («+N»). */
const TOP = 12;

const PODIUM = ['h-24 border-t-2 border-gold bg-white/5 text-gold', 'h-16 border-t-2 border-line-strong bg-white/5 text-fg-soft', 'h-12 border-t-2 border-accent/60 bg-white/5 text-accent'];

type RankEntry = { uid: string; name: string; tone: string; you: boolean; seconds: number; active: number; totalSeconds?: number };

/** Nivel y rango de alguien del ranking (si el reporte trae su total). */
function RankTag({ totalSeconds, className }: { totalSeconds?: number; className?: string }) {
    if (totalSeconds === undefined) return null;
    const { level, rank } = levelFromSeconds(totalSeconds);
    return <span className={cn('inline-flex max-w-full items-center gap-1 truncate text-2xs font-bold', TIER_COLOR[rank.tier], className)}><RankGlyph rank={rank} size={18}/>Nv. {level} · {rank.name}</span>;
}

/** Tiempo de la semana: «2 h 15 min», «45 min». */
const hoursLabel = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
};


// «ROBERTO» → «Roberto»: hay nombres guardados en mayúsculas.
const titleCase = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/** «26 oct» */
const shortDay = (date: Date) => date.toLocaleDateString('es', { day: 'numeric', month: 'short' }).replace('.', '');

/**
 * La semana del reporte, en una franja a todo el ancho bajo el título: fechas, los días en una línea de tiempo (hoy resaltado),
 * cuándo se reinicia y cuándo se actualizó. En móvil los bloques bajan uno debajo de otro.
 */
function WeekBar({ updatedAt }: { updatedAt: number }) {
    const [y, m, d] = weekStartKey().split('-').map(Number);
    const today = (new Date().getDay() + 6) % 7;
    const left = 7 - today;
    return <div className="mb-6 flex flex-col gap-3 rounded-xl border border-blue/30 bg-blue/12 px-5 py-3.5 text-fg lg:flex-row lg:items-center lg:gap-6">
        <div className="shrink-0">
            <p className="flex items-center gap-1.5 text-3xs font-black tracking-[0.18em] text-accent"><CalendarRange size={13}/>SEMANA ACTUAL</p>
            <p className="text-lg font-black text-fg">{shortDay(new Date(y, m - 1, d))} – {shortDay(new Date(y, m - 1, d + 6))}</p>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">{DAYS.map((day, index) => <Fragment key={day}>
            {index > 0 && <span aria-hidden className="h-px min-w-1 flex-1 bg-white/15"/>}
            <span aria-current={index === today ? 'date' : undefined} className={cn('flex shrink-0 flex-col items-center leading-tight', index === today ? 'text-accent' : 'text-subtle')}>
                <span className="text-3xs font-bold uppercase">{day}</span>
                <b className="font-mono text-sm">{String(new Date(y, m - 1, d + index).getDate()).padStart(2, '0')}</b>
            </span>
        </Fragment>)}</div>
        <div className="shrink-0 text-xs text-fg-soft lg:text-right">
            <p>Se reinicia <b className="text-accent">{left === 1 ? 'mañana' : `en ${left} días`}</b></p>
            <p className="text-muted">Última actualización {timeAgo(updatedAt)}</p>
        </div>
    </div>;
}

function RankRow({ row, place }: { row: RankEntry; place: number }) {
    return <li className="min-w-0"><Link to={userProfileUrl(row.uid)} className={cn('group flex items-center gap-3 rounded-lg border px-3 py-3 sm:px-3.5 transition-colors', row.you ? 'border-blue/50 bg-blue/10 hover:bg-blue/15' : 'border-line bg-white/2 hover:border-line-strong hover:bg-white/5')}>
        <span className="w-5 shrink-0 font-mono text-sm text-muted sm:w-7">{place}</span>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-2xs font-black text-white', row.tone)}>{initials(row.name)}</span>
        <span className="min-w-0 flex-1">
            <span className={cn('block truncate', row.you ? 'font-bold text-accent' : 'text-fg-soft')}>{row.you ? `${row.name} (tú)` : row.name}</span>
            <RankTag totalSeconds={row.totalSeconds} className="flex"/>
        </span>
        <span className="shrink-0 text-right text-2xs leading-tight text-muted"><b className="block font-mono text-sm text-fg sm:text-base">{hoursLabel(row.seconds)}</b>{row.active} días</span>
    </Link></li>;
}

export default function CommunityPage() {
    const account = useAccount();
    const hydrated = useHydrated();
    const { data, error } = useCommunity(account !== null);

    if (!hydrated) return <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;
    if (!account) return <>
        <PageTitle eyebrow="COMUNIDAD" title="No practicas solo." text="Así se está moviendo la comunidad de Fret Quest esta semana."/>
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <Users size={36} className="text-accent"/>
            <h2 className="text-2xl">Entra para ver la comunidad</h2>
            <p className="max-w-md text-sm text-muted">El ranking de la semana y la actividad de todos solo se ven con tu cuenta.</p>
            <Link to={ROUTES.login} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand hover:bg-brand-strong px-6 font-bold text-white"><LogIn size={18}/>Entrar</Link>
        </Card>
    </>;
    if (error) return <Card><p className="text-sm text-muted">No se pudo cargar la comunidad. Inténtalo de nuevo en un momento.</p></Card>;
    if (!data) return <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;

    const todayIndex = (new Date().getDay() + 6) % 7;
    const maxDay = Math.max(1, ...data.byDay);
    const ranking = data.ranking.map(row => ({ ...row, tone: row.uid === account.uid ? 'bg-raised !text-fg' : toneOf(row.uid), you: row.uid === account.uid }));
    const mine = data.ranking.find(row => row.uid === account.uid)?.total ?? 0;
    const WEEK = { people: data.people, practices: data.attempts, today: data.today, byDay: data.byDay, byLevel: data.byLevel, topLessons: data.topLessons.map(item => ({ id: item.lessonId, count: item.attempts })), sinceLaunch: data.sinceLaunch };
    const stats = [
        { icon: Users, value: WEEK.people, label: 'guitarristas entrenando esta semana' },
        { icon: Activity, value: WEEK.practices, label: 'prácticas completadas esta semana' },
        { icon: Flame, value: WEEK.today, label: 'practicando hoy' },
    ];

    return <>
        <PageTitle eyebrow="COMUNIDAD" title="No practicas solo." text="Así se está moviendo la comunidad de Fret Quest esta semana. Cada práctica suma."/>
        <WeekBar updatedAt={data.at}/>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">{stats.map(({ icon: Icon, value, label }) => <Card key={label} className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue/12 text-accent-strong"><Icon size={22}/></span>
            <div>
                <b className="block font-mono text-3xl text-fg">{value.toLocaleString('es')}</b>
                <span className="text-sm text-muted">{label}</span>
            </div>
        </Card>)}</div>

        <Card className="mb-6">
            <SectionTitle title="Ranking de la semana" className="mb-1"/>
            <Caption>Por tiempo practicado de lunes a domingo, sin importar la intensidad; en empate, por días distintos.</Caption>

            {/* Podio: 2º · 1º · 3º */}
            <ol className="mt-8 grid grid-cols-3 items-end gap-2 sm:gap-3 md:gap-5">{[1, 0, 2].map(place => {
                const row = ranking[place];
                if (!row) return <li key={place}/>;
                return <li key={row.uid} className="min-w-0"><Link to={userProfileUrl(row.uid)} className="group flex flex-col items-center text-center">
                    {place === 0 && <Crown size={24} className="mb-1 fill-gold text-gold"/>}
                    <span className={cn('grid place-items-center rounded-full font-black text-white ring-4', row.tone, place === 0 ? 'size-16 text-lg ring-gold/60 sm:size-20 sm:text-xl' : 'size-13 text-base ring-line-strong sm:size-16 sm:text-lg')}>{initials(row.name)}</span>
                    {/* En mobile solo el primer nombre: el completo no entra en un tercio de pantalla. */}
                    <b className={cn('mt-2.5 max-w-full truncate text-sm group-hover:underline sm:text-base', row.you ? 'text-accent' : 'text-fg')}><span className="sm:hidden">{titleCase(row.name.split(' ')[0])}</span><span className="hidden sm:inline">{row.name}</span>{row.you && ' (tú)'}</b>
                    <RankTag totalSeconds={row.totalSeconds} className="mt-0.5 justify-center"/>
                    <span className="text-xs text-muted"><b className="block font-mono text-fg-soft sm:inline">{hoursLabel(row.seconds)}</b><span className="hidden sm:inline"> · </span>{row.active} días</span>
                    <span className={cn('mt-3 grid w-full place-items-center rounded-t-xl font-mono text-2xl font-black', PODIUM[place])}>{place + 1}</span>
                </Link></li>;
            })}</ol>

            {/* Del 4º al 12º */}
            <ol className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{ranking.slice(3, TOP).map((row, index) => <RankRow key={row.uid} row={row} place={index + 4}/>)}</ol>
            {ranking.length === 0 && <p className="mt-2 text-sm text-muted">Todavía nadie practicó esta semana. ¡Sé el primero!</p>}
            {WEEK.people > TOP && <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/3 px-4 py-1.5 text-sm text-fg-soft"><Users size={15} className="text-accent"/><b className="font-mono text-fg">+{WEEK.people - TOP}</b> guitarristas más entrenaron esta semana</p>}
        </Card>

        {<Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-line bg-card">
            <p className="text-sm text-fg-soft">{mine > 0
                ? <>Esta semana <b className="text-fg">sumaste {mine} de las {WEEK.practices.toLocaleString('es')}</b> prácticas de la comunidad. ¡Gracias!</>
                : <>Todavía no sumaste prácticas esta semana. <b className="text-fg">La comunidad lleva {WEEK.practices.toLocaleString('es')}</b>: súmate.</>}</p>
            {mine === 0 && <Link to={ROUTES.plan} className="text-sm font-bold text-accent hover:underline">Ir a mi plan →</Link>}
        </Card>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] [&>*]:min-w-0">
            <Card>
                <SectionTitle title="Actividad de la semana" className="mb-1"/>
                <Caption>Prácticas completadas por día</Caption>
                <div className="flex h-56 items-end justify-around gap-1.5 pt-7.5 sm:gap-3" role="img" aria-label={`Prácticas por día: ${DAYS.map((day, index) => `${day} ${WEEK.byDay[index]}`).join(', ')}.`}>
                    {WEEK.byDay.map((value, index) => {
                        const future = index > todayIndex;
                        return <div key={DAYS[index]} className="flex h-full max-w-10 min-w-0 flex-1 flex-col items-center justify-end gap-2 text-3xs whitespace-nowrap text-muted">
                            <span className={cn(index === todayIndex && 'font-bold text-fg')}>{future ? '' : value}</span>
                            <i className={cn('w-full rounded-t', future ? 'h-1 bg-line' : index === todayIndex ? 'bg-blue' : 'bg-white/15')} style={future ? undefined : { height: `${value / maxDay * 150}px` }}/>
                            <small className={cn(index === todayIndex && 'font-bold text-fg')}>{index === todayIndex ? 'Hoy' : DAYS[index]}</small>
                        </div>;
                    })}
                </div>
            </Card>

            {data.byRank ? <Card>
                <SectionTitle title="Rangos de la comunidad" className="mb-1"/>
                <Caption>Quién entrena esta semana, por rango</Caption>
                <RankDistribution byRank={data.byRank}/>
            </Card> : <Card>
                <SectionTitle title="Intensidad de la comunidad" className="mb-1"/>
                <Caption>Quién entrena esta semana, por intensidad</Caption>
                <ul className="mt-5 flex flex-col gap-4">{LEVELS.map(level => <li key={level} className="text-sm">
                    <div className="mb-1.5 flex items-center gap-3">
                        <span className="flex-1 text-fg-soft">{levelLabel(level)}{account?.level === level && <span className="ml-2 text-2xs font-bold text-accent">TU INTENSIDAD</span>}</span>
                        <b className="font-mono">{WEEK.byLevel[level]}%</b>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/8"><span className="block h-full rounded-full bg-blue" style={{ width: `${WEEK.byLevel[level]}%` }}/></div>
                </li>)}</ul>
            </Card> }
        </div>

        <Card className="mt-6">
            <SectionTitle title="Lo más practicado esta semana" className="mb-4"/>
            <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line">{WEEK.topLessons.length === 0 && <li className="px-4 py-3.5 text-sm text-muted">Aún no hay prácticas esta semana.</li>}{WEEK.topLessons.map(({ id, count }, index) => {
                const found = lessonsById.get(id);
                if (!found) return null;
                return <li key={id}>
                    <Link to={practiceUrl(found.moduleId, id)} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/3">
                        <span className="w-6 font-mono text-accent">{index + 1}</span>
                        <Guitar size={17} className="text-accent-strong"/>
                        <span className="min-w-0 flex-1 font-bold">{found.lesson.title}</span>
                        <span className="text-sm text-muted"><b className="font-mono text-fg">{count}</b> veces</span>
                    </Link>
                </li>;
            })}</ol>
        </Card>

        {WEEK.sinceLaunch > 0 && <p className="mt-6 text-center text-sm text-muted"><b className="font-mono text-fg">{WEEK.sinceLaunch.toLocaleString('es')}</b> días de práctica registrados desde el lanzamiento.</p>}
    </>;
}
