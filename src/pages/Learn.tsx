import { useState } from 'react';
import { Search } from 'lucide-react';
import { CourseCard, CourseGrid } from '@/components/quest/QuestUI';
import { Button, Caption, EmptyState, PageTitle, Tabs } from '@/components/ui';
import { courses } from '@/data/questMock';

const filters = ['Todos', 'Base', 'Intermedio', 'Avanzado'] as const;
type Filter = typeof filters[number];

export default function LearnPage() {
    const [filter, setFilter] = useState<Filter>('Todos');
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const filteredCourses = courses.filter(course => {
        const searchable = [course.title, course.category, ...course.skills, ...course.lessons.map(lesson => lesson.title)].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
        return (filter === 'Todos' || course.difficulties.some(level => level === filter.toLowerCase())) && searchable.includes(normalizedQuery);
    });
    return <>
        <PageTitle eyebrow="ELIGE QUÉ ENTRENAR" title="¿Qué quieres mejorar?" text="Un catálogo de ejercicios por técnica. Entra al que necesites, sin seguir un orden."/>
        <div className="mb-7 flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs items={[...filters]} value={filter} onChange={setFilter} label="Filtrar por dificultad"/>
            <label className="flex w-full items-center gap-2 rounded-md border border-line-strong bg-[#121d2f] px-3 text-[#9da7ae] lg:w-auto">
                <Search size={17}/>
                <input className="w-full min-w-48 border-0 bg-transparent px-0 text-xs text-fg outline-none" aria-label="Buscar módulos o ejercicios" placeholder="Busca módulos, técnicas o ejercicios" value={query} onChange={event => setQuery(event.target.value)}/>
            </label>
        </div>
        <Caption className="-mt-2 mb-5.5">{filteredCourses.length} módulos · {filteredCourses.reduce((total, course) => total + course.lessonCount, 0)} lecciones · Lecturas y prácticas</Caption>
        <CourseGrid>{filteredCourses.map(course => <CourseCard key={course.id} course={course}/>)}</CourseGrid>
        {!filteredCourses.length && <EmptyState icon={<Search/>} title="No encontramos ese entrenamiento" action={<Button onClick={() => { setQuery(''); setFilter('Todos'); }}>Ver todos los módulos</Button>}>Prueba otro nombre o vuelve a explorar todos los módulos.</EmptyState>}
    </>;
}
