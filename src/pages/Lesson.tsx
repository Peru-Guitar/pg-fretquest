import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Bookmark } from 'lucide-react';
import { GuitarArt } from '@/components/quest/QuestUI';
import { lessonMeta } from '@/components/quest/lessonMeta';
import { DIFFICULTY } from '@/lib/points';
import { ReadStatus, TempoRecord } from '@/components/quest/LessonStatus';
import { BackLink, Badge, Card, DetailLayout, Eyebrow, IconButton, PageTitle, Tags, TipCard } from '@/components/ui';
import { courses, lessonUrl } from '@/data/questMock';

export default function LessonPage() {
    const { lessonId } = useParams();
    const course = courses.find(item => item.id === lessonId) ?? courses[0];
    const [saved, setSaved] = useState(false);
    const readings = course.lessons.filter(lesson => lesson.type === 'reading').length;
    const practices = course.lessonCount - readings;
    const mix = [readings && `${readings} ${readings === 1 ? 'lectura' : 'lecturas'}`, practices && `${practices} ${practices === 1 ? 'práctica' : 'prácticas'}`].filter(Boolean).join(' · ');

    return <>
        <BackLink to="/train">Entrenar</BackLink>
        <PageTitle eyebrow={course.category} title={course.title} text={course.description}>
            <IconButton active={saved} aria-label={saved ? 'Quitar módulo de guardados' : 'Guardar módulo'} aria-pressed={saved} onClick={() => setSaved(!saved)}><Bookmark fill={saved ? 'currentColor' : 'none'}/></IconButton>
        </PageTitle>
        <DetailLayout aside={<>
            <Card>
                <Eyebrow className="mb-3">SOBRE ESTE MÓDULO</Eyebrow>
                <div className="flex flex-col gap-4 text-sm text-[#b8c8e4]"><span>◷ {mix} · {course.duration}</span><span>✓ Dificultad {course.level.toLowerCase()}</span></div>
            </Card>
            <TipCard title="Entrena lo que necesites.">No hay un orden obligatorio. Elige la lección que quieras mejorar hoy y vuelve a ella cuando lo necesites.</TipCard>
        </>}>
            <section className="relative h-75 overflow-hidden rounded-xl border border-[#50417b] bg-[#1d223c]">
                <GuitarArt variant={course.art} layout="cover"/>
                <div className="relative z-10 h-full max-w-full bg-linear-90 from-[#172035] from-20% to-transparent p-6 xs:p-7.5 md:max-w-[70%]">
                    <Badge>CONTENIDO DUMMY · VISTA DE DEMOSTRACIÓN</Badge>
                    <h2 className="mt-6 mb-5 text-[clamp(1.75rem,3.4vw,2.6875rem)] leading-tight font-black">Tu técnica.<br/>Tu entrenamiento.</h2>
                    <span className="text-xs text-[#c4cbea]">{mix} · {course.duration} · {course.level}</span>
                </div>
            </section>
            <Card>
                <h2 className="mb-3">Qué vas a entrenar</h2>
                <p className="text-sm leading-relaxed text-muted">{course.description} Trabaja primero la limpieza y la comodidad. Aumenta la complejidad del patrón antes de perseguir velocidad.</p>
                <Tags className="mt-5" items={course.skills.map(skill => `✓ ${skill}`)}/>
            </Card>
            <div>
                <h2 className="mb-4 text-lg xl:text-xl">Lecciones del módulo</h2>
                <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">{course.lessons.map((lesson, index) => {
                    const { Icon, description } = lessonMeta(lesson);
                    return <div key={lesson.id} className="flex items-center gap-3 bg-card px-3.5 py-4 transition hover:bg-white/3 md:gap-4 md:px-5 md:py-5">
                        <Link to={lessonUrl(course.id, lesson.id)} className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                            <div className="min-w-0 flex-1">
                                <h3 className="mb-1 text-md wrap-anywhere md:text-[0.9375rem]">{lesson.title}</h3>
                                <p className="flex items-center gap-1.5 text-2xs text-muted"><Icon size={13} className={lesson.type === 'reading' ? 'text-[#8fc0ff]' : 'text-accent-strong'}/>{description}{lesson.type === 'reading' ? ` · ${lesson.minutes} min` : ` · ${DIFFICULTY[lesson.difficulty].label} · ${lesson.variants.length} ${lesson.variants[0].startsWith('Posición') ? 'posiciones' : 'variantes'}`}</p>
                            </div>
                        </Link>
                        {lesson.type === 'reading'
                            ? <ReadStatus done={index < course.completedLessons}/>
                            : <TempoRecord record={lesson.record}/>}
                    </div>;
                })}</div>
            </div>
        </DetailLayout>
    </>;
}
