import { ComingSoon } from '@/components/quest/ComingSoon';
import { Link, useParams } from 'react-router';
import { GuitarArt } from '@/components/quest/QuestUI';
import { lessonMeta } from '@/components/quest/lessonMeta';
import { DIFFICULTY } from '@/lib/points';
import { cn } from '@/lib/cn';
import { BackLink, Badge, Card, DetailLayout, Eyebrow, PageTitle, Tags, TipCard } from '@/components/ui';
import { courses, lessonUrl, type Difficulty } from '@/data/questMock';

const DIFFICULTY_TONE: Record<Difficulty, string> = {
    base: 'border-success/40 text-success',
    intermedio: 'border-gold/40 text-gold',
    avanzado: 'border-red-400/40 text-red-400',
};

export default function LessonPage() {
    const { lessonId } = useParams();
    const course = courses.find(item => item.id === lessonId) ?? courses[0];
    const readings = course.lessons.filter(lesson => lesson.type === 'reading').length;
    const practices = course.lessonCount - readings;
    const mix = [readings && `${readings} ${readings === 1 ? 'lectura' : 'lecturas'}`, practices && `${practices} ${practices === 1 ? 'práctica' : 'prácticas'}`].filter(Boolean).join(' · ');

    if (!course.available) return <ComingSoon title={course.title}/>;

    return <>
        <BackLink to="/train">Entrenar</BackLink>
        <PageTitle eyebrow={course.category} title={course.title} text={course.description}/>
        <DetailLayout aside={<>
            <Card>
                <Eyebrow className="mb-3">SOBRE ESTE MÓDULO</Eyebrow>
                <div className="flex flex-col gap-4 text-sm text-fg-soft"><span>◷ {mix} · {course.duration}</span></div>
            </Card>
            <TipCard title="Entrena lo que necesites.">No hay un orden obligatorio. Elige la lección que quieras mejorar hoy y vuelve a ella cuando lo necesites.</TipCard>
        </>}>
            <section className="relative h-75 overflow-hidden rounded-xl border border-line-strong bg-surface">
                <GuitarArt variant={course.art} layout="cover"/>
                <div className="relative z-10 h-full max-w-full bg-linear-90 from-canvas from-20% to-transparent p-6 xs:p-7.5 md:max-w-[70%]">
                    <Badge>CONTENIDO DUMMY · VISTA DE DEMOSTRACIÓN</Badge>
                    <h2 className="mt-6 mb-5 text-[clamp(1.75rem,3.4vw,2.6875rem)] leading-tight font-black">Tu técnica.<br/>Tu entrenamiento.</h2>
                    <span className="text-xs text-fg-soft">{mix} · {course.duration}</span>
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
                    return <Link key={lesson.id} to={lessonUrl(course.id, lesson.id)} className="flex items-center gap-3 bg-card px-3.5 py-4 transition hover:bg-white/3 md:gap-4 md:px-5 md:py-5">
                        <span className="w-7 shrink-0 font-mono text-sm text-accent md:w-8 md:text-base">{String(index + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-1 text-md wrap-anywhere md:text-[0.9375rem]">{lesson.title}</h3>
                            <p className="flex items-center gap-1.5 text-2xs text-muted"><Icon size={13} className={lesson.type === 'reading' ? 'text-[#8fc0ff]' : 'text-accent-strong'}/>{description}{lesson.type === 'reading' ? ` · ${lesson.minutes} min` : ` · ${lesson.variants.length} ${lesson.variants[0].startsWith('Posición') ? 'posiciones' : 'variantes'}`}</p>
                        </div>
                        {lesson.type === 'practice' && <span className={cn('shrink-0 rounded border px-2 py-0.5 text-2xs font-bold', DIFFICULTY_TONE[lesson.difficulty])}>{DIFFICULTY[lesson.difficulty].label}</span>}
                    </Link>;
                })}</div>
            </div>
        </DetailLayout>
    </>;
}
