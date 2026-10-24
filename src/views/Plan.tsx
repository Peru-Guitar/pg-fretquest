'use client';

import { ROUTES, lessonUrl, practiceUrl } from '@/lib/routes';
import { Link, Navigate } from '@/lib/router';
import { BookOpen, CalendarDays, Check, Clock, Compass, Flame, ListOrdered, RotateCcw, Sparkles } from 'lucide-react';
import { Card, PageTitle } from '@/components/ui';
import { courses, } from '@/data/questMock';
import { ArtistHeader } from '@/components/quest/ArtistCredit';
import { groupByArtist } from '@/data/artists';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { DEFAULT_RHYTHM, DEFAULT_SESSION_MINUTES, levelLabel, nextLevel, planFor, suggestion, useAccount } from '@/lib/account';
import { fullDateTime, timeAgo } from '@/lib/timeAgo';
import { completedDaysThisWeek, todayOf, useProgress } from '@/lib/progressDb';
import { cn } from '@/lib/cn';

const now = () => Date.now();

/** Tiempo legible: segundos, minutos u horas. */
const duration = (seconds: number) => seconds < 60 ? `${seconds} s` : seconds < 3600 ? `${Math.round(seconds / 60)} min` : `${(seconds / 3600).toFixed(1)} h`;

/**
 * Chips del registro: tiempo de esta semana (solo si la practicaste), veces (naranja) y última práctica
 * en formato humano, coloreada por lo reciente que es.
 */
