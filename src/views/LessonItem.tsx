'use client';

import { lessonTabHash } from '@/data/artists';
import { ROUTES, lessonIdFromSlug, moduleIdFromSlug, moduleUrl } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { Navigate, useParams } from '@/lib/router';
import { CheckCircle2 } from 'lucide-react';
import { useAccount } from '@/lib/account';
import { setReadingDone, useProgress } from '@/lib/progressDb';
import { timeAgo } from '@/lib/timeAgo';
import { Button, Card } from '@/components/ui';
import { ModuleHero } from '@/components/quest/ModuleHero';
import PracticePage, { LessonPager, type Mode } from '@/views/Practice';
import { courses, } from '@/data/questMock';
import { PeopleThisWeek } from '@/components/quest/QuestUI';
import { useCommunity } from '@/lib/community';

/** Página de lección: las de lectura se muestran aquí; las de práctica, su Objetivo (o la sala, con `view="practice"`). */
export default function LessonItemPage({ view = 'goal' }: { view?: Mode }) {
    const { modulo, leccion } = useParams();
    const moduleId = moduleIdFromSlug(modulo);
    const lessonId = lessonIdFromSlug(moduleId, leccion);
    const account = useAccount();
    const progress = useProgress();
    // Quiénes la leyeron esta semana (datos y caché de Comunidad).
    const { data: community } = useCommunity(account !== null);
    const course = courses.find(item => item.id === moduleId);
    const index = course?.lessons.findIndex(item => item.id === lessonId) ?? -1;
    if (!course || index < 0) return <Navigate to={ROUTES.exercises} replace/>;
    if (!course.available) return <ComingSoon title={course.title}/>;
    const lesson = course.lessons[index];
    // Ejercicio: Objetivo en la página de la lección; tablatura y metrónomo en `…/ejercicio`.
    if (lesson.type === 'practice') return <PracticePage mode={view}/>;
    const readAt = progress.readings[lesson.id]?.readAt?.toMillis();

    return <>
        <ModuleHero image={course.image} back={{ to: moduleUrl(course.id) + lessonTabHash(course.lessons, lesson.id), label: course.title }} eyebrow="Lectura" title={lesson.title} text={lesson.summary}
            stats={[['Lección', `${index + 1} de ${course.lessons.length}`], ['Puntos', lesson.points.length]]}/>
        <Card as="section" className="md:px-10 md:py-9 xl:px-12">
            <article className="flex flex-col gap-8">
                {lesson.points.map((point, number) => <section key={point.title} className="flex gap-4">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-violet/30 bg-violet/10 font-mono text-sm text-accent-strong">{number + 1}</span>
                    <div>
                        <h2 className="mb-2 text-lg md:text-xl">{point.title}</h2>
                        <p className="text-base leading-[1.8] text-fg-soft md:text-[1.0625rem]">{point.text}</p>
                    </div>
                </section>)}
                {lesson.note && <p className="ml-11 border-l-2 border-violet pl-4 text-base leading-relaxed text-fg-soft"><b className="text-accent-strong">Criterio · </b>{lesson.note}</p>}
            </article>
        </Card>
        {/* Marcar como leída (solo con sesión): se guarda en users/{uid}/readings/{lessonId}. */}
        {account && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-5 py-4">
            {readAt
                ? <p className="flex items-center gap-2 text-sm text-success"><CheckCircle2 size={18}/>Leída {timeAgo(readAt)}</p>
                : <p className="text-sm text-muted">¿Terminaste de leer? Márcala para llevar tu registro.</p>}
            {readAt
                ? <button type="button" onClick={() => void setReadingDone(lesson.id, false, account.name)} className="text-xs text-muted hover:text-fg">Marcar como no leída</button>
                : <Button onClick={() => void setReadingDone(lesson.id, true, account.name)}><CheckCircle2 size={17}/>Marcar como leída</Button>}
        </div>}
        <div className="mt-6"><PeopleThisWeek title="Leída esta semana por" people={community?.byLesson[lesson.id] ?? []}/></div>
        <LessonPager moduleId={course.id} moduleTitle={course.title} lessons={course.lessons} current={lesson} mode="goal"/>
    </>;
}
