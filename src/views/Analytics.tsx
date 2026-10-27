'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, CalendarCheck, ChevronRight, Clock, Gauge, Loader2, Repeat, Search, Target, Users } from 'lucide-react';
import { Button, Card, PageTitle, SectionTitle, Stat, Tabs } from '@/components/ui';
import { Tip } from '@/components/ui/Tip';
import { Link, useHydrated, useNavigate, useSearchParams } from '@/lib/router';
import { isAdmin, levelLabel, useAccount } from '@/lib/account';
import { readAnalytics, readMembers, type AnalyticsData, type Member, type ModuleRow, type Participant, type Ranked, type Tempo } from '@/lib/analytics';
import { initials, toneOf } from '@/lib/avatar';
import { weekStartKey } from '@/lib/progressDb';
import { speedName } from '@/data/practiceStudies';
import { ROUTES, userProfileUrl } from '@/lib/routes';
import { cn } from '@/lib/cn';

/**
 * Analytics: solo para el rol admin (`users/{uid}.role`). A los demás se les responde como página inexistente.
 * Tres pestañas (`?tab=`): Resumen (la semana en cifras, cuándo y cuánto se practica), Lecciones (cada módulo con sus
 * lecciones: tiempo, velocidad real frente a la sugerida y quiénes la practicaron) y Usuarios (todos los registrados y quiénes
 * practicaron). Cada cara lleva al perfil del usuario.
 */
export const time = (seconds: number) => seconds < 60 ? `${Math.round(seconds)} s` : seconds < 3600 ? `${Math.round(seconds / 60)} min` : `${(seconds / 3600).toFixed(1)} h`;
/** Módulo y lecciones comparten columnas para que las cifras queden alineadas. */
const COLUMNS = 'grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8';
/** Avatares visibles por lección; el resto se resume en «+N». */
const FACES = 5;
const share = (part: number, total: number) => total > 0 ? Math.round(part / total * 100) : 0;
const TABS = [{ value: 'resumen', label: 'Resumen' }, { value: 'lecciones', label: 'Lecciones' }, { value: 'usuarios', label: 'Usuarios' }] as const;
type Tab = typeof TABS[number]['value'];
/** Filas por página en la lista de usuarios. */
const PAGE = 50;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const shortDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const fold = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Dato del módulo: solo la cifra. */
function Figure({ icon: Icon, tone, value, label }: { icon: typeof Users; tone: 'users' | 'time'; value: string; label: string }) {
    return <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone === 'users' ? 'bg-blue/12 text-accent' : 'bg-success/12 text-success')}><Icon size={18}/></span>
        <div><b className="block text-2xl leading-none tabular-nums">{value}</b><span className="text-2xs text-muted">{label}</span></div>
    </div>;
}

const FACE = 'group/face relative grid size-8 place-items-center rounded-full text-3xs font-black text-white ring-2 ring-surface transition-transform duration-150 hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:-translate-y-0.5 focus-visible:outline-none';

/** Quiénes practicaron la lección: hasta 5 caras superpuestas (más tiempo primero) y «+N» con el resto. Cada cara abre su perfil. */
function Faces({ people }: { people: Participant[] }) {
    const shown = people.slice(0, FACES);
    const rest = people.slice(FACES);
    return <ul className="flex items-center -space-x-2">
        {shown.map(person => <li key={person.uid}>
            <Link to={userProfileUrl(person.uid)} aria-label={`${person.name}: ${time(person.seconds)}`} className={cn(FACE, toneOf(person.uid))}>
                {initials(person.name)}
                <Tip>{person.name} <span className="text-muted">· {time(person.seconds)}</span></Tip>
            </Link>
        </li>)}
        {rest.length > 0 && <li tabIndex={0} aria-label={`${rest.length} más`} className={cn(FACE, 'bg-raised text-fg-soft')}>
            +{rest.length}
            <Tip><span className="grid gap-0.5 text-left">{rest.map(person => <span key={person.uid}>{person.name} <span className="text-muted">· {time(person.seconds)}</span></span>)}</span></Tip>
        </li>}
    </ul>;
}

/** Velocidad real frente a la sugerida: por debajo, la lección quizá se les hace cuesta arriba. */
function TempoLine({ tempo }: { tempo: Tempo }) {
    const low = tempo.avg < tempo.target;
    return <p className="flex items-center gap-1.5 text-2xs text-muted">
        <Gauge size={12} className={low ? 'text-gold' : 'text-accent'}/>
        <span>Prom. <b className={low ? 'text-gold' : 'text-fg-soft'}>{speedName(tempo.avg)}</b> · máx <b className="text-fg-soft">{speedName(tempo.max)}</b></span>
        <span className="text-subtle">/ sugerida {speedName(tempo.target)}</span>
    </p>;
}

