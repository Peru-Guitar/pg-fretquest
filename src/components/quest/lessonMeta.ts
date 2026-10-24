import { BookOpen, Guitar } from 'lucide-react';
import type { Lesson } from '@/data/questMock';

/** Aspecto de cada tipo de lección: lectura o práctica. */
export function lessonMeta(lesson: Lesson) {
    if (lesson.type === 'reading') return { Icon: BookOpen, label: 'LECTURA', description: 'Lectura', cta: 'Leer', tone: 'border-blue/30 bg-blue/10 text-[#8fc0ff]' };
    return { Icon: Guitar, label: 'PRÁCTICA', description: 'Práctica', cta: 'Practicar', tone: 'border-violet/25 bg-violet/10 text-accent-strong' };
}
