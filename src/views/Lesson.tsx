'use client';

import { ROUTES, lessonUrl, moduleIdFromSlug } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { Link, useParams } from '@/lib/router';
import { lessonMeta } from '@/components/quest/lessonMeta';
import { ArtistHeader, CategoryHeader } from '@/components/quest/ArtistCredit';
import { groupByArtist } from '@/data/artists';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { ReadStatus } from '@/components/quest/LessonStatus';
import { useProgress } from '@/lib/progressDb';
import { ModuleHero } from '@/components/quest/ModuleHero';
import type { ReactNode } from 'react';
import { levelLabel } from '@/lib/account';
import { courses, type Difficulty } from '@/data/questMock';

const LEVEL_ORDER: Difficulty[] = ['base', 'intermedio', 'avanzado', 'experto'];

export default function LessonPage() {
    const lessonId = moduleIdFromSlug(useParams().modulo);
    const course = courses.find(item => item.id === lessonId) ?? courses[0];
    // Lecturas marcadas como leídas (solo con sesión).
    const progress = useProgress();
    const readings = course.lessons.filter(lesson => lesson.type === 'reading').length;
    const practices = course.lessonCount - readings;

    // Rango de dificultad de las prácticas del módulo (p. ej. «Básico – Avanzado»).
    const levels = LEVEL_ORDER.filter(level => course.lessons.some(lesson => lesson.type === 'practice' && lesson.difficulty === level));
    const range = levels.length ? [...new Set([levels[0], levels.at(-1)!])].map(levelLabel).join(' – ') : '';

    if (!course.available) return <ComingSoon title={course.title}/>;
    const hasArtists = course.lessons.some(lesson => lesson.type === 'practice' && (lesson.artist || lesson.category));

    return <>
        <ModuleHero image={course.image} back={{ to: ROUTES.exercises, label: 'Ejercicios' }} eyebrow={course.category} title={course.title} text={course.description}
            stats={([practices > 0 && ['Prácticas', practices], readings > 0 && ['Lecturas', readings], range && ['Dificultad', range]].filter(Boolean) as [string, ReactNode][])}/>
        <h2 className="mb-4 text-lg xl:text-xl">Lecciones del módulo</h2>
        <div className="flex flex-col gap-6">
            <div>
                {/* Si hay ejercicios de artistas o con categoría, se agrupan con su cabecera; si no, una sola lista. */}
                <div className="flex flex-col gap-6">{groupByArtist(course.lessons.map(lesson => ({ ...lesson, artist: lesson.type === 'practice' ? lesson.artist : undefined, category: lesson.type === 'practice' ? lesson.category : undefined }))).map(group => <section key={`${group.artist}-${group.category}`} className="flex flex-col gap-3">
                    {group.artist ? <ArtistHeader id={group.artist}/> : group.category ? <CategoryHeader title={group.category}/> : hasArtists && <b className="text-fg">De la comunidad</b>}
                <div className="grid gap-3 md:grid-cols-2">{group.lessons.map(item => {
                    const lesson = course.lessons.find(candidate => candidate.id === item.id)!;
                    const { Icon, description } = lessonMeta(lesson);
                    return <Link key={lesson.id} to={lessonUrl(course.id, lesson.id)} className="flex items-center gap-3 rounded-lg border border-line bg-card px-3.5 py-4 transition hover:-translate-y-0.5 hover:border-accent/50 md:gap-4 md:px-5 md:py-5">
                        <span className="w-7 shrink-0 font-mono text-sm text-accent md:w-8 md:text-base">{String(course.lessons.indexOf(lesson) + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-1 flex flex-wrap items-center gap-2 text-md wrap-anywhere md:text-[0.9375rem]">{lesson.title}</h3>
                            <p className="flex items-center gap-1.5 text-2xs font-bold text-muted"><Icon size={13} className={lesson.type === 'reading' ? 'text-[#8fc0ff]' : 'text-accent-strong'}/>{description}</p>
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-soft">{lesson.type === 'practice' ? lesson.description : lesson.summary}</p>
                        </div>
                        {lesson.type === 'practice' && <DifficultySignal difficulty={lesson.difficulty}/>}
                        {lesson.type === 'reading' && progress.uid && <ReadStatus done={!!progress.readings[lesson.id]}/>}
                    </Link>;
                })}</div>
                </section>)}</div>
            </div>
        </div>
    </>;
}