function LessonRow({ lesson, place }: { lesson: Ranked; place: number }) {
    return <li className={cn(COLUMNS, 'border-t border-line-soft py-3.5')}>
        <div className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 font-mono text-xs text-subtle">{place}</span>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-fg-soft">{lesson.title}</p>
                <p className="flex items-center gap-1 text-2xs text-muted"><Repeat size={11}/>{lesson.attempts} {lesson.attempts === 1 ? 'intento' : 'intentos'}</p>
            </div>
        </div>
        {/* Misma sangría que las cifras del módulo (icono de 40 px + hueco), para que todo quede en columna. */}
        <div className="flex items-center gap-3 md:pl-13">
            <Faces people={lesson.participants}/>
            <span className="text-2xs text-muted">{lesson.users} {lesson.users === 1 ? 'persona' : 'personas'}</span>
        </div>
        <div className="grid gap-0.5 md:pl-13">
            <p className="flex items-baseline gap-1.5"><b className="text-base text-fg tabular-nums">{time(lesson.seconds)}</b><span className="text-2xs text-muted">en total</span></p>
            {lesson.tempo && <TempoLine tempo={lesson.tempo}/>}
        </div>
    </li>;
}

function ModuleCard({ module, place, data }: { module: ModuleRow; place: number; data: AnalyticsData }) {
    return <Card className="overflow-hidden">
        {/* Cabecera en una fila: módulo y sus datos (en móvil, apilados). */}
        <div className={cn(COLUMNS, 'pb-5')}>
            <div className="flex min-w-0 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-raised">
                    {module.image && <img src={module.image} alt="" className="size-full object-cover"/>}
                    <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-md bg-canvas/80 font-mono text-3xs font-bold text-accent">{place}</span>
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-lg xl:text-xl">{module.title}</h2>
                    <p className="text-xs text-muted">{module.lessons.length} {module.lessons.length === 1 ? 'lección' : 'lecciones'} · {module.attempts} {module.attempts === 1 ? 'intento' : 'intentos'}</p>
                </div>
            </div>
            <Figure icon={Users} tone="users" value={`${module.users} de ${data.active}`} label="usuarios activos"/>
            <Figure icon={Clock} tone="time" value={time(module.seconds)} label="invertidos en el módulo"/>
        </div>
        <ul>
            {module.lessons.map((lesson, index) => <LessonRow key={lesson.id} lesson={lesson} place={index + 1}/>)}
        </ul>
    </Card>;
}

/** Cuándo se practica: minutos por día y hora (hora del navegador). Un solo tono, más intenso = más minutos. */
function Heatmap({ heat }: { heat: number[][] }) {
    const max = Math.max(1, ...heat.flat());
    const peak = heat.flatMap((row, day) => row.map((minutes, hour) => ({ day, hour, minutes }))).sort((a, b) => b.minutes - a.minutes)[0];
    return <Card>
        <SectionTitle title="Horario de práctica" className="mb-1"/>
        <p className="mb-4 text-xs text-muted">{peak && peak.minutes > 0 ? <>Pico: <b className="text-fg-soft">{DAYS[peak.day]} {peak.hour}:00–{peak.hour + 1}:00</b> · buen momento para publicar o recordar.</> : 'Sin práctica esta semana.'}</p>
        <div className="overflow-x-auto">
            <div className="grid min-w-120 grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-0.5">
                {heat.map((row, day) => <div key={day} className="contents">
                    <span className="self-center text-3xs text-muted">{DAYS[day]}</span>
                    {row.map((minutes, hour) => <span key={hour} title={`${DAYS[day]} ${hour}:00 · ${minutes} min`} className="aspect-square rounded-[3px] bg-line-soft" style={minutes > 0 ? { backgroundColor: `color-mix(in oklab, var(--color-blue) ${Math.round(20 + minutes / max * 80)}%, transparent)` } : undefined}/>)}
                </div>)}
                <span/>
                {Array.from({ length: 24 }, (_, hour) => <span key={hour} className="text-center text-4xs text-subtle">{hour % 6 === 0 ? hour : ''}</span>)}
            </div>
        </div>
    </Card>;
}

