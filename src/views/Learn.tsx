'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CourseCard, CourseGrid } from '@/components/quest/QuestUI';
import { Button, Caption, EmptyState, PageTitle } from '@/components/ui';
import { courses } from '@/data/questMock';
import { useAccount } from '@/lib/account';
import { useCommunity } from '@/lib/community';

export default function LearnPage() {
    const [query, setQuery] = useState('');
    const account = useAccount();
    // Quiénes practicaron cada módulo esta semana: sale de los datos de Comunidad (misma consulta y caché).
    const { data: community } = useCommunity(account !== null);
    const normalizedQuery = query.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
    // Los módulos sin contenido todavía («próximamente») no se listan: siguen en el temario, escondidos.
    const filteredCourses = courses.filter(course => course.available).filter(course => {
        const searchable = [course.title, course.category, ...course.skills, ...course.lessons.map(lesson => lesson.title)].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
        return searchable.includes(normalizedQuery);
    });
    return <>
        <PageTitle eyebrow="EJERCICIOS" title="¿Qué quieres mejorar?" text="Elige un módulo y entrena la técnica que quieres mejorar."/>
        <div className="mb-7 flex justify-end">
            <label className="flex w-full items-center gap-2 rounded-md border border-line-strong bg-field px-3 text-muted lg:w-auto">
                <Search size={17}/>
                <input className="w-full min-w-48 border-0 bg-transparent px-0 text-xs text-fg outline-none" aria-label="Buscar módulos o ejercicios" placeholder="Busca módulos, técnicas o ejercicios" value={query} onChange={event => setQuery(event.target.value)}/>
            </label>
        </div>
        <Caption className="-mt-2 mb-5.5">{filteredCourses.length} {filteredCourses.length === 1 ? 'módulo' : 'módulos'}</Caption>
        <CourseGrid>{filteredCourses.map(course => <CourseCard key={course.id} course={course} practicing={community?.byModule[course.id]}/>)}</CourseGrid>
        {!filteredCourses.length && <EmptyState icon={<Search/>} title="No encontramos ese entrenamiento" action={<Button onClick={() => { setQuery(''); }}>Ver todos los módulos</Button>}>Prueba otro nombre o vuelve a explorar todos los módulos.</EmptyState>}
    </>;
}
