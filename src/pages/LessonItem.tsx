import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BackLink, Card, PageTitle } from '@/components/ui';
import { courses, lessonUrl } from '@/data/questMock';
import { ReadToggle } from '@/components/quest/LessonStatus';

/** Ruta única de lección: las de lectura se muestran aquí; las de práctica abren la sala de práctica. */
export default function LessonItemPage() {
    const { moduleId, lessonId } = useParams();
    const [done, setDone] = useState(false);
    const course = courses.find(item => item.id === moduleId);
    const index = course?.lessons.findIndex(item => item.id === lessonId) ?? -1;
    if (!course || index < 0) return <Navigate to="/train" replace/>;
    const lesson = course.lessons[index];
    if (lesson.type === 'practice') return <Navigate to={`/practice/${course.id}?exercise=${lesson.id}`} replace/>;
    const prev = course.lessons[index - 1];
    const next = course.lessons[index + 1];

    return <>
        <BackLink to={`/modules/${course.id}`}>{course.title}</BackLink>
        <PageTitle eyebrow={`${course.category} · LECTURA`} title={lesson.title} text={lesson.summary}/>
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
            <span className="text-sm text-muted">{done ? '¡Bien! Lectura completada.' : '¿Terminaste de leer?'}</span>
            <ReadToggle size="lg" done={done} onToggle={() => setDone(!done)}/>
        </div>
        <nav className="mt-6 flex justify-between gap-4 text-sm" aria-label="Lecciones del módulo">
            {prev ? <Link to={lessonUrl(course.id, prev.id)} className="flex items-center gap-2 text-muted hover:text-fg"><ArrowLeft size={16}/>{prev.title}</Link> : <span/>}
            {next ? <Link to={lessonUrl(course.id, next.id)} className="flex items-center gap-2 text-right text-accent">{next.title}<ArrowRight size={16}/></Link>
                : <Link to={`/modules/${course.id}`} className="flex items-center gap-2 text-accent">Volver al módulo<ArrowRight size={16}/></Link>}
        </nav>
    </>;
}
