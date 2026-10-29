'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Card, PageTitle } from '@/components/ui';
import { isAdmin, useAccount } from '@/lib/account';
import { courses, type PracticeLesson } from '@/data/questMock';
import { FIGURES, practiceStudies, speedName, speedPlan } from '@/data/practiceStudies';
import { prepare } from '@/lib/audio/guitar';
import { scheduleRound } from '@/lib/audio/practiceRound';
import { Link } from '@/lib/router';
import { practiceUrl } from '@/lib/routes';
import { DIFFICULTY } from '@/lib/points';
import { cn } from '@/lib/cn';

/**
 * Prueba de sonido: solo para el rol admin (como Analytics; a los demás se les responde como página inexistente).
 * Todas las lecciones con práctica, para escucharlas rápido con la guitarra de guía a la velocidad sugerida de cada una.
 */
const modules = courses
    .map(course => ({ course, lessons: course.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice' && !!practiceStudies[lesson.id]) }))
    .filter(({ lessons }) => lessons.length);

export default function SoundCheckPage() {
    const admin = isAdmin(useAccount());
    const [playing, setPlaying] = useState<string | null>(null);
    const [step, setStep] = useState(-1);
    const cancelRef = useRef<(() => void) | null>(null);
    const stop = () => { cancelRef.current?.(); cancelRef.current = null; setPlaying(null); setStep(-1); };
    const play = async (id: string) => {
        cancelRef.current?.();
        const study = practiceStudies[id];
        setPlaying(id);
        setStep(-1);
        try { await prepare(); } catch { stop(); return; }
        const plan = speedPlan(study.figure, study.speed ?? 2);
        cancelRef.current = scheduleRound(plan.bpm, study.pattern, { guide: true, countIn: false, notesPerBeat: FIGURES[plan.figure].notesPerBeat, onCount: () => {}, onStep: setStep, onEnd: stop });
    };
    useEffect(() => () => cancelRef.current?.(), []);

    if (!admin) return <Card><p className="text-sm text-muted">Esta página no existe.</p></Card>;
    return <>
        <PageTitle eyebrow="ADMIN" title="Prueba de sonido" text="Escucha cada lección con la guitarra de guía, a su velocidad sugerida y sin cuenta de entrada."/>
        <div className="flex flex-col gap-8">{modules.map(({ course, lessons }) => <section key={course.id}>
            <h2 className="mb-3 text-lg">{course.title}{!course.available && <span className="ml-2 text-sm font-normal text-muted">Sin publicar</span>}</h2>
            <div className="grid gap-3 md:grid-cols-3">{lessons.map(lesson => {
                const study = practiceStudies[lesson.id];
                const plan = speedPlan(study.figure, study.speed ?? 2);
                const current = playing === lesson.id;
                return <div key={lesson.id} className={cn('flex items-center gap-3 rounded-xl border bg-card p-3.5', current ? 'border-violet' : 'border-line')}>
                    <button type="button" onClick={() => current ? stop() : void play(lesson.id)} aria-label={current ? 'Detener' : `Escuchar ${lesson.title}`}
                        className={cn('grid size-10 shrink-0 place-items-center rounded-full transition', current ? 'bg-brand text-white' : 'border border-line-strong text-fg-soft hover:text-fg')}>
                        {current ? <Pause size={16}/> : <Play size={16} fill="currentColor"/>}
                    </button>
                    <div className="min-w-0 flex-1">
                        <Link to={practiceUrl(course.id, lesson.id)} className="block truncate text-sm font-bold hover:text-accent">{lesson.title}</Link>
                        <p className="truncate text-xs text-muted">{[lesson.category, DIFFICULTY[lesson.difficulty].label].filter(Boolean).join(' · ')}</p>
                        <p className="truncate text-xs text-muted">{speedName(study.speed ?? 2)} · {plan.bpm} BPM · {FIGURES[plan.figure].label.split(' · ')[0]}{current && step >= 0 ? ` · ${step + 1}/${study.pattern.length}` : ''}</p>
                    </div>
                </div>;
            })}</div>
        </section>)}</div>
    </>;
}