/** Reparto en tramos: barras horizontales de un solo color, con la cifra al lado. */
function Buckets({ title, caption, rows, unit }: { title: string; caption: ReactNode; rows: { label: string; count: number }[]; unit: [string, string] }) {
    const max = Math.max(1, ...rows.map(row => row.count));
    return <Card>
        <SectionTitle title={title} className="mb-1"/>
        <p className="mb-4 text-xs text-muted">{caption}</p>
        <ul className="grid gap-2.5">{rows.map(row => <li key={row.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-xs">
            <span className="text-muted">{row.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-line-soft"><span className="block h-full rounded-full bg-blue" style={{ width: `${row.count / max * 100}%` }}/></span>
            <span className="w-20 text-right"><b className="tabular-nums text-fg">{row.count}</b> <span className="text-muted">{row.count === 1 ? unit[0] : unit[1]}</span></span>
        </li>)}</ul>
    </Card>;
}

function LevelCard({ data }: { data: AnalyticsData }) {
    return <Card>
        <SectionTitle title="Por nivel" className="mb-1"/>
        <p className="mb-4 text-xs text-muted">Qué practica cada nivel: si a uno le falta contenido, aquí se nota.</p>
        <ul className="grid gap-3">{data.byLevel.map(row => <li key={row.level ?? 'none'} className="flex items-center gap-3 border-t border-line-soft pt-3 first:border-0 first:pt-0">
            <span className="w-24 shrink-0 text-sm font-bold text-fg-soft">{row.level ? levelLabel(row.level) : 'Sin nivel'}</span>
            <span className="min-w-0 flex-1 text-2xs text-muted">{row.top ? <>Lo más practicado: <b className="text-fg-soft">{row.top.title}</b></> : '—'}</span>
            <span className="shrink-0 text-right text-2xs text-muted"><b className="block text-sm tabular-nums text-fg">{time(row.seconds)}</b>{row.people} {row.people === 1 ? 'persona' : 'personas'}</span>
        </li>)}</ul>
    </Card>;
}

/** Todos los que practicaron esta semana, por tiempo. Cada fila abre su perfil. */
function PeopleCard({ data }: { data: AnalyticsData }) {
    return <Card>
        <SectionTitle title="Quiénes practicaron" className="mb-1"/>
        <p className="mb-3 text-xs text-muted">Por tiempo esta semana. Toca a alguien para ver su perfil.</p>
        <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">{data.people.map(person => <li key={person.uid}>
            <Link to={userProfileUrl(person.uid)} className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/4">
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-2xs font-black text-white', toneOf(person.uid))}>{initials(person.name)}</span>
                <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm text-fg-soft group-hover:text-fg">{person.name}</b>
                    <span className="text-2xs text-muted">{person.level ? levelLabel(person.level) : 'Sin nivel'} · {person.days} {person.days === 1 ? 'día' : 'días'} · {person.completed} con meta</span>
                </span>
                <b className="shrink-0 text-sm tabular-nums text-fg">{time(person.seconds)}</b>
                <ChevronRight size={15} className="shrink-0 text-subtle group-hover:text-accent"/>
            </Link>
        </li>)}</ul>
    </Card>;
}

/** Todos los registrados, por última práctica. Se cargan al abrir la pestaña; buscar y paginar no cuesta lecturas. */
function MembersCard() {
    const [state, setState] = useState<{ members: Member[] | null; error: boolean }>({ members: null, error: false });
    const [search, setSearch] = useState('');
    const [shown, setShown] = useState(PAGE);
    useEffect(() => {
        let alive = true;
        readMembers().then(members => alive && setState({ members, error: false })).catch(() => alive && setState({ members: null, error: true }));
        return () => { alive = false; };
    }, []);
    const { members, error } = state;
    const found = useMemo(() => {
        const term = fold(search.trim());
        return !members || !term ? members ?? [] : members.filter(member => fold([member.name, member.city, member.country].filter(Boolean).join(' ')).includes(term));
    }, [members, search]);

    return <Card>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
                <SectionTitle title="Todos los usuarios" className="mb-1"/>
                <p className="text-xs text-muted">{members ? `${members.length} registrados, por última práctica.` : 'Por última práctica.'}</p>
            </div>
            <label className="relative w-full sm:w-64">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
                <input type="search" value={search} onChange={event => { setSearch(event.target.value); setShown(PAGE); }} placeholder="Buscar por nombre o lugar" aria-label="Buscar usuarios" className="w-full pl-9"/>
            </label>
        </div>
        {error ? <p className="text-sm text-muted">No se pudo cargar la lista.</p>
            : !members ? <div className="grid place-items-center py-12 text-muted"><Loader2 className="animate-spin"/></div>
            : found.length === 0 ? <p className="py-6 text-center text-sm text-muted">Nadie coincide con «{search}».</p>
            : <>
                <ul className="divide-y divide-line-soft">{found.slice(0, shown).map(member => <li key={member.uid}>
                    <Link to={userProfileUrl(member.uid)} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-1 py-2.5 transition-colors hover:bg-white/4 md:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_7rem_auto]">
                        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-2xs font-black text-white', toneOf(member.uid))}>{initials(member.name)}</span>
                        <span className="min-w-0">
                            <b className="block truncate text-sm text-fg-soft group-hover:text-fg">{member.name}</b>
                            <span className="block truncate text-2xs text-muted">{member.level ? levelLabel(member.level) : 'Sin nivel'}<span className="md:hidden">{member.lastPractice ? ` · ${shortDate(member.lastPractice)}` : ''}</span></span>
                        </span>
                        <span className="hidden truncate text-xs text-muted md:block">{[member.city, member.country].filter(Boolean).join(', ') || '—'}</span>
                        <span className="hidden truncate text-xs text-muted md:block">{member.guitar ?? '—'}</span>
                        <span className="hidden text-right text-xs tabular-nums text-fg-soft md:block">{member.lastPractice ? shortDate(member.lastPractice) : <span className="text-muted">Nunca</span>}</span>
                        <ChevronRight size={15} className="shrink-0 text-subtle group-hover:text-accent"/>
                    </Link>
                </li>)}</ul>
                {found.length > shown && <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={() => setShown(shown + PAGE)}>Ver {Math.min(PAGE, found.length - shown)} más</Button>
                </div>}
            </>}
    </Card>;
}

