import { ComingSoon } from '@/components/quest/ComingSoon';
import { Link, useParams } from 'react-router';
import { GuitarArt } from '@/components/quest/QuestUI';
import { lessonMeta } from '@/components/quest/lessonMeta';
import { ArtistHeader } from '@/components/quest/ArtistCredit';
import { groupByArtist } from '@/data/artists';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { BackLink, Badge, Card, DetailLayout, Eyebrow, PageTitle, Tags, TipCard } from '@/components/ui';
import { courses, lessonUrl } from '@/data/questMock';

export default function LessonPage() {
    const { lessonId } = useParams();
    const course = courses.find(item => item.id === lessonId) ?? courses[0];
    const readings = course.lessons.filter(lesson => lesson.type === 'reading').length;
    const practices = course.lessonCount - readings;
    const mix = [readings && `${readings} ${readings === 1 ? 'lectura' : 'lecturas'}`, practices && `${practices} ${practices === 1 ? 'práctica' : 'prácticas'}`].filter(Boolean).join(' · ');

    if (!course.available) return <ComingSoon title={course.title}/>;
    const hasArtists = course.lessons.some(lesson => lesson.type === 'practice' && lesson.artist);

    return <>
        <BackLink to="/train">Ejercicios</BackLink>
        <PageTitle eyebrow={course.category} title={course.title} text={course.description}/>
        <DetailLayout aside={<>
            <Card>
                <Eyebrow className="mb-3">SOBRE ESTE MÓDULO</Eyebrow>
                <div className="flex flex-col gap-4 text-sm text-fg-soft"><span>◷ {mix}</span></div>
            </Card>
            <TipCard title="Entrena lo que necesites.">No hay un orden obligatorio. Elige la lección que quieras mejorar hoy y vuelve a ella cuando lo necesites.</TipCard>
        </>}>
            <section className="relative h-75 overflow-hidden rounded-xl border border-line-strong bg-surface">
                <GuitarArt variant={course.art} layout="cover"/>
                <div className="relative z-10 h-full max-w-full bg-linear-90 from-canvas from-20% to-transparent p-6 xs:p-7.5 md:max-w-[70%]">
                    <Badge>CONTENIDO DUMMY · VISTA DE DEMOSTRACIÓN</Badge>
                    <h2 className="mt-6 mb-5 text-[clamp(1.75rem,3.4vw,2.6875rem)] leading-tight font-black">Tu técnica.<br/>Tu entrenamiento.</h2>
                    <span className="text-xs text-fg-soft">{mix}</span>
                </div>
            </section>
            <Card>
                <h2 className="mb-3">Qué vas a entrenar</h2>
                <p className="text-sm leading-relaxed text-muted">{course.description} Trabaja primero la limpieza y la comodidad. Aumenta la complejidad del patrón antes de perseguir velocidad.</p>
                <Tags className="mt-5" items={course.skills.map(skill => `✓ ${skill}`)}/>
            </Card>
            <div>
                <h2 className="mb-4 text-lg xl:text-xl">Lecciones del módulo</h2>
                {/* Si hay ejercicios de artistas, se agrupan por artista con su cabecera; si no, una sola lista. */}
                <div className="flex flex-col gap-6">{groupByArtist(course.lessons.map(lesson => ({ ...lesson, artist: lesson.type === 'practice' ? lesson.artist : undefined }))).map(group => <section key={group.artist ?? 'none'} className="flex flex-col gap-3">
                    {group.artist ? <ArtistHeader id={group.artist}/> : hasArtists && <b className="text-fg">De la comunidad</b>}
                <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">{group.lessons.map(item => {
                    const lesson = course.lessons.find(candidate => candidate.id === item.id)!;
                    const { Icon, description } = lessonMeta(lesson);
                    return <Link key={lesson.id} to={lessonUrl(course.id, lesson.id)} className="flex items-center gap-3 bg-card px-3.5 py-4 transition hover:bg-white/3 md:gap-4 md:px-5 md:py-5">
                        <span className="w-7 shrink-0 font-mono text-sm text-accent md:w-8 md:text-base">{String(course.lessons.indexOf(lesson) + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-1 flex flex-wrap items-center gap-2 text-md wrap-anywhere md:text-[0.9375rem]">{lesson.title}</h3>
                            <p className="flex items-center gap-1.5 text-2xs font-bold text-muted"><Icon size={13} className={lesson.type === 'reading' ? 'text-[#8fc0ff]' : 'text-accent-strong'}/>{description}</p>
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-soft">{lesson.type === 'practice' ? lesson.description : lesson.summary}</p>
                        </div>
                        {lesson.type === 'practice' && <DifficultySignal difficulty={lesson.difficulty}/>}
                    </Link>;
                })}</div>
                </section>)}</div>
            </div>
        </DetailLayout>
    </>;
}
