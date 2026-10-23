import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { courses, routines, tempos, type PracticeLesson } from '@/data/questMock';
import { ArrowRight, BookOpen, CircleDot, Gauge, Headphones, Loader2, Lock, Play, Square, Target, Timer } from 'lucide-react';
import { BackLink, Badge, Button, Caption, Card, Eyebrow, PageTitle, Tags } from '@/components/ui';
import { cn } from '@/lib/cn';
import { prepare } from '@/lib/audio/guitar';
import { scheduleRound, type PatternNote } from '@/lib/audio/practiceRound';
import { SessionResults } from '@/components/practice/SessionResults';
import { saveSession } from '@/lib/practiceTime';
import { DIFFICULTY, sessionPoints } from '@/lib/points';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
const tabColumns = 'grid grid-cols-[25px_repeat(16,1fr)]';

// Ejercicio real: cromático 1-2-3-4 por las seis cuerdas (6ª → 1ª) y 4-3-2-1 de vuelta (1ª → 6ª), en corcheas.
const PATTERN: PatternNote[] = [
    ...[6, 5, 4, 3, 2, 1].flatMap(string => [5, 6, 7, 8].map(fret => ({ string, fret }))),
    ...[1, 2, 3, 4, 5, 6].flatMap(string => [8, 7, 6, 5].map(fret => ({ string, fret }))),
];
/** Filas de tablatura de 16 notas (dos compases cada una). */
const BARS = Array.from({ length: Math.ceil(PATTERN.length / 16) }, (_, row) => PATTERN.slice(row * 16, row * 16 + 16));
const ROUND_OPTIONS = [1, 3, 5, 10];
/** Clics por ronda: 8 de cuenta de entrada + una nota por clic. */
const CLICKS_PER_ROUND = 8 + PATTERN.length;
type Mode = 'goal' | 'practice' | 'progress';
type Phase = 'idle' | 'loading' | 'countdown' | 'playing' | 'done';
/** Reloj para medir el tiempo de práctica (solo se lee en eventos e intervalos, nunca al renderizar). */
const clock = () => performance.now();
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const modeInfo = {
    goal: { label: 'Objetivo', text: 'Lee de qué trata el ejercicio antes de tocar.', icon: Target },
    practice: { label: 'Ejercicio', text: 'Aprende el ejercicio: escúchalo, cambia la velocidad y para cuando quieras. No suma a tu plan.', icon: BookOpen },
    progress: { label: 'Práctica', text: 'Entrena de verdad: velocidad y rondas fijas, sin pausa. Al terminar valoras la sesión y su tiempo suma a tu plan de hoy.', icon: CircleDot },
};

