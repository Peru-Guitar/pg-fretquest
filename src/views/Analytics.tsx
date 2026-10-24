'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, Loader2, Repeat, Users } from 'lucide-react';
import { Card, PageTitle, Stat } from '@/components/ui';
import { useHydrated } from '@/lib/router';
import { isAdmin, useAccount } from '@/lib/account';
import { readAnalytics, type AnalyticsData, type ModuleRow, type Ranked } from '@/lib/analytics';
import { weekStartKey } from '@/lib/progressDb';
import { cn } from '@/lib/cn';

/**
 * Analytics: solo para el rol admin (`users/{uid}.role`). A los demás se les responde como página inexistente.
 * Cada módulo con sus lecciones. El módulo da solo cifras (usuarios sobre los activos y tiempo invertido);
 * las barras de cada lección son su parte dentro del módulo: qué lección se llevó más.
 */
const time = (seconds: number) => seconds < 60 ? `${seconds} s` : seconds < 3600 ? `${Math.round(seconds / 60)} min` : `${(seconds / 3600).toFixed(1)} h`;
/** Módulo y lecciones comparten columnas para que las barras queden alineadas. */
const COLUMNS = 'grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8';
const share = (part: number, total: number) => total > 0 ? Math.round(part / total * 100) : 0;

function Bar({ icon: Icon, label, value, pct, tone }: { icon: typeof Users; label: string; value: string; pct: number; tone: 'users' | 'time' }) {
    return <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-2xs text-muted">
            <span className="flex items-center gap-1.5"><Icon size={13} className={tone === 'users' ? 'text-accent' : 'text-gold'}/>{label}</span>
            <span><b className="text-fg tabular-nums">{value}</b> · {pct}%</span>
        </div>
        <div className={'h-1.5 overflow-hidden rounded-full bg-line'} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone === 'users' ? 'bg-linear-90 from-brand-strong to-brand' : 'bg-linear-90 from-gold/60 to-gold')} style={{ width: `${Math.max(pct, 2)}%` }}/>
        </div>
    </div>;
}

/** Dato del módulo: sin barra, solo la cifra. */
function Figure({ icon: Icon, tone, value, label }: { icon: typeof Users; tone: 'users' | 'time'; value: string; label: string }) {
    return <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone === 'users' ? 'bg-brand/12 text-accent' : 'bg-gold/12 text-gold')}><Icon size={18}/></span>
        <div><b className="block text-2xl leading-none tabular-nums">{value}</b><span className="text-2xs text-muted">{label}</span></div>
    </div>;
}

function LessonRow({ lesson, place, module }: { lesson: Ranked; place: number; module: ModuleRow }) {
    return <li className={cn(COLUMNS, 'border-t border-line-soft py-3.5')}>
        <div className="flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 font-mono text-xs text-subtle">{place}</span>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-fg-soft">{lesson.title}</p>
                <p className="flex items-center gap-1 text-2xs text-muted"><Repeat size={11}/>{lesson.attempts} {lesson.attempts === 1 ? 'intento' : 'intentos'}</p>
            </div>
        </div>
        <Bar icon={Users} label="Usuarios" value={String(lesson.users)} pct={share(lesson.users, module.users)} tone="users"/>
        <Bar icon={Clock} label="Tiempo" value={time(lesson.seconds)} pct={share(lesson.seconds, module.seconds)} tone="time"/>
    </li>;
}

function ModuleCard({ module, place, data }: { module: ModuleRow; place: number; data: AnalyticsData }) {
    return <Card className="overflow-hidden">
        {/* Cabecera en una fila: módulo y sus datos, sin barras (en móvil, apilados). */}
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
            {module.lessons.map((lesson, index) => <LessonRow key={lesson.id} lesson={lesson} place={index + 1} module={module}/>)}
        </ul>
    </Card>;
}

export default function AnalyticsPage() {
    const hydrated = useHydrated();
    const account = useAccount();
    const admin = isAdmin(account);
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
        {error ? <Card><p className="text-sm text-muted">No se pudieron cargar los datos.</p></Card> : !data ? spinner : <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
                <Stat icon={<Users size={20}/>} value={String(data.users)} label="Usuarios registrados"/>
                <Stat icon={<Activity size={20}/>} value={String(data.active)} label="Practicaron esta semana" detail={`${share(data.active, data.users)}% del total`}/>
                <Stat icon={<Clock size={20}/>} value={time(data.seconds)} label="Tiempo practicado"/>
            </div>
            {data.modules.length === 0
                ? <Card><p className="text-sm text-muted">Nadie ha practicado esta semana.</p></Card>
                : data.modules.map((module, index) => <ModuleCard key={module.id} module={module} place={index + 1} data={data}/>)}
        </div>}
    </>;
}
