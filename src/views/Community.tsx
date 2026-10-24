'use client';

import { ROUTES, practiceUrl } from '@/lib/routes';
import { Link, useHydrated } from '@/lib/router';
import { Activity, Crown, Flame, Guitar, Loader2, LogIn, Users } from 'lucide-react';
import { Card, Caption, PageTitle, SectionTitle } from '@/components/ui';
import { courses, type Difficulty, type PracticeLesson } from '@/data/questMock';
import { LEVELS, levelLabel, useAccount } from '@/lib/account';
import { useCommunity } from '@/lib/community';
import { timeAgo } from '@/lib/timeAgo';
import { cn } from '@/lib/cn';

/**
 * Comunidad: el progreso de todos esta semana, con datos reales (ver `lib/community`).
 * Se necesita sesión iniciada para leerlos.
 */
const FACE_TONES = ['from-[#e0662f] to-[#8a3214]', 'from-[#ffc156] to-[#b07415]', 'from-[#5aa9e6] to-[#24527a]', 'from-[#7bd389] to-[#2e7a3c]', 'from-[#c08cff] to-[#5b2f99]', 'from-[#ff8fa3] to-[#a33a4f]'];
/** Color estable por usuario. */
const toneOf = (uid: string) => FACE_TONES[[...uid].reduce((sum, char) => sum + char.charCodeAt(0), 0) % FACE_TONES.length];
const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const LEVEL_TONE: Record<Difficulty, string> = { base: 'bg-success', intermedio: 'bg-gold', avanzado: 'bg-orange-400', experto: 'bg-red-400' };