export default function PracticePage() {
    const { exerciseId } = useParams();
    const [searchParams] = useSearchParams();
    const hasPractice = (course: typeof courses[number]) => course.lessons.some(lesson => lesson.type === 'practice');
    const activeModule = courses.find(course => course.id === exerciseId && hasPractice(course)) ?? courses.find(course => course.id === 'fingering')!;
    const routine = routines.find(item => item.id === searchParams.get("routine"));
    const practiceLessons = activeModule.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice');
    const activeExercise = practiceLessons.find(lesson => lesson.id === (searchParams.get("exercise") ?? searchParams.get("lesson"))) ?? practiceLessons[0];
    // `?modo=progreso` abre directamente el modo Progreso (desde Hoy o las rutinas).
    const [mode, setMode] = useState<Mode>(searchParams.get('modo') === 'progreso' ? 'progress' : 'goal');
    const [bpm, setBpm] = useState(activeExercise.record ?? activeExercise.tempo.min);
    const [rounds, setRounds] = useState(3);
    const [phase, setPhase] = useState<Phase>('idle');
    const [round, setRound] = useState(1);
    const [count, setCount] = useState(-1);
    const [pulse, setPulse] = useState(0);
    const [step, setStep] = useState(-1);
    const [listening, setListening] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const progress = mode === 'progress';
    const active = phase === 'loading' || phase === 'countdown' || phase === 'playing';
    const counting = progress && active && phase !== 'loading';
    const tempo = tempos.find(item => item.bpm === bpm)!;
    const inRange = (value: number) => value >= activeExercise.tempo.min && value <= activeExercise.tempo.max;
    const estimateMinutes = Math.max(1, Math.round(rounds * CLICKS_PER_ROUND / bpm));
    const cancelRef = useRef<(() => void) | null>(null);
    const bpmRef = useRef(bpm);
    useEffect(() => { bpmRef.current = bpm; }, [bpm]);
    // Inicio de la sesión de Progreso. El tiempo se registra al final, junto con la valoración.
    const startedAt = useRef<number | null>(null);

    // Cronómetro en vivo de la sesión de Progreso.
    useEffect(() => {
        if (!counting) return;
        const id = window.setInterval(() => { if (startedAt.current !== null) setElapsed((clock() - startedAt.current) / 1000); }, 250);
        return () => window.clearInterval(id);
    }, [counting]);

    const sessionSeconds = () => {
        if (startedAt.current === null) return 0;
        const seconds = (clock() - startedAt.current) / 1000;
        startedAt.current = null;
        return seconds;
    };

    // Cada ronda: cuenta de entrada → patrón con metrónomo.
    // Escuchar: una ronda con guitarra, sin cuenta. Práctica: rondas sin fin. Progreso: N rondas y resultado.
    type Run = { kind: 'listen' | 'practice' | 'progress'; total: number };
    const runRound = (number: number, run: Run) => {
        const listen = run.kind === 'listen';
        setRound(number);
        setStep(-1);
        setCount(-1);
        setPhase(listen ? 'playing' : 'countdown');
        cancelRef.current = scheduleRound(bpmRef.current, PATTERN, {
            guide: listen,
            countIn: !listen,
            onCount: value => { setCount(value); setPulse(beat => beat + 1); },
            onStep: index => { setPhase('playing'); setStep(index); },
            onEnd: () => {
                if (listen) { stop(); return; }
                if (run.kind === 'progress' && number >= run.total) { cancelRef.current?.(); setStep(-1); setElapsed(sessionSeconds()); setPhase('done'); return; }
                runRound(number + 1, run);
            },
        });
    };
    const start = async (kind: Run['kind']) => {
        setListening(kind === 'listen');
        setElapsed(0);
        setPhase('loading');
        try { await prepare(); } catch { setPhase('idle'); return; }
        if (kind === 'progress') startedAt.current = clock();
        runRound(1, { kind, total: rounds });
    };
    const stop = () => { cancelRef.current?.(); cancelRef.current = null; startedAt.current = null; setStep(-1); setRound(1); setPhase('idle'); };
    const changeMode = (value: Mode) => { stop(); setMode(value); };

    const stopRef = useRef(stop);
    useEffect(() => { stopRef.current = stop; });
    // Al salir de la página se corta el sonido (una sesión sin terminar no suma).
    useEffect(() => () => stopRef.current(), []);
    // Escape detiene la Práctica; en Progreso no se puede pausar.
    useEffect(() => {
        if (!active || progress) return;
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') stopRef.current(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active, progress]);

    const tempoSelect = <label className="flex items-center gap-2 text-sm text-muted"><Gauge size={16}/><span className="sr-only">Velocidad</span>
        <select value={bpm} onChange={event => setBpm(Number(event.target.value))} disabled={progress && active} className="min-h-10 py-1.5 font-bold text-fg">
            {tempos.map(item => <option key={item.bpm} value={item.bpm} disabled={!inRange(item.bpm)}>{item.name} · {item.bpm} BPM</option>)}
        </select>
    </label>;

    return <>
        <BackLink to={`/modules/${activeModule.id}`}>{activeModule.title}</BackLink>
        <PageTitle eyebrow={activeModule.category} title={activeExercise.title} text={activeExercise.description}>
            {routine && <Badge>RUTINA · {routine.title.toUpperCase()}</Badge>}
        </PageTitle>


        <div role="tablist" aria-label="Modo" className="flex border-b border-line">
            {(['goal', 'practice', 'progress'] as const).map(value => {
                const { label, icon: Icon } = modeInfo[value];
                const selected = mode === value;
                return <button key={value} type="button" role="tab" aria-selected={selected} disabled={active} onClick={() => changeMode(value)} className={cn(
                    '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition disabled:opacity-50',
                    selected ? (value === 'progress' ? 'border-success text-success' : 'border-violet text-accent-strong') : 'border-transparent text-muted hover:text-fg',
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
            <p className="mt-3 text-sm leading-relaxed text-muted">Por ahora todas las lecciones usan el mismo patrón de ejemplo (cromático 1-2-3-4).</p>
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
                        <Eyebrow>{activeExercise.variants[0].toUpperCase()}</Eyebrow>
                        <h2 className="mt-2 flex items-center gap-3 text-[1.1875rem]">{activeExercise.title}<span className="rounded border border-line-strong px-2 py-0.5 text-2xs font-bold text-muted">{DIFFICULTY[activeExercise.difficulty].label} ×{DIFFICULTY[activeExercise.difficulty].factor}</span></h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {tempoSelect}
                        {progress && <div role="radiogroup" aria-label="Rondas" className="flex items-center gap-1 rounded-md border border-line-strong p-1">
                            <span className="px-2 text-xs text-muted">Rondas</span>
                            {ROUND_OPTIONS.map(option => <button key={option} type="button" role="radio" aria-checked={rounds === option} disabled={active} onClick={() => setRounds(option)} className={cn('min-h-8 min-w-9 rounded px-2 font-mono text-sm font-bold transition disabled:opacity-50', rounds === option ? 'bg-violet text-white' : 'text-fg-soft hover:bg-white/5')}>{option}</button>)}
                        </div>}
                    </div>
                </div>
                {counting && <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-success/30 bg-success/5 px-5 py-3 text-sm md:px-6">
                    <span className="flex items-center gap-1.5 text-2xs font-black tracking-wider text-success"><span className="size-2 animate-pulse rounded-full bg-success"/>CONTANDO · {tempo.name.toUpperCase()} {bpm} BPM</span>
                    <span className="flex items-center gap-1.5"><Timer size={16} className="text-success"/>Sesión <b className="font-mono text-lg">{formatTime(elapsed)}</b></span>
                    <span className="text-muted">Ronda <b className="text-fg">{round}</b> de {rounds}</span>
                </div>}
                {phase !== 'done' && <div className="relative overflow-auto border-y border-line bg-sunken px-4 pt-9 pb-5 md:px-6">
                    <div className="flex min-w-180 flex-col gap-8" aria-label="Tablatura: cromático 1-2-3-4 de la sexta a la primera cuerda y 4-3-2-1 de vuelta a la sexta, en corcheas.">
                        {BARS.map((bar, barIndex) => <div key={barIndex}>
                            {/* Dirección de púa: ⊓ abajo (downstroke) · V arriba (upstroke), púa alternada. */}
                            <div className={cn(tabColumns, 'mb-1 text-center text-sm text-accent-strong')} aria-label="Dirección de púa"><span/>{bar.map((_, index) => <span key={index} title={index % 2 === 0 ? 'Púa hacia abajo' : 'Púa hacia arriba'}>{index % 2 === 0 ? '⊓' : 'V'}</span>)}</div>
                            {strings.map((name, row) => <div key={name} className={cn(tabColumns, 'relative h-7 items-center font-mono before:absolute before:right-0 before:left-8 before:bg-[#58709a55]', row === 5 ? 'before:h-0.5' : 'before:h-px')}>
                                <b className="text-sm text-muted">{name}</b>
                                {bar.map((note, index) => {
                                    const noteIndex = barIndex * 16 + index;
                                    const playing = step === noteIndex;
                                    return <span key={index} className={cn('z-10 justify-self-center px-1 text-base', note.string === row + 1 ? (playing ? 'rounded-[5px] bg-linear-135 from-[#3b9aff] to-[#8547ef] text-white shadow-[0_0_22px_#7359f04a]' : 'bg-sunken text-[#c6cde6]') : 'invisible')}>{note.fret}</span>;
                                })}
                            </div>)}
                        </div>)}
                    </div>
                </div>}
                {phase === 'done' && <div className="border-y border-line bg-sunken"><SessionResults rounds={rounds} tempoName={tempo.name} bpm={bpm} seconds={elapsed} points={sessionPoints(rounds, activeExercise.difficulty, bpm)} backTo={`/modules/${activeModule.id}`} onRepeat={() => start('progress')} onRate={rating => saveSession({ lessonId: activeExercise.id, bpm, rounds, seconds: Math.round(elapsed), rating, points: sessionPoints(rounds, activeExercise.difficulty, bpm) })}/></div>}
                {phase === 'countdown' && <div className="absolute inset-0 z-20 grid place-items-center bg-canvas/80 backdrop-blur-md">
                    <div className="text-center">
                        <p className="text-sm text-muted">{count < 0 ? 'Siente el pulso' : round === 1 ? 'Prepárate' : 'Siguiente ronda'}</p>
                        {count < 0
                            ? <span key={pulse} className="mx-auto my-6 block size-16 animate-pop rounded-full bg-violet/60 shadow-[0_0_40px_#8b73ff88]"/>
                            : <span key={pulse} className="block animate-pop text-8xl font-black text-accent-strong">{count > 0 ? count : '¡Vamos!'}</span>}
                    </div>
                </div>}
                {phase !== 'done' && <div className="flex flex-wrap items-center gap-3 border-t border-line p-4 xl:px-5.5">
                    {phase === 'idle'
                        ? progress
                            ? <Button onClick={() => start('progress')} className="min-w-40"><Play size={17} fill="currentColor"/>Practicar</Button>
                            : <>
                                <Button onClick={() => start('practice')} className="min-w-40"><Play size={17} fill="currentColor"/>Empezar</Button>
                                <Button variant="secondary" onClick={() => start('listen')}><Headphones size={16}/>Escuchar ejercicio</Button>
                            </>
                        : phase === 'loading'
                            ? <Button disabled className="min-w-40"><Loader2 size={17} className="animate-spin"/>Cargando sonido…</Button>
                            : progress
                                ? <Caption><Lock size={13}/> Sesión en curso · sin pausa</Caption>
                                : <Button variant="secondary" onClick={stop} className="min-w-40"><Square size={15}/>Detener <kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs text-muted">Esc</kbd></Button>}
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-muted">
                        {progress
                            ? active
                                ? Array.from({ length: rounds }, (_, index) => <span key={index} className={cn('h-2 w-6 rounded-full', index < round - 1 ? 'bg-success' : index === round - 1 ? 'bg-violet' : 'bg-white/10')}/>)
                                : `${rounds} ${rounds === 1 ? 'ronda' : 'rondas'} · ≈ ${estimateMinutes} min · +${sessionPoints(rounds, activeExercise.difficulty, bpm)} pts`
                            : active && listening
                                ? <span className="flex items-center gap-1.5"><Headphones size={15}/>Escuchando el ejercicio</span>
                                : <span className="flex items-center gap-1.5"><BookOpen size={15}/>{active ? `Ronda ${round} · ` : ''}Modo aprendizaje · no suma a tu plan</span>}
                    </div>
                </div>}
            </section>
        </div>}
    </>;
}