function StatChips({ stats, weekSeconds }: { stats: { count: number; last: number }; weekSeconds: number }) {
    if (stats.count === 0) return <span className="rounded-full border border-dashed border-line-strong px-3 py-1 text-2xs font-bold text-muted">Sin practicar</span>;
    const hours = (now() - stats.last) / 3_600_000;
    const recency = hours <= 48 ? 'border-success/40 bg-success/12 text-success' : hours <= 96 ? 'border-gold/40 bg-gold/12 text-gold' : 'border-line-strong bg-white/4 text-muted';
    return <>
        {weekSeconds > 0 && <span title="Tiempo practicado esta semana" className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/12 px-3 py-1 text-2xs font-bold text-gold"><Clock size={13}/>{duration(weekSeconds)} esta semana</span>}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-2xs font-bold text-accent"><Flame size={13} className="fill-current"/>{stats.count} {stats.count === 1 ? 'vez' : 'veces'}</span>
        <time dateTime={new Date(stats.last).toISOString()} title={fullDateTime(stats.last)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-2xs font-bold first-letter:uppercase', recency)}><CalendarDays size={13}/>{timeAgo(stats.last)}</time>
    </>;
}


/** Mi plan: los módulos del nivel elegido, en orden, como guía. Cambiar de nivel es libre. */
export default function PlanPage() {
    const account = useAccount();
    const progress = useProgress();
    if (!account) return <Navigate to={ROUTES.login} replace/>;
    if (!account.level) return <Navigate to={ROUTES.login} replace/>;
    const level = account.level;
    const blocks = planFor(level);
    const recommendations = courses.find(course => course.id === 'recommendations' && course.available);
    const today = suggestion(account);
    const upgrade = nextLevel(level);
    const goal = account.weeklyGoal ?? DEFAULT_RHYTHM;
    const sessionMinutes = account.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
    // Progreso real (Firestore): minutos de hoy, días completados esta semana y resumen por lección.
    const todayMinutes = Math.floor((todayOf(progress)?.seconds ?? 0) / 60);
    const practiced = completedDaysThisWeek(progress);
    // Tiempo por lección esta semana (chip del registro).
    const weekSeconds: Record<string, number> = {};
    for (const day of Object.values(progress.days)) for (const [lessonId, lesson] of Object.entries(day.lessons ?? {})) weekSeconds[lessonId] = (weekSeconds[lessonId] ?? 0) + (lesson.seconds ?? 0);
    const statsOf = (lessonId: string) => { const summary = progress.lessons[lessonId]; return summary ? { count: summary.days, last: summary.lastAt.toMillis() } : { count: 0, last: 0 }; };
    const planStats = blocks.flatMap(block => block.lessons).map(lesson => statsOf(lesson.id));
    const totals = {
        count: planStats.reduce((sum, stats) => sum + stats.count, 0),
        last: Math.max(0, ...planStats.map(stats => stats.last)),
        practiced: planStats.filter(stats => stats.count > 0).length,
        lessons: planStats.length,
    };

    return <>
        <PageTitle eyebrow="MI PLAN" title={`Plan ${levelLabel(level)}`} text="Una guía de lo que te conviene practicar según tu nivel. Tu nivel lo cambias en Mi cuenta.">
            <Link to={ROUTES.guide} className="text-sm font-bold text-accent hover:underline">¿Cómo funciona? →</Link>
        </PageTitle>

        {/* Cómo usar el plan: es una guía, no una malla curricular. */}
        <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
            { icon: Compass, title: 'Es una guía', text: 'No es una malla curricular: nada se bloquea ni se aprueba.' },
            { icon: ListOrdered, title: 'Mejor en orden', text: 'Te recomendamos seguir las lecciones en el orden del plan.' },
            { icon: RotateCcw, title: 'Repite si lo necesitas', text: 'Vuelve a lecciones previas cuando sientas que te falta refuerzo.' },
            { icon: Sparkles, title: 'Todo suma', text: 'Cualquier lección que practiques suma a tu progreso.' },
        ].map(({ icon: Icon, title, text }) => <li key={title} className="flex gap-3 rounded-xl border border-line bg-card p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-accent-strong"><Icon size={18}/></span>
            <span><b className="block text-sm text-fg">{title}</b><span className="text-xs leading-relaxed text-muted">{text}</span></span>
        </li>)}</ul>

        {/* Práctica de hoy: minutos que faltan para completar el tiempo diario. DATOS FIJOS por ahora (todayMinutes).
            Con el ritmo de la semana ya cumplido, desaparece: lo que practiques de más suma igual. */}
        {practiced < goal && <section className="mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">{todayMinutes >= sessionMinutes
                    ? <>¡Completaste tu progreso de hoy! <span className="text-success">✓</span></>
                    : <>Te faltan <span className="font-mono text-accent">{sessionMinutes - todayMinutes} min</span> para completar tu progreso de hoy</>}</h2>
                <span className="font-mono text-sm text-muted">{Math.min(todayMinutes, sessionMinutes)}/{sessionMinutes} min</span>
            </div>
            <span className="mt-2.5 block h-2.5 overflow-hidden rounded-full bg-white/8"><span className={cn('block h-full rounded-full transition-[width]', todayMinutes >= sessionMinutes ? 'bg-success' : 'bg-linear-90 from-brand to-gold')} style={{ width: `${Math.min(100, todayMinutes / sessionMinutes * 100)}%` }}/></span>
        </section>}



        {/* Resumen del plan: cifras grandes separadas por divisores. */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-brand/30 bg-linear-120 from-brand/15 via-card to-card">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-10 size-72 rounded-full bg-brand/15 blur-3xl"/>
            <dl className="relative grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
                {[
                    { label: 'Tu semana', value: `${Math.min(practiced, goal)}/${goal}`, unit: 'días', tone: practiced >= goal ? 'text-success' : 'text-fg', bar: Math.min(1, practiced / goal) },
                    { label: 'Prácticas', value: String(totals.count), unit: totals.count === 1 ? 'vez' : 'veces', tone: 'text-accent' },
                    { label: 'Última práctica', value: totals.last ? timeAgo(totals.last) : '—', unit: '', tone: 'text-fg' },
                    { label: 'Lecciones', value: `${totals.practiced}/${totals.lessons}`, unit: 'practicadas', tone: 'text-fg' },
                ].map(item => <div key={item.label} className="px-5 py-5 md:px-7 md:py-6">
                    <dt className="text-3xs font-black tracking-[0.18em] text-muted uppercase">{item.label}</dt>
                    <dd className="mt-2 flex items-baseline gap-2"><b className={cn('font-mono text-3xl md:text-4xl', item.tone)}>{item.value}</b><span className="text-sm text-muted">{item.unit}</span></dd>
                    {item.bar !== undefined && <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/8"><span className={cn('block h-full rounded-full', item.bar >= 1 ? 'bg-success' : 'bg-linear-90 from-brand to-gold')} style={{ width: `${item.bar * 100}%` }}/></span>}
                </div>)}
            </dl>
            <p className="relative border-t border-line px-5 py-3 text-xs text-muted md:px-7">{practiced >= goal ? '¡Cumpliste tu ritmo esta semana! Lo que practiques de más, suma igual.' : `Te ${goal - practiced === 1 ? 'falta 1 día' : `faltan ${goal - practiced} días`} para cumplir tu ritmo. Recomendado: al menos media hora cada día.`} <Link to={ROUTES.account} className="text-accent hover:underline">Cambiar ritmo</Link></p>
        </section>

        {today?.finished && upgrade && <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-brand/40">
            <div>
                <h2 className="text-lg">¡Recorriste todo tu plan!</h2>
                <p className="mt-1 text-sm text-muted">¿Te sientes listo para {levelLabel(upgrade)}? Tú decides.</p>
            </div>
            <div className="flex gap-2">
                <Link to={ROUTES.account} className="grid min-h-10 place-items-center rounded-md bg-brand px-4 text-sm font-bold text-white">Cambiar mi nivel</Link>
                <span className="grid min-h-10 place-items-center px-3 text-sm text-muted">o sigue repasando</span>
            </div>
        </Card>}

        {/* Recomendaciones: lecturas para todos los niveles, siempre el primer módulo del plan. */}
        {recommendations && <Card className="mb-5">
            <p className="text-3xs font-black tracking-[0.18em] text-accent-strong">MÓDULO 1</p>
            <h2 className="mt-1.5 mb-4 flex flex-wrap items-baseline justify-between gap-2 text-lg">{recommendations.title}<span className="font-mono text-sm font-normal text-muted">{recommendations.lessons.filter(lesson => progress.readings[lesson.id]).length}/{recommendations.lessons.length} leídas</span></h2>
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">{recommendations.lessons.map(lesson => <Link key={lesson.id} to={lessonUrl(recommendations.id, lesson.id)} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/3">
                {/* Las lecturas sí se completan: check verde al marcarlas como leídas. */}
                {progress.readings[lesson.id]
                    ? <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-canvas"><Check size={15} strokeWidth={3}/></span>
                    : <span className="grid size-7 shrink-0 place-items-center rounded-full border border-blue/40 text-[#8fc0ff]"><BookOpen size={13}/></span>}
                <p className={cn('min-w-0 flex-1 font-bold', progress.readings[lesson.id] && 'text-fg-soft')}>{lesson.title}</p>
                {progress.readings[lesson.id]
                    ? <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/12 px-3 py-1 text-2xs font-bold text-success"><Check size={13}/>Leída {timeAgo(progress.readings[lesson.id].readAt.toMillis())}</span>
                    : <span className="rounded-full border border-dashed border-line-strong px-3 py-1 text-2xs font-bold text-muted">Sin leer</span>}
            </Link>)}</div>
        </Card>}

        {blocks.length === 0 ? <Card><p className="text-sm text-muted">Todavía no hay ejercicios de nivel {levelLabel(level)}. Mientras tanto, practica libre en Ejercicios.</p></Card>
        : <ol className="flex flex-col gap-5">{blocks.map((block, blockIndex) => <li key={block.moduleId}>
            <Card>
                <p className="text-3xs font-black tracking-[0.18em] text-accent-strong">MÓDULO {blockIndex + (recommendations ? 2 : 1)}</p>
                <h2 className="mt-1.5 mb-4 text-lg">{block.title}</h2>
                <div className="flex flex-col gap-5">{groupByArtist(block.lessons).map(group => <div key={group.artist ?? 'none'} className="flex flex-col gap-3">
                {group.artist ? <ArtistHeader id={group.artist}/> : block.lessons.some(lesson => lesson.artist) && <b className="text-sm text-fg">De la comunidad</b>}
                <div className="divide-y divide-line rounded-lg border border-line">{group.lessons.map(lesson => {
                    const stats = statsOf(lesson.id);
                    return <Link key={lesson.id} to={practiceUrl(block.moduleId, lesson.id)} className="flex items-center gap-3 px-4 py-3.5 transition first:rounded-t-lg last:rounded-b-lg hover:bg-white/3">
                        {/* Actividad, no «terminada»: punto naranja si ya la practicaste alguna vez. */}
                        <span title={stats.count > 0 ? 'Con actividad' : 'Sin actividad'} className={cn('grid size-7 shrink-0 place-items-center rounded-full border', stats.count > 0 ? 'border-brand/50' : 'border-line-strong')}>
                            {stats.count > 0 && <span className="size-2.5 rounded-full bg-brand shadow-[0_0_8px_#e0662f]"/>}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 font-bold">{lesson.title}</p>
                            <span className="mt-2 flex flex-wrap gap-1.5 sm:hidden"><StatChips stats={stats} weekSeconds={weekSeconds[lesson.id] ?? 0}/></span>
                        </div>
                        {/* Registro de esta lección: veces practicada (una por día) y última fecha, en chips. */}
                        <span className="hidden shrink-0 items-center gap-2 sm:flex"><StatChips stats={stats} weekSeconds={weekSeconds[lesson.id] ?? 0}/></span>
                        <DifficultySignal difficulty={lesson.difficulty}/>
                    </Link>;
                })}</div>
                </div>)}</div>
            </Card>
        </li>)}</ol>}


    </>;
}