const lessonsById = new Map(courses.flatMap(course => course.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice').map(lesson => [lesson.id, { lesson, moduleId: course.id }] as const)));

/** Ranking visible: podio (3) + los 9 siguientes; el resto solo se cuenta («+N»). */
const TOP = 12;

const PODIUM = ['h-24 bg-linear-to-b from-gold/40 to-gold/5 text-gold', 'h-16 bg-linear-to-b from-white/20 to-white/3 text-fg-soft', 'h-12 bg-linear-to-b from-brand/35 to-brand/5 text-accent'];

type RankEntry = { name: string; tone: string; you: boolean; total: number; active: number };


function RankRow({ row, place }: { row: RankEntry; place: number }) {
    return <li className={cn('flex items-center gap-3 rounded-lg border px-3.5 py-3', row.you ? 'border-brand/50 bg-brand/10' : 'border-line bg-white/2')}>
        <span className="w-7 font-mono text-sm text-muted">{place}</span>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-linear-135 text-2xs font-black text-white', row.tone)}>{initials(row.name)}</span>
        <span className={cn('min-w-0 flex-1 truncate', row.you ? 'font-bold text-accent' : 'text-fg-soft')}>{row.you ? `${row.name} (tú)` : row.name}</span>
        <span className="text-right text-2xs leading-tight text-muted"><b className="block font-mono text-base text-fg">{row.total}</b>{row.active} días</span>
    </li>;
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
            <Link to={ROUTES.login} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-linear-135 from-brand to-brand-strong px-6 font-bold text-white shadow-[0_8px_26px_#e0662f55]"><LogIn size={18}/>Entrar</Link>
        </Card>
    </>;
    if (error) return <Card><p className="text-sm text-muted">No se pudo cargar la comunidad. Inténtalo de nuevo en un momento.</p></Card>;
    if (!data) return <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;

    const todayIndex = (new Date().getDay() + 6) % 7;
    const maxDay = Math.max(1, ...data.byDay);
    const ranking = data.ranking.map(row => ({ ...row, tone: row.uid === account.uid ? 'from-gold to-brand' : toneOf(row.uid), you: row.uid === account.uid }));
    const mine = data.ranking.find(row => row.uid === account.uid)?.total ?? 0;
    const WEEK = { people: data.people, practices: data.attempts, today: data.today, byDay: data.byDay, byLevel: data.byLevel, topLessons: data.topLessons.map(item => ({ id: item.lessonId, count: item.attempts })), sinceLaunch: data.sinceLaunch };
    const stats = [
        { icon: Users, value: WEEK.people, label: 'guitarristas entrenando esta semana' },
        { icon: Activity, value: WEEK.practices, label: 'prácticas completadas esta semana' },
        { icon: Flame, value: WEEK.today, label: 'practicando hoy' },
    ];

    return <>
        <PageTitle eyebrow="COMUNIDAD" title="No practicas solo." text="Así se está moviendo la comunidad de Fret Quest. Sin rankings: cada práctica suma."/>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">{stats.map(({ icon: Icon, value, label }) => <Card key={label} className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/12 text-accent-strong"><Icon size={22}/></span>
            <div>
                <b className="block font-mono text-3xl text-fg">{value.toLocaleString('es')}</b>
                <span className="text-sm text-muted">{label}</span>
            </div>
        </Card>)}</div>

        <Card className="mb-6">
            <SectionTitle title="Ranking de la semana" className="mb-1"/>
            <Caption>Por prácticas completadas; en empate, por días distintos. Se reinicia cada lunes · actualizado {timeAgo(data.at)}.</Caption>

            {/* Podio: 2º · 1º · 3º */}
            <ol className="mt-8 grid grid-cols-3 items-end gap-3 md:gap-5">{[1, 0, 2].map(place => {
                const row = ranking[place];
                if (!row) return <li key={place}/>;
                return <li key={row.uid} className="flex flex-col items-center text-center">
                    {place === 0 && <Crown size={24} className="mb-1 fill-gold text-gold"/>}
                    <span className={cn('grid place-items-center rounded-full bg-linear-135 font-black text-white ring-4', row.tone, place === 0 ? 'size-20 text-xl ring-gold/60' : 'size-16 text-lg ring-line-strong')}>{initials(row.name)}</span>
                    <b className={cn('mt-2.5 max-w-full truncate', row.you ? 'text-accent' : 'text-fg')}>{row.you ? `${row.name} (tú)` : row.name}</b>
                    <span className="text-xs text-muted"><b className="font-mono text-fg-soft">{row.total}</b> prácticas · {row.active} días</span>
                    <span className={cn('mt-3 grid w-full place-items-center rounded-t-xl font-mono text-2xl font-black', PODIUM[place])}>{place + 1}</span>
                </li>;
            })}</ol>

            {/* Del 4º al 12º */}
            <ol className="mt-1 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{ranking.slice(3, TOP).map((row, index) => <RankRow key={row.uid} row={row} place={index + 4}/>)}</ol>
            {ranking.length === 0 && <p className="mt-2 text-sm text-muted">Todavía nadie practicó esta semana. ¡Sé el primero!</p>}
            {WEEK.people > TOP && <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/3 px-4 py-1.5 text-sm text-fg-soft"><Users size={15} className="text-accent"/><b className="font-mono text-fg">+{WEEK.people - TOP}</b> guitarristas más entrenaron esta semana</p>}
        </Card>

        {<Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-brand/30 bg-linear-135 from-brand/10 to-transparent">
            <p className="text-sm text-fg-soft">{mine > 0
                ? <>Esta semana <b className="text-fg">sumaste {mine} de las {WEEK.practices.toLocaleString('es')}</b> prácticas de la comunidad. ¡Gracias!</>
                : <>Todavía no sumaste prácticas esta semana. <b className="text-fg">La comunidad lleva {WEEK.practices.toLocaleString('es')}</b>: súmate.</>}</p>
            {mine === 0 && <Link to={ROUTES.plan} className="text-sm font-bold text-accent hover:underline">Ir a mi plan →</Link>}
        </Card>}

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <Card>
                <SectionTitle title="Actividad de la semana" className="mb-1"/>
                <Caption>Prácticas completadas por día</Caption>
                <div className="flex h-56 items-end justify-around gap-3 pt-7.5" role="img" aria-label={`Prácticas por día: ${DAYS.map((day, index) => `${day} ${WEEK.byDay[index]}`).join(', ')}.`}>
                    {WEEK.byDay.map((value, index) => {
                        const future = index > todayIndex;
                        return <div key={DAYS[index]} className="flex h-full w-10 flex-col items-center justify-end gap-2 text-3xs whitespace-nowrap text-muted">
                            <span className={cn(index === todayIndex && 'font-bold text-fg')}>{future ? '' : value}</span>
                            <i className={cn('w-full rounded-t', future ? 'h-1 bg-line' : index === todayIndex ? 'bg-linear-to-b from-gold to-brand' : 'bg-brand/60')} style={future ? undefined : { height: `${value / maxDay * 150}px` }}/>
                            <small className={cn(index === todayIndex && 'font-bold text-fg')}>{index === todayIndex ? 'Hoy' : DAYS[index]}</small>
                        </div>;
                    })}
                </div>
            </Card>

            <Card>
                <SectionTitle title="Niveles de la comunidad" className="mb-1"/>
                <Caption>Quién entrena esta semana, por nivel</Caption>
                <div className="mt-5 flex h-3 overflow-hidden rounded-full">{LEVELS.map(level => <span key={level} className={LEVEL_TONE[level]} style={{ width: `${WEEK.byLevel[level]}%` }}/>)}</div>
                <ul className="mt-5 flex flex-col gap-3">{LEVELS.map(level => <li key={level} className="flex items-center gap-3 text-sm">
                    <span className={cn('size-3 rounded-sm', LEVEL_TONE[level])}/>
                    <span className="flex-1 text-fg-soft">{levelLabel(level)}{account?.level === level && <span className="ml-2 text-2xs font-bold text-accent">TU NIVEL</span>}</span>
                    <b className="font-mono">{WEEK.byLevel[level]}%</b>
                </li>)}</ul>
            </Card>
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

        <p className="mt-6 text-center text-sm text-muted"><b className="font-mono text-fg">{WEEK.sinceLaunch.toLocaleString('es')}</b> días de práctica registrados desde el lanzamiento.</p>
    </>;
}
