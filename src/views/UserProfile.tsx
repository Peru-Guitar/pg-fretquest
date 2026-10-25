'use client';

import { CalendarDays, ChevronDown, Clock, Gauge, Guitar, Loader2, LogIn, MapPin, RefreshCw, Repeat, Target } from 'lucide-react';
import { BackLink, Button, Card, LinkButton, SectionTitle, Stat } from '@/components/ui';
import { useHydrated, useSearchParams } from '@/lib/router';
import { isAdmin, levelLabel, useAccount } from '@/lib/account';
import { useUserProfile, type ProfileLesson, type UserProfile } from '@/lib/profile';
import { courses } from '@/data/questMock';
import { initials, toneOf } from '@/lib/avatar';
import { ROUTES } from '@/lib/routes';
import { timeAgo } from '@/lib/timeAgo';
import { cn } from '@/lib/cn';
import { Tip } from '@/components/ui/Tip';
import { DAYS, time } from '@/views/Analytics';

/**
 * Perfil de un usuario, desde Comunidad o Analytics: `/perfil?uid=…`. Con sesión iniciada.
 * Todos ven su historial de práctica; solo el admin ve sus datos privados (ciudad, guitarra, meta).
 * Se cachea 1 hora por usuario (ver `lib/profile`).
 */
const dateLabel = (key?: string) => key ? new Date(`${key}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const imageOf = new Map(courses.map(course => [course.id, course.image]));

/** Lecciones agrupadas por módulo, el de más tiempo primero (las lecciones ya vienen ordenadas por tiempo). */
function groupByModule(lessons: ProfileLesson[]) {
    const modules = new Map<string, { id: string; title: string; image?: string; seconds: number; attempts: number; lastAt: number; lessons: ProfileLesson[] }>();
    for (const lesson of lessons) {
        const id = lesson.moduleId || lesson.module;
        const row = modules.get(id) ?? modules.set(id, { id, title: lesson.module, image: imageOf.get(lesson.moduleId), seconds: 0, attempts: 0, lastAt: 0, lessons: [] }).get(id)!;
        row.seconds += lesson.seconds; row.attempts += lesson.attempts; row.lastAt = Math.max(row.lastAt, lesson.lastAt);
        row.lessons.push(lesson);
    }
    return [...modules.values()].sort((a, b) => b.seconds - a.seconds);
}

/** Barras verticales de un solo color, con tooltip por barra y la cifra de la más alta. */
function Columns({ rows, highlight }: { rows: { label: string; tip: string; minutes: number }[]; highlight: number }) {
    const max = Math.max(1, ...rows.map(row => row.minutes));
    return <div className="flex h-36 items-end gap-2">
        {rows.map((row, index) => <div key={index} className="group/face relative flex h-full flex-1 flex-col items-center justify-end gap-1.5" tabIndex={0} aria-label={`${row.tip}: ${row.minutes} min`}>
            <Tip>{row.tip} <span className="text-muted">· {row.minutes} min</span></Tip>
            <span className={cn('w-full max-w-10 rounded-t-[4px] transition-colors', index === highlight ? 'bg-blue' : 'bg-blue/45 group-hover/face:bg-blue/70')} style={{ height: `${Math.max(row.minutes / max * 100, row.minutes > 0 ? 4 : 1.5)}%` }}/>
            <span className={cn('text-3xs', index === highlight ? 'font-bold text-fg-soft' : 'text-muted')}>{row.label}</span>
        </div>)}
    </div>;
}

function Header({ profile, onRefresh }: { profile: UserProfile; onRefresh: () => void }) {
    const place = [profile.city, profile.country].filter(Boolean).join(', ');
    return <Card className="mb-5 flex flex-wrap items-center gap-4 md:gap-5">
        <span className={cn('grid size-16 shrink-0 place-items-center rounded-full text-xl font-black text-white ring-4 ring-line-strong md:size-20 md:text-2xl', toneOf(profile.uid))}>{initials(profile.name)}</span>
        <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl md:text-3xl">{profile.name}<span className="text-accent">.</span></h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="rounded-md bg-blue/15 px-2 py-0.5 font-bold text-accent">{profile.level ? levelLabel(profile.level) : 'Sin nivel'}</span>
                {place && <span className="flex items-center gap-1"><MapPin size={13}/>{place}</span>}
                {profile.guitar && <span className="flex items-center gap-1"><Guitar size={13}/>{profile.guitar}</span>}
                {profile.weeklyGoal && <span className="flex items-center gap-1"><Target size={13}/>{profile.weeklyGoal} días/sem · {profile.sessionMinutes ?? 30} min</span>}
            </p>
            <p className="mt-1.5 text-2xs text-subtle">Desde {dateLabel(profile.first)} · última práctica {dateLabel(profile.last)}</p>
        </div>
        <Button variant="secondary" onClick={onRefresh} className="shrink-0"><RefreshCw size={15}/>Actualizar</Button>
    </Card>;
}

export default function UserProfilePage() {
    const hydrated = useHydrated();
    const account = useAccount();
    const admin = isAdmin(account);
    const [params] = useSearchParams();
    const uid = params.get('uid');
    const { data, error, refresh } = useUserProfile(account ? uid : null, admin);

    const spinner = <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;
    if (!hydrated || (account && !account.synced)) return spinner;
    const back = <BackLink to={ROUTES.community}>Comunidad</BackLink>;
    if (!account) return <>{back}<Card className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="max-w-md text-sm text-muted">Los perfiles de la comunidad solo se ven con tu cuenta.</p>
        <LinkButton to={ROUTES.login}><LogIn size={18}/>Entrar</LinkButton>
    </Card></>;
    if (!uid) return <>{back}<Card><p className="text-sm text-muted">Falta el usuario.</p></Card></>;
    if (error) return <>{back}<Card><p className="text-sm text-muted">No se pudo cargar el perfil.</p></Card></>;
    if (!data) return <>{back}{spinner}</>;

    const todayIndex = (new Date().getDay() + 6) % 7;
    const thisWeek = data.week.reduce((sum, minutes) => sum + minutes, 0);
    const modules = groupByModule(data.lessons);
    return <>
        {back}
        <Header profile={data} onRefresh={refresh}/>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Clock size={20}/>} value={time(data.seconds)} label="Tiempo total" detail={data.days ? `${Math.round(data.seconds / 60 / data.days)} min por día` : undefined}/>
            <Stat icon={<CalendarDays size={20}/>} value={String(data.days)} label="Días practicados" detail={`${data.completed} con la meta cumplida`}/>
            <Stat icon={<Repeat size={20}/>} value={String(data.attempts)} label="Ejercicios terminados" detail={`${data.lessons.length} lecciones distintas`}/>
            <Stat icon={<Target size={20}/>} value={`${thisWeek} min`} label="Esta semana"/>
        </div>

        <div className="mb-5 grid gap-5 lg:grid-cols-2">
            <Card>
                <SectionTitle title="Esta semana" className="mb-1"/>
                <p className="mb-4 text-xs text-muted">Minutos por día.</p>
                <Columns highlight={todayIndex} rows={data.week.map((minutes, index) => ({ label: DAYS[index], tip: DAYS[index], minutes }))}/>
            </Card>
            <Card>
                <SectionTitle title="Últimas 8 semanas" className="mb-1"/>
                <p className="mb-4 text-xs text-muted">Minutos por semana: ¿va en subida o se está apagando?</p>
                <Columns highlight={data.weeks.length - 1} rows={data.weeks.map(week => ({ label: dateLabel(week.start).split(' ').slice(0, 2).join(' '), tip: `Semana del ${dateLabel(week.start)}`, minutes: week.minutes }))}/>
            </Card>
        </div>

        <Card className="mb-5">
            <SectionTitle title="Módulos" className="mb-1"/>
            <p className="mb-3 text-xs text-muted">Lo que practicó, por módulo y tiempo. Cada lección con su BPM máximo y el último, frente al sugerido.</p>
            {modules.length === 0 ? <p className="text-sm text-muted">Todavía no practicó.</p> : <ul className="flex flex-col gap-2">{modules.map(module => <li key={module.id}>
                <details open className="group rounded-xl border border-line-soft">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-2 pr-4">
                        {module.image ? <img src={module.image} alt="" width={96} height={64} loading="lazy" decoding="async" className="h-12 w-18 shrink-0 rounded-lg bg-sunken object-cover"/> : <span className="h-12 w-18 shrink-0 rounded-lg bg-sunken"/>}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-fg-soft">{module.title}</p>
                            <p className="truncate text-2xs text-muted">{module.lessons.length} {module.lessons.length === 1 ? 'lección' : 'lecciones'} · {module.attempts} {module.attempts === 1 ? 'intento' : 'intentos'}{module.lastAt > 0 && ` · ${timeAgo(module.lastAt)}`}</p>
                        </div>
                        <b className="text-sm tabular-nums text-fg">{time(module.seconds)}</b>
                        <ChevronDown size={16} className="shrink-0 text-muted transition-transform group-open:rotate-180"/>
                    </summary>
                    <ul className="px-4 pb-1">{module.lessons.map(lesson => {
                        const reached = lesson.target && lesson.bpmMax >= lesson.target.max;
                        return <li key={lesson.id} className="grid gap-1 border-t border-line-soft py-2.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-fg-soft">{lesson.title}</p>
                                <p className="truncate text-2xs text-muted">{lesson.days} {lesson.days === 1 ? 'día' : 'días'} · {lesson.attempts} {lesson.attempts === 1 ? 'intento' : 'intentos'}</p>
                            </div>
                            <p className="flex items-center gap-1.5 text-2xs text-muted">
                                <Gauge size={13} className={reached ? 'text-success' : 'text-accent'}/>
                                <span>máx <b className={cn('tabular-nums', reached ? 'text-success' : 'text-fg-soft')}>{lesson.bpmMax || '—'}</b> · último <b className="tabular-nums text-fg-soft">{lesson.bpmLast || '—'}</b></span>
                                {lesson.target && <span className="text-subtle">/ {lesson.target.min}–{lesson.target.max}</span>}
                            </p>
                            <p className="text-xs tabular-nums text-fg-soft md:text-right">{time(lesson.seconds)}</p>
                        </li>;
                    })}</ul>
                </details>
            </li>)}</ul>}
        </Card>

    </>;
}
