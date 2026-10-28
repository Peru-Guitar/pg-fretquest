'use client';

import { ROUTES, lessonUrl, moduleIdFromSlug } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { Link, useParams } from '@/lib/router';
import { lessonMeta } from '@/components/quest/lessonMeta';
import { ArtistHeader, CategoryHeader } from '@/components/quest/ArtistCredit';
import { moduleGroups } from '@/data/artists';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { ReadStatus } from '@/components/quest/LessonStatus';
import { useProgress } from '@/lib/progressDb';
import { ModuleHero } from '@/components/quest/ModuleHero';
import { useSyncExternalStore, type ReactNode } from 'react';
import { createLocalStore } from '@/lib/localStore';
import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';
import { levelLabel } from '@/lib/account';
import { courses, type Difficulty } from '@/data/questMock';
import { Practicing } from '@/components/quest/QuestUI';
import { useAccount } from '@/lib/account';
import { useCommunity } from '@/lib/community';

/** Última pestaña abierta en cada módulo (id del módulo → índice del grupo). */
const moduleTabs = createLocalStore<Record<string, number>>('fq-module-tabs', {});

/** Hash de la URL (sin «#»), para abrir y compartir una pestaña concreta. */
const subscribeHash = (listener: () => void) => { window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); };
const useHash = () => useSyncExternalStore(subscribeHash, () => decodeURIComponent(window.location.hash.slice(1)), () => '');

const LEVEL_ORDER: Difficulty[] = ['base', 'intermedio', 'avanzado', 'experto'];

export default function LessonPage() {
    const lessonId = moduleIdFromSlug(useParams().modulo);
    const course = courses.find(item => item.id === lessonId) ?? courses[0];
    // Lecturas marcadas como leídas (solo con sesión).
    const progress = useProgress();
    // Quiénes practicaron cada lección esta semana (datos y caché de Comunidad).
    const account = useAccount();
    const { data: community } = useCommunity(account !== null);
    const readings = course.lessons.filter(lesson => lesson.type === 'reading').length;
    const practices = course.lessonCount - readings;

    // Rango de dificultad de las prácticas del módulo (p. ej. «Básico – Avanzado»).
    const levels = LEVEL_ORDER.filter(level => course.lessons.some(lesson => lesson.type === 'practice' && lesson.difficulty === level));
    const range = levels.length ? [...new Set([levels[0], levels.at(-1)!])].map(levelLabel).join(' – ') : '';

    const hasArtists = course.lessons.some(lesson => lesson.type === 'practice' && (lesson.artist || lesson.category));
    // Con varios grupos, una pestaña por grupo; se recuerda la última abierta en cada módulo.
    // El hash de la URL manda (enlace compartido); si no hay, la última pestaña abierta.
    const { groups, labels, slugs, tabbed } = moduleGroups(course.lessons);
    const hash = useHash();
    const tabs = moduleTabs.use();
    const fromHash = slugs.indexOf(hash);
    const current = fromHash >= 0 ? fromHash : Math.min(tabs[course.id] ?? 0, groups.length - 1);
    const pickTab = (index: number) => {
        moduleTabs.set({ ...moduleTabs.get(), [course.id]: index });
        history.replaceState(history.state, '', `#${slugs[index]}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    };

    if (!course.available) return <ComingSoon title={course.title}/>;

    return <>
        <ModuleHero image={course.image} back={{ to: ROUTES.exercises, label: 'Ejercicios' }} title={course.title} text={course.description}
            stats={([practices > 0 && ['Prácticas', practices], readings > 0 && ['Lecturas', readings], range && ['Dificultad', range]].filter(Boolean) as [string, ReactNode][])}/>
        <h2 className="mb-4 text-lg xl:text-xl">Lecciones del módulo</h2>
        {/* En celular, un selector nativo; desde md, pestañas subrayadas. */}
        {tabbed && <label className="relative mb-6 block md:hidden">
            <span className="sr-only">Grupo de lecciones</span>
            <select value={current} onChange={event => pickTab(Number(event.target.value))} className="w-full appearance-none rounded-lg border border-line bg-card py-3 pr-10 pl-4 text-sm font-bold text-accent-strong focus:border-violet focus:outline-none">
                {groups.map((group, index) => <option key={slugs[index]} value={index}>{labels[index]} · {group.lessons.length}</option>)}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"/>
        </label>}
        {tabbed && <div role="tablist" aria-label="Grupos de lecciones" className="mb-6 hidden flex-wrap border-b border-line md:flex">
            {groups.map((group, index) => <button key={slugs[index]} type="button" role="tab" aria-selected={index === current} onClick={() => pickTab(index)} className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition',
                index === current ? 'border-violet text-accent-strong' : 'border-transparent text-muted hover:text-fg',
            )}>{labels[index]}<span className="font-mono text-2xs opacity-70">{group.lessons.length}</span></button>)}
        </div>}
        <div className="flex flex-col gap-6">
            <div>
                {/* Si hay ejercicios de artistas o con categoría, se agrupan con su cabecera; si no, una sola lista. */}
                <div className="flex flex-col gap-6">{(tabbed ? [groups[current]] : groups).map(group => <section key={`${group.artist}-${group.category}`} className="flex flex-col gap-3">
                    {group.artist ? <ArtistHeader id={group.artist}/> : tabbed ? null : group.category ? <CategoryHeader title={group.category}/> : hasArtists && <b className="text-fg">De la comunidad</b>}
                <div className="grid gap-3 md:grid-cols-2">{group.lessons.map(item => {
                    const lesson = course.lessons.find(candidate => candidate.id === item.id)!;
                    const { Icon, description } = lessonMeta(lesson);
                    const practicing = community?.byLesson[lesson.id] ?? [];
                    return <Link key={lesson.id} to={lessonUrl(course.id, lesson.id)} className="flex items-center gap-3 rounded-lg border border-line bg-card px-3.5 py-4 transition hover:-translate-y-0.5 hover:border-accent/50 md:gap-4 md:px-5 md:py-5">
                        <span className="w-7 shrink-0 font-mono text-sm text-accent md:w-8 md:text-base">{String(course.lessons.indexOf(lesson) + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-1 flex flex-wrap items-center gap-2 text-md wrap-anywhere md:text-[0.9375rem]">{lesson.title}</h3>
                            <p className="flex items-center gap-1.5 text-2xs font-bold text-muted"><Icon size={13} className={lesson.type === 'reading' ? 'text-[#8fc0ff]' : 'text-accent-strong'}/>{description}</p>
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-soft">{lesson.type === 'practice' ? lesson.description : lesson.summary}</p>
                        </div>
                        {/* Quiénes la hicieron esta semana: a la derecha, para que la tarjeta no crezca. */}
                        {practicing.length > 0 && <div className="shrink-0"><Practicing people={practicing} max={3}/></div>}
                        {lesson.type === 'practice' && <DifficultySignal difficulty={lesson.difficulty}/>}
                        {lesson.type === 'reading' && progress.uid && <ReadStatus done={!!progress.readings[lesson.id]}/>}
                    </Link>;
                })}</div>
                </section>)}</div>
            </div>
        </div>
    </>;
}
