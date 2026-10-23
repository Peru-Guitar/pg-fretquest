import { ComingSoon } from '@/components/quest/ComingSoon';
import { practiceStudies } from '@/data/practiceStudies';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router';
import { courses, routines, tempos, type PracticeLesson } from '@/data/questMock';
import { ArrowRight, BookOpen, Gauge, Headphones, Loader2, Play, Square, Target } from 'lucide-react';
import { BackLink, Badge, Button, Caption, Card, Eyebrow, PageTitle, Tags } from '@/components/ui';
import { cn } from '@/lib/cn';
import { prepare } from '@/lib/audio/guitar';
import { scheduleRound, type PatternNote } from '@/lib/audio/practiceRound';
import { DIFFICULTY } from '@/lib/points';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];

// Ejercicio real: cromático 1-2-3-4 por las seis cuerdas (6ª → 1ª) y 4-3-2-1 de vuelta (1ª → 6ª), una nota por clic.
const PATTERN: PatternNote[] = [
    ...[6, 5, 4, 3, 2, 1].flatMap(string => [5, 6, 7, 8].map(fret => ({ string, fret }))),
    ...[1, 2, 3, 4, 5, 6].flatMap(string => [8, 7, 6, 5].map(fret => ({ string, fret }))),
];
type Mode = 'goal' | 'practice';
type Phase = 'idle' | 'loading' | 'countdown' | 'playing';

const modeInfo = {
    goal: { label: 'Objetivo', text: 'Lee de qué trata el ejercicio antes de tocar.', icon: Target },
    practice: { label: 'Ejercicio', text: 'Práctica libre: escúchalo, cambia la velocidad y para cuando quieras.', icon: BookOpen },
};

export default function PracticePage() {
    const { exerciseId } = useParams();
    const [params] = useSearchParams();
    const course = courses.find(item => item.id === exerciseId);
    if (course && !course.available) return <ComingSoon title={course.title}/>;
    return <PracticeView key={`${exerciseId}:${params.get('exercise') ?? params.get('lesson')}`} />;
}

