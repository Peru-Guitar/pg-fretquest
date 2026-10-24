'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CourseCard, CourseGrid } from '@/components/quest/QuestUI';
import { Button, Caption, EmptyState, PageTitle } from '@/components/ui';
import { courses } from '@/data/questMock';

export default function LearnPage() {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const filteredCourses = courses.filter(course => {
        const searchable = [course.title, course.category, ...course.skills, ...course.lessons.map(lesson => lesson.title)].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
        return searchable.includes(normalizedQuery);
    });
    return <>
        <PageTitle eyebrow="EJERCICIOS" title="¿Qué quieres mejorar?" text="Digitación y coordinación y Estudios están disponibles para revisión. Los demás módulos de práctica estarán disponibles próximamente."/>
        <div className="mb-7 flex justify-end">
            <label className="flex w-full items-center gap-2 rounded-md border border-line-strong bg-[#121d2f] px-3 text-[#9da7ae] lg:w-auto">
                <Search size={17}/>
                <input className="w-full min-w-48 border-0 bg-transparent px-0 text-xs text-fg outline-none" aria-label="Buscar módulos o ejercicios" placeholder="Busca módulos, técnicas o ejercicios" value={query} onChange={event => setQuery(event.target.value)}/>
            </label>
        </div>
        <Caption className="-mt-2 mb-5.5">{filteredCourses.filter(course => course.available).length} disponibles · {filteredCourses.filter(course => !course.available).length} próximamente</Caption>
        <CourseGrid>{filteredCourses.map(course => <CourseCard key={course.id} course={course}/>)}</CourseGrid>
        {!filteredCourses.length && <EmptyState icon={<Search/>} title="No encontramos ese entrenamiento" action={<Button onClick={() => { setQuery(''); }}>Ver todos los módulos</Button>}>Prueba otro nombre o vuelve a explorar todos los módulos.</EmptyState>}
    </>;
}
