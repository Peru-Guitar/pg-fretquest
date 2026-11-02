import { moduleUrl } from '@/lib/routes';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { courses } from '@/data/questMock';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui';
import { initials, toneOf } from '@/lib/avatar';

/** Caras superpuestas de quienes practicaron el módulo o la lección esta semana (hasta `max`; el resto, «+N»). */
export function Practicing({ people, max = 5 }: { people: { uid: string; name: string }[]; max?: number }) {
    const rest = people.length - max;
    return <div className="flex -space-x-2" aria-label={`${people.length} practicando esta semana`}>
        {people.slice(0, max).map(person => <span key={person.uid} title={person.name} className={cn('grid size-8 place-items-center rounded-[22%] text-3xs font-black text-white ring-2 ring-raised', toneOf(person.uid))}>{initials(person.name)}</span>)}
        {rest > 0 && <span className="grid h-8 min-w-8 place-items-center rounded-[22%] bg-raised px-1.5 text-3xs font-black text-fg-soft ring-2 ring-raised">+{rest}</span>}
    </div>;
}

/** Fila con todas las personas de la semana en una lección: iniciales y primer nombre. Sin nadie, no se muestra. */
export function PeopleThisWeek({ title, people }: { title: string; people: { uid: string; name: string }[] }) {
    if (!people.length) return null;
    return <Card>
        <h2 className="mb-4 text-md">{title} <span className="font-normal text-muted">· {people.length}</span></h2>
        <ul className="flex flex-wrap gap-2">{people.map(person => <li key={person.uid} className="inline-flex items-center gap-2 rounded-full border border-line bg-raised py-1 pr-3 pl-1 text-xs text-fg-soft">
            <span className={cn('grid size-6 place-items-center rounded-full text-[0.5rem] font-black text-white', toneOf(person.uid))}>{initials(person.name)}</span>{person.name.split(' ')[0]}
        </li>)}</ul>
    </Card>;
}

export function CourseCard({ course, practicing = [] }: { course: typeof courses[number]; practicing?: { uid: string; name: string }[] }) {
    const content = <>
        <div className="relative">
            <img src={course.image} alt="" width={960} height={640} loading="lazy" decoding="async" className="h-44 w-full bg-sunken object-cover"/>
            {!course.available && <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-bold text-white">Próximamente</span>}
        </div>
        <div className="flex flex-1 flex-col p-4 xl:p-5">
            <h3 className="mb-2 text-base md:text-[1.0625rem] xl:text-lg">{course.title}</h3>
            <p className="text-xs leading-relaxed text-muted xs:min-h-9.5">{course.description}</p>
            {/* El conteo y el pie van siempre abajo, alineados entre tarjetas de distinta altura. */}
            <div className="mt-auto pt-4.5 pb-3.5 text-3xs text-muted">{course.lessonCount} lecciones</div>
            {course.available && <div className="flex min-h-9 items-center justify-between border-t border-line pt-3 text-xs text-accent">{practicing.length > 0 ? <Practicing people={practicing}/> : <span>Ver lecciones</span>}<ArrowRight size={16}/></div>}
        </div>
    </>;
    return course.available
        ? <Link to={moduleUrl(course.id)} className="flex flex-col overflow-hidden rounded-lg border border-line bg-card transition hover:-translate-y-1 hover:border-accent/60">{content}</Link>
        : <article aria-label={`${course.title}: próximamente`} className="flex flex-col overflow-hidden rounded-lg border border-line bg-card opacity-60">{content}</article>;
}

export function CourseGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:gap-5', className)}>{children}</div>;
}