function PracticeView() {
    const { exerciseId } = useParams();
    const [searchParams] = useSearchParams();
    const hasPractice = (course: typeof courses[number]) => course.lessons.some(lesson => lesson.type === 'practice');
    const activeModule = courses.find(course => course.id === exerciseId && hasPractice(course)) ?? courses.find(course => course.id === 'fingering')!;
    const routine = routines.find(item => item.id === searchParams.get("routine"));
    const practiceLessons = activeModule.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice');
    const activeExercise = practiceLessons.find(lesson => lesson.id === (searchParams.get("exercise") ?? searchParams.get("lesson"))) ?? practiceLessons[0];
    const study = practiceStudies[activeExercise.id];
    const [variantIndex, setVariantIndex] = useState(0);
    const pattern = study?.variants[variantIndex].pattern ?? PATTERN;
    const perRow = study?.perRow ?? 16;
    const bars = Array.from({ length: Math.ceil(pattern.length / perRow) }, (_, row) => pattern.slice(row * perRow, row * perRow + perRow));
    const tabColumns = { gridTemplateColumns: `25px repeat(${perRow}, 1fr)` };
    const [mode, setMode] = useState<Mode>('goal');
    const [bpm, setBpm] = useState(activeExercise.tempo.min);
    const [phase, setPhase] = useState<Phase>('idle');
    const [round, setRound] = useState(1);
    const [count, setCount] = useState(-1);
    const [pulse, setPulse] = useState(0);
    const [step, setStep] = useState(-1);
    const [listening, setListening] = useState(false);
    const active = phase !== 'idle';
    const inRange = (value: number) => value >= activeExercise.tempo.min && value <= activeExercise.tempo.max;
    const cancelRef = useRef<(() => void) | null>(null);
    const bpmRef = useRef(bpm);
    useEffect(() => { bpmRef.current = bpm; }, [bpm]);
    const phaseRef = useRef(phase);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    // Cada ronda: cuenta de entrada → patrón con metrónomo.
    // Escuchar: una ronda con guitarra, sin cuenta. Práctica: rondas sin fin.
    const runRound = (number: number, listen: boolean) => {
        setRound(number);
        setStep(-1);
        setCount(-1);
        setPhase(listen ? 'playing' : 'countdown');
        cancelRef.current = scheduleRound(bpmRef.current, pattern, {
            notesPerBeat: study?.notesPerBeat,
            clicksPerBeat: study?.clicksPerBeat,
            guide: listen,
            countIn: !listen,
            onCount: value => { setCount(value); setPulse(beat => beat + 1); },
            onStep: index => { setPhase('playing'); setStep(index); },
            onEnd: () => {
                if (listen) { stop(); return; }
                runRound(number + 1, false);
            },
        });
    };
    const start = async (listen: boolean) => {
        setListening(listen);
        setPhase('loading');
        try { await prepare(); } catch { setPhase('idle'); return; }
        runRound(1, listen);
    };
    const stop = () => { cancelRef.current?.(); cancelRef.current = null; setStep(-1); setRound(1); setPhase('idle'); };
    const changeMode = (value: Mode) => { stop(); setMode(value); };

    const stopRef = useRef(stop);
    const startRef = useRef(start);
    useEffect(() => { stopRef.current = stop; startRef.current = start; });
    // Espacio: empieza la práctica, o la detiene si ya está sonando.
    const practicing = mode === 'practice';
    useEffect(() => {
        if (!practicing) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.code !== 'Space' || (event.target as HTMLElement).closest('input, select, textarea')) return;
            event.preventDefault(); // evita el scroll y que un botón con foco también se active
            if (phaseRef.current === 'idle') void startRef.current(false);
            else if (phaseRef.current !== 'loading') stopRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [practicing]);
    // Al salir de la página se corta el sonido.
    useEffect(() => () => stopRef.current(), []);
    // Escape detiene la práctica.
    useEffect(() => {
        if (!active) return;
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') stopRef.current(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active]);

    // Scroll automático: mantiene centrada la fila de la tablatura que está sonando.
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Durante la cuenta de entrada se muestra la primera fila.
    const currentRow = phase === 'countdown' ? 0 : step < 0 ? -1 : Math.floor(step / perRow);
    useEffect(() => {
        if (currentRow >= 0) rowRefs.current[currentRow]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [currentRow]);

    const tempoSelect = <label className="flex items-center gap-2 text-sm text-muted"><Gauge size={16}/><span className="sr-only">Velocidad</span>
        <select value={bpm} onChange={event => setBpm(Number(event.target.value))} className="min-h-10 py-1.5 font-bold text-fg">
            {tempos.map(item => <option key={item.bpm} value={item.bpm} disabled={!inRange(item.bpm)}>{item.name} · {item.bpm} BPM</option>)}
        </select>
    </label>;

    return <>
        <BackLink to={`/modules/${activeModule.id}`}>{activeModule.title}</BackLink>
        <PageTitle eyebrow={activeModule.category} title={activeExercise.title} text={activeExercise.description}>
            {routine && <Badge>RUTINA · {routine.title.toUpperCase()}</Badge>}
        </PageTitle>


        <div role="tablist" aria-label="Modo" className="flex border-b border-line">
            {(['goal', 'practice'] as const).map(value => {
                const { label, icon: Icon } = modeInfo[value];
                const selected = mode === value;
                return <button key={value} type="button" role="tab" aria-selected={selected} disabled={active} onClick={() => changeMode(value)} className={cn(
                    '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition disabled:opacity-50',
                    selected ? 'border-violet text-accent-strong' : 'border-transparent text-muted hover:text-fg',
                )}><Icon size={16}/>{label}</button>;
            })}
        </div>
        <Caption className="mt-3 mb-6">{modeInfo[mode].text}</Caption>


        {mode === 'goal' && <Card>
            {routine && <>
                <h2 className="mb-3">Rutina de ejemplo · {routine.duration}</h2>
                <Tags items={routine.id === "warmup" ? ["2 min · Cromático lento", "2 min · Pares de dedos", "2 min · Ataques suaves"] : ["4 min · Sincronización", "4 min · Púa alternada", "4 min · Ritmo", "4 min · Muting"]}/>
                <Caption className="mt-3 mb-6">Secuencia visual; sin temporizador ni cambio automático de ejercicio.</Caption>
            </>}
            <h2 className="mb-3">Objetivo técnico</h2>
            <p className="text-sm leading-relaxed text-muted">{activeExercise.goal}</p>
            <h3 className="mt-6 mb-3">Patrones y variantes</h3>
            <Tags items={activeExercise.variants}/>
            {study ? <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted">
                <div><h3 className="mb-2 text-fg">Cómo tocarlo</h3><ol className="list-decimal space-y-2 pl-5">{study.steps.map(text => <li key={text}>{text}</li>)}</ol></div>
                <div><h3 className="mb-2 text-fg">Errores comunes</h3><ul className="list-disc space-y-2 pl-5">{study.mistakes.map(text => <li key={text}>{text}</li>)}</ul></div>
                <div><h3 className="mb-2 text-fg">Cuándo avanzar</h3><p>{study.criterion}</p></div>
            </div> : <p className="mt-3 text-sm leading-relaxed text-muted">Esta lección usa un patrón cromático de ejemplo.</p>}
            <div className="mt-6 grid gap-4.5 xs:grid-cols-3 xl:gap-6">{[['01', 'Suelta la tensión', 'Relaja hombros y muñeca. Deja que el movimiento sea pequeño.'], ['02', 'Observa el movimiento', 'Reduce los gestos innecesarios y conserva una ejecución cómoda.'], ['03', 'Prioriza la claridad', 'Toca despacio. La velocidad llegará con la confianza.']].map(([number, title, text]) =>
                <div key={number} className="border-t border-line pt-4 xs:border-0 xs:pt-0">
                    <span className="text-accent">{number}</span>
                    <h3 className="ml-3 inline text-md xs:my-2 xs:ml-0 xs:block">{title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted xs:mt-0">{text}</p>
                </div>)}
            </div>
            <Button className="mt-8" onClick={() => setMode('practice')}>Ir al ejercicio <ArrowRight size={16}/></Button>
        </Card>}

        {mode !== 'goal' && <div className="flex flex-col gap-6">
            <section className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
                    <div className="min-w-0">
                        <Eyebrow>{activeExercise.variants[variantIndex].toUpperCase()}</Eyebrow>
                        <h2 className="mt-2 flex items-center gap-3 text-[1.1875rem]">{activeExercise.title}<span className="rounded border border-line-strong px-2 py-0.5 text-2xs font-bold text-muted">{DIFFICULTY[activeExercise.difficulty].label}</span></h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {study && study.variants.length > 1 && <label className="text-sm text-muted">Variante
                            <select aria-label="Variante del ejercicio" value={variantIndex} disabled={active} onChange={event => { setVariantIndex(Number(event.target.value)); setStep(-1); setPhase('idle'); }} className="ml-2 min-h-10 max-w-64 text-fg">
                                {study.variants.map((variant, index) => <option key={variant.title} value={index}>{variant.title}</option>)}
                            </select>
                        </label>}
                        {tempoSelect}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 xl:px-5.5">
                    {phase === 'idle'
                        ? <>
                            <Button onClick={() => start(false)} className="min-w-40"><Play size={17} fill="currentColor"/>Empezar <kbd className="rounded border border-white/30 px-1.5 font-mono text-3xs">Espacio</kbd></Button>
                            <Button variant="secondary" onClick={() => start(true)}><Headphones size={16}/>Escuchar ejercicio</Button>
                        </>
                        : phase === 'loading'
                            ? <Button disabled className="min-w-40"><Loader2 size={17} className="animate-spin"/>Cargando sonido…</Button>
                            : <Button variant="secondary" onClick={stop} className="min-w-40"><Square size={15}/>Detener <kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs text-muted">Esc</kbd></Button>}
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-muted">
                        {active && listening
                            ? <span className="flex items-center gap-1.5"><Headphones size={15}/>Escuchando el ejercicio</span>
                            : <span className="flex items-center gap-1.5"><BookOpen size={15}/>{active ? `Ronda ${round} · ` : ''}Práctica libre</span>}
                    </div>
                </div>
                <p className="border-t border-line px-5 py-3 text-xs text-muted">{study?.notation ?? 'Afinación estándar E A D G B e · Una nota por clic (negras) · Púa alternada · Dedos 1–2–3–4 = trastes 5–6–7–8'}</p>
                <div className="relative overflow-auto border-t border-line bg-sunken px-4 pt-9 pb-5 md:px-6">
                    <div className="flex min-w-180 flex-col gap-8" aria-label={`Tablatura: ${activeExercise.title}, ${activeExercise.variants[variantIndex]}. Una nota por clic.`}>
                        {bars.map((bar, barIndex) => <div key={barIndex} ref={element => { rowRefs.current[barIndex] = element; }}>
                            {/* Dirección de púa: ⊓ abajo (downstroke) · V arriba (upstroke), púa alternada. */}
                            <div style={tabColumns} className="mb-1 grid text-center text-sm text-accent-strong" aria-label="Dirección de púa"><span/>{bar.map((_, index) => <span key={index} title={index % 2 === 0 ? 'Púa hacia abajo' : 'Púa hacia arriba'}>{index % 2 === 0 ? '⊓' : 'V'}</span>)}</div>
                            {strings.map((name, row) => <div key={name} style={tabColumns} className={cn('relative grid h-7 items-center font-mono before:absolute before:right-0 before:left-8 before:bg-[#58709a55]', row === 5 ? 'before:h-0.5' : 'before:h-px')}>
                                <b className="text-sm text-muted">{name}</b>
                                {bar.map((note, index) => {
                                    const noteIndex = barIndex * perRow + index;
                                    const playing = step === noteIndex;
                                    return <span key={index} className={cn('z-10 justify-self-center px-1 text-base', note.string === row + 1 ? (playing ? 'rounded-[5px] bg-linear-135 from-brand to-brand-strong text-white shadow-[0_0_22px_#e0662f4a]' : 'bg-sunken text-fg-soft') : 'invisible')}>{note.fret}</span>;
                                })}
                            </div>)}
                        </div>)}
                    </div>
                </div>
                {/* Cuenta de entrada: fija en pantalla y sin tapar la tablatura, para leer las primeras notas.
                    Va en <body> porque el `transform` animado de <main> encerraría un `fixed`. */}
                {phase === 'countdown' && createPortal(<div role="status" className="pointer-events-none fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-5 rounded-2xl border border-line-strong bg-raised/95 px-6 py-4 shadow-[0_20px_60px_#0009] backdrop-blur-sm">
                    {count < 0
                        ? <span key={pulse} className="block size-10 animate-pop rounded-full bg-violet/60 shadow-[0_0_30px_#e0662f88]"/>
                        : <span key={pulse} className={cn('block min-w-10 animate-pop text-center font-black text-accent-strong', count > 0 ? 'text-5xl' : 'text-3xl')}>{count > 0 ? count : `Ronda ${round}`}</span>}
                    <div>
                        <p className="text-sm font-bold">{count < 0 ? 'Siente el pulso' : round === 1 ? 'Prepárate' : 'Siguiente ronda'}</p>
                        <p className="mt-1 text-xs text-muted"><kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs">Esc</kbd> para cancelar</p>
                    </div>
                </div>, document.body)}
            </section>
        </div>}
    </>;
}