export default function AnalyticsPage() {
    const hydrated = useHydrated();
    const account = useAccount();
    const admin = isAdmin(account);
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const tab: Tab = TABS.find(item => item.value === params.get('tab'))?.value ?? 'resumen';
    const [state, setState] = useState<{ data: AnalyticsData | null; error: boolean }>({ data: null, error: false });
    useEffect(() => {
        if (!admin) return;
        let alive = true;
        readAnalytics().then(data => alive && setState({ data, error: false })).catch(() => alive && setState({ data: null, error: true }));
        return () => { alive = false; };
    }, [admin]);

    const spinner = <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;
    if (!hydrated || (account && !account.synced)) return spinner;
    if (!admin) return <Card><p className="text-sm text-muted">Esta página no existe.</p></Card>;
    const { data, error } = state;
    return <>
        <PageTitle eyebrow="ADMIN" title="Analytics" text={`Usuarios y lo más practicado esta semana (desde el lunes ${weekStartKey()}).`}/>
        <Tabs items={[...TABS]} value={tab} onChange={value => navigate(value === 'resumen' ? ROUTES.analytics : `${ROUTES.analytics}?tab=${value}`)} label="Secciones de Analytics" className="mb-5"/>
        {tab === 'usuarios' && <div className="grid grid-cols-1 gap-5">
            <MembersCard/>
            {data && data.people.length > 0 && <PeopleCard data={data}/>}
        </div>}
        {tab !== 'usuarios' && (error ? <Card><p className="text-sm text-muted">No se pudieron cargar los datos.</p></Card> : !data ? spinner : tab === 'resumen' ? <div className="grid grid-cols-1 gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={<Users size={20}/>} value={String(data.users)} label="Usuarios registrados"/>
                <Stat icon={<Activity size={20}/>} value={String(data.active)} label="Practicaron esta semana" detail={`${share(data.active, data.users)}% del total`}/>
                <Stat icon={<Clock size={20}/>} value={time(data.seconds)} label="Tiempo practicado" detail={`${data.sessions.avg} min por persona y día`}/>
                <Stat icon={<Target size={20}/>} value={`${share(data.goal.completed, data.goal.days)}%`} label="Días con la meta cumplida" detail={`${data.goal.completed} de ${data.goal.days} días`}/>
            </div>
            {data.people.length > 0 ? <>
                <Heatmap heat={data.heat}/>
                <div className="grid gap-5 lg:grid-cols-2">
                    <Buckets title="Sesión típica" caption={<>Minutos por persona en un día. Promedio: <b className="text-fg-soft">{data.sessions.avg} min</b>.</>} rows={data.sessions.buckets} unit={['día', 'días']}/>
                    <Buckets title="Constancia" caption={<><CalendarCheck size={12} className="mr-1 inline text-accent"/>Cuántos días practicó cada persona esta semana.</>} rows={data.consistency} unit={['persona', 'personas']}/>
                </div>
                <LevelCard data={data}/>
            </> : <Card><p className="text-sm text-muted">Nadie ha practicado esta semana.</p></Card>}
        </div> : <div className="grid grid-cols-1 gap-5">
            {data.modules.length === 0
                ? <Card><p className="text-sm text-muted">Nadie ha practicado esta semana.</p></Card>
                : data.modules.map((module, index) => <ModuleCard key={module.id} module={module} place={index + 1} data={data}/>)}
        </div>)}
    </>;
}
