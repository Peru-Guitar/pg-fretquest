'use client';

import { exerciseUrl, lessonIdFromSlug, lessonUrl, moduleIdFromSlug, moduleUrl } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { FIGURES, pickingOf, practiceStudies, type Stroke } from '@/data/practiceStudies';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from '@/lib/router';
import { courses, tempos, type Difficulty, type PracticeLesson } from '@/data/questMock';
import { BookOpen, Gauge, Headphones, Loader2, Play, Repeat, SkipForward, Square, Target } from 'lucide-react';
import { BackLink, Button, Caption, Card, Eyebrow, LinkButton, PageTitle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { prepare } from '@/lib/audio/guitar';
import { scheduleRound, setRoundBpm, type PatternNote } from '@/lib/audio/practiceRound';
import { setLastExercise, setPracticeIntroSeen, usePracticeIntroSeen } from '@/lib/progress';
import { PracticeIntro } from '@/components/practice/PracticeIntro';
import { completeSessionToday, DEFAULT_SESSION_MINUTES, getPlanSession, planFor, recordPractice, setPlanSession, useAccount, usePlanSession } from '@/lib/account';
import { ArtistCredit } from '@/components/quest/ArtistCredit';
import { PracticeSummary, type SummaryProgress } from '@/components/practice/PracticeSummary';
import { getProgress, recordFinishedPractice, todayOf } from '@/lib/progressDb';
import { DifficultySignal } from '@/components/quest/DifficultySignal';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
const now = () => Date.now();
/** Marca de ataque sobre cada nota de la tablatura. */
const STROKES: Record<Stroke, { mark: string; title: string; legato?: boolean }> = { down: { mark: '⊓', title: 'Púa hacia abajo' }, up: { mark: 'V', title: 'Púa hacia arriba' }, hammer: { mark: 'h', title: 'Hammer-on (sin púa)', legato: true }, pull: { mark: 'p', title: 'Pull-off (sin púa)', legato: true }, slide: { mark: 's', title: 'Slide (sin púa)', legato: true } };
// Rondas por práctica; siempre empieza en 1.
const ROUND_OPTIONS = [1, 3, 5, 7, 10];
/** Rondas máximas según la dificultad: cuanto más difícil, menos repeticiones. */
const MAX_ROUNDS: Record<Difficulty, number> = { base: 10, intermedio: 5, avanzado: 3, experto: 1 };
/** Tiempo de práctica que deben caber las rondas: un ejercicio largo admite menos repeticiones. */
const ROUNDS_BUDGET_SECONDS = 90;
/** BPM de referencia para medir el largo de un ejercicio, igual para todos. */
const ROUNDS_REFERENCE_BPM = 100;
// Un mensaje por ronda, en orden; al acabarse vuelven a empezar.
const MOTIVATION = [
    'Despacio y limpio: la velocidad llega sola.',
    'Cada ronda limpia cuenta más que una rápida.',
    'Suelta los hombros y respira.',
    'Tus dedos ya conocen el camino. Confía en ellos.',
    'Escucha cada nota: que todas suenen igual.',
    'La constancia le gana al talento.',
    'Vas muy bien. Una más con la misma calidad.',
    'Menos fuerza, más control.',
    'Hoy tocas mejor que ayer.',
    'Disfrútalo: estás construyendo tu técnica.',
];

// Ejercicio real: cromático 1-2-3-4 por las seis cuerdas (6ª → 1ª) y 4-3-2-1 de vuelta (1ª → 6ª), una nota por clic.
const PATTERN: PatternNote[] = [
    ...[6, 5, 4, 3, 2, 1].flatMap(string => [5, 6, 7, 8].map(fret => ({ string, fret }))),
    ...[1, 2, 3, 4, 5, 6].flatMap(string => [8, 7, 6, 5].map(fret => ({ string, fret }))),
];
export type Mode = 'goal' | 'practice';
type Phase = 'idle' | 'loading' | 'countdown' | 'playing';

const modeInfo = {
    goal: { label: 'Objetivo', text: 'Lee de qué trata el ejercicio antes de tocar.', icon: Target },
    practice: { label: 'Ejercicio', text: 'Práctica libre: escúchalo, cambia la velocidad y para cuando quieras.', icon: BookOpen },
};

/** Tiempo transcurrido desde `since` (ms), refrescado cada cuarto de segundo. */
function Elapsed({ since }: { since: number }) {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(Math.floor((now() - since) / 1000)), 250);
        return () => clearInterval(id);
    }, [since]);
    return <span className="font-mono text-lg font-bold text-fg tabular-nums" aria-label="Tiempo transcurrido">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>;
}

/** Tiempo restante de la sesión del plan, refrescado cada cuarto de segundo. */
function Remaining({ until }: { until: number }) {
    const [seconds, setSeconds] = useState(() => Math.max(0, Math.ceil((until - now()) / 1000)));
    useEffect(() => {
        const id = setInterval(() => setSeconds(Math.max(0, Math.ceil((until - now()) / 1000))), 250);
        return () => clearInterval(id);
    }, [until]);
    return <span className="flex items-baseline gap-1.5 font-mono text-lg font-bold text-accent tabular-nums" aria-label="Tiempo restante de la sesión">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}<small className="font-sans text-2xs font-normal text-muted">restantes</small></span>;
}

export default function PracticePage({ mode }: { mode: Mode }) {
    // URL: /practicar/{módulo}/{ejercicio}, con slugs en español.
    const { modulo, leccion } = useParams();
    const exerciseId = moduleIdFromSlug(modulo);
    const course = courses.find(item => item.id === exerciseId);
    if (course && !course.available) return <ComingSoon title={course.title}/>;
    return <PracticeView key={`${modulo}:${leccion}`} mode={mode}/>;
}

function PracticeView({ mode }: { mode: Mode }) {
    const { modulo, leccion } = useParams();
    const exerciseId = moduleIdFromSlug(modulo);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasPractice = (course: typeof courses[number]) => course.lessons.some(lesson => lesson.type === 'practice');
    const activeModule = courses.find(course => course.id === exerciseId && hasPractice(course)) ?? courses.find(course => course.id === 'fingering')!;
    // La sesión del plan sigue al pasar entre Objetivo y Ejercicio.
    const search = searchParams.toString();
    const practiceLessons = activeModule.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice');
    const activeExercise = practiceLessons.find(lesson => lesson.id === lessonIdFromSlug(activeModule.id, leccion)) ?? practiceLessons[0];
    const study = practiceStudies[activeExercise.id];
    // Sesión del plan (?session): se repiten las rondas hasta completar el tiempo; «Siguiente lección» no la corta.
    const planSession = usePlanSession();
    const account = useAccount();
    const introSeen = usePracticeIntroSeen();
    const [showIntro, setShowIntro] = useState(false);
    const session = searchParams.has('sesion') ? planSession : null;
    const sessionEnd = session ? session.startedAt + session.minutes * 60_000 : 0;
    const sessionRef = useRef(session);
    useEffect(() => { sessionRef.current = session; }, [session]);
    const nextInPlan = (() => {
        if (!account?.level) return null;
        const lessons = planFor(account.level).flatMap(block => block.lessons.map(lesson => ({ moduleId: block.moduleId, lesson })));
        const index = lessons.findIndex(item => item.lesson.id === activeExercise.id);
        return lessons.length > 1 ? lessons[(index + 1) % lessons.length] : null;
    })();
    useEffect(() => { setLastExercise({ moduleId: activeModule.id, exerciseId: activeExercise.id }); }, [activeModule.id, activeExercise.id]);
    const pattern = study?.pattern ?? PATTERN;
    const picks = pickingOf(pattern, study?.picking, study?.legatoFrom);
    const figure = study?.figure ?? 'negras';
    const perRow = study?.perRow ?? 16;
    // Filas de la tablatura: cada parte empieza en una fila nueva (con su título) aunque la anterior no se haya llenado.
    const bars: { notes: PatternNote[]; start: number; columns: number; part?: { number: number; title: string } }[] = [];
    let offset = 0;
    for (const [sectionIndex, section] of (study?.sections ?? [{ title: undefined, pattern }]).entries()) {
        for (let at = 0; at < section.pattern.length; at += perRow) {
            const notes = section.pattern.slice(at, at + perRow);
            bars.push({ notes, start: offset + at, columns: notes.length >= 6 ? notes.length : perRow, part: at === 0 && section.title ? { number: sectionIndex + 1, title: section.title } : undefined });
        }
        offset += section.pattern.length;
    }
    // Una fila incompleta con 6 notas o más las reparte en todo el ancho; con menos, quedan alineadas con las filas completas.
    const tabColumns = (count: number) => ({ gridTemplateColumns: `25px repeat(${count}, 1fr)` });
    const [bpm, setBpm] = useState(study?.bpm ?? 100);
    const [phase, setPhase] = useState<Phase>('idle');
    const [round, setRound] = useState(1);
    const [rounds, setRounds] = useState(1);
    const [finished, setFinished] = useState<{ rounds: number; bpm: number; seconds: number; sessionMinutes?: number; progress: SummaryProgress | null } | null>(null);
    const startedAt = useRef(0);
    const [startedAtView, setStartedAtView] = useState(0);
    const closeSummary = useCallback(() => setFinished(null), []);
    // Al cambiar de ejercicio vuelve al valor por defecto de su tablatura.
    const [roundsFor, setRoundsFor] = useState(activeExercise.id);
    if (roundsFor !== activeExercise.id) {
        setRoundsFor(activeExercise.id);
        setBpm(study?.bpm ?? 100);
        setRounds(1);
        setFinished(null);
    }
    const roundsRef = useRef(rounds);
    useEffect(() => { roundsRef.current = rounds; }, [rounds]);
    const [count, setCount] = useState(-1);
    const [pulse, setPulse] = useState(0);
    useEffect(() => {
        if (phase !== 'countdown') return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = overflow; };
    }, [phase]);
    const [step, setStep] = useState(-1);
    const [listening, setListening] = useState(false);
    const active = phase !== 'idle';
    const cancelRef = useRef<(() => void) | null>(null);
    const bpmRef = useRef(bpm);
    useEffect(() => {
        bpmRef.current = bpm;
        if (cancelRef.current) setRoundBpm(bpm);
    }, [bpm]);
    const phaseRef = useRef(phase);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    // Cada ronda: cuenta de entrada → patrón con metrónomo.
    // Escuchar: una ronda con guitarra, sin cuenta. Práctica: las rondas elegidas (1, 3, 5, 7 o 10).
    const runRound = (number: number, listen: boolean) => {
        setRound(number);
        setStep(-1);
        setCount(-1);
        setPhase(listen ? 'playing' : 'countdown');
        cancelRef.current = scheduleRound(bpmRef.current, pattern, {
            // El metrónomo siempre marca negras (un clic por pulso), sin importar la figura de la tablatura.
            notesPerBeat: FIGURES[figure].notesPerBeat,
            guide: listen,
            countIn: !listen,
            onCount: value => { setCount(value); setPulse(beat => beat + 1); },
            onStep: index => { setPhase('playing'); setStep(index); },
            onEnd: () => {
                if (listen) { stop(); return; }
                const current = sessionRef.current;
                if (current) {
                    // En sesión: rondas sin fin hasta que se acabe el tiempo; la ronda en curso siempre termina.
                    if (now() < current.startedAt + current.minutes * 60_000) { runRound(number + 1, false); return; }
                    stop(); completeSessionToday(); setPlanSession(null);
                    finish(number, { sessionMinutes: current.minutes, seconds: (now() - current.startedAt) / 1000 });
                    return;
                }
                if (number >= roundsRef.current) { stop(); finish(number); return; }
                runRound(number + 1, false);
            },
        });
    };
    // Al salir el resumen se registra la práctica (solo con sesión iniciada); el modal muestra los minutos sumados.
    const finish = (rounds: number, session?: { sessionMinutes: number; seconds: number }) => {
        const endedAt = new Date();
        const startedAtDate = new Date(startedAt.current);
        const seconds = (endedAt.getTime() - startedAtDate.getTime()) / 1000;
        setFinished({ rounds, bpm: bpmRef.current, seconds: session?.seconds ?? seconds, sessionMinutes: session?.sessionMinutes, progress: null });
        if (!account) return;
        recordPractice(activeExercise.id);
        const goalMinutes = account.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
        const before = todayOf(getProgress());
        setFinished(value => value && { ...value, progress: { beforeSeconds: before?.seconds ?? 0, addedSeconds: seconds, goalMinutes, completedBefore: before?.completed ?? false } });
        recordFinishedPractice({ name: account.name, level: account.level, sessionMinutes: goalMinutes, lessonId: activeExercise.id, startedAt: startedAtDate, endedAt, rounds, bpm: bpmRef.current })
            .catch(() => setFinished(value => value && { ...value, progress: null }));
    };
    const start = async (listen: boolean) => {
        setFinished(null);
        setListening(listen);
        setPhase('loading');
        try { await prepare(); } catch { setPhase('idle'); return; }
        startedAt.current = now();
        setStartedAtView(startedAt.current);
        runRound(1, listen);
    };
    const stop = () => { cancelRef.current?.(); cancelRef.current = null; setStep(-1); setRound(1); setPhase('idle'); };
    // Detener a mano corta la sesión: ese día no cuenta (no pasa nada). Salir de la página, en cambio, no la borra.
    const userStop = () => { if (sessionRef.current) setPlanSession(null); stop(); };
    const goNext = () => {
        if (!nextInPlan || !sessionRef.current) return;
        stop();
        setPlanSession({ ...sessionRef.current, autostart: true });
        navigate(exerciseUrl(nextInPlan.moduleId, nextInPlan.lesson.id, 'sesion'));
    };

    const stopRef = useRef(stop);
    const startRef = useRef(start);
    const userStopRef = useRef(userStop);
    useEffect(() => { stopRef.current = stop; startRef.current = start; userStopRef.current = userStop; });
    // Al abrir una lección de la sesión, arranca sola. Se difiere un tick y se cancela en la limpieza:
    // así, si React monta dos veces (StrictMode en desarrollo), solo arranca el montaje que se queda.
    useEffect(() => {
        if (!searchParams.has('sesion') || !getPlanSession()?.autostart) return;
        const id = setTimeout(() => {
            const current = getPlanSession();
            if (!current?.autostart) return;
            setPlanSession({ ...current, autostart: false });
            void startRef.current(false);
        }, 0);
        return () => clearTimeout(id);
    }, [searchParams]);
    // Al salir de la página se corta el sonido.
    useEffect(() => () => stopRef.current(), []);
    // Escape detiene la práctica.
    useEffect(() => {
        if (!active) return;
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') userStopRef.current(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active]);

    // Scroll automático: mantiene centrada la fila de la tablatura que está sonando.
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Durante la cuenta de entrada se muestra la primera fila.
    const currentRow = phase === 'countdown' ? 0 : step < 0 ? -1 : bars.filter(bar => bar.start <= step).length - 1;
    useEffect(() => {
        // Con el selector abierto no se desplaza: el navegador cierra la lista de opciones al hacer scroll.
        if (currentRow >= 0 && !(document.activeElement instanceof HTMLSelectElement)) rowRefs.current[currentRow]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [currentRow]);

    // Cabecera fija: aparece mientras suena y la cabecera del ejercicio ya salió de la pantalla, debajo del header de la app (h-16).
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerHidden, setHeaderHidden] = useState(false);
    useEffect(() => {
        const element = headerRef.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => setHeaderHidden(!entry.isIntersecting));
        observer.observe(element);
        return () => observer.disconnect();
    }, [mode]);
    // La barra fija se alinea con la tarjeta del ejercicio (la columna de contenido, no toda la ventana).
    const sectionRef = useRef<HTMLElement | null>(null);
    const [barBox, setBarBox] = useState({ left: 0, width: 0 });
    const showBar = active && phase !== 'loading' && headerHidden;
    useEffect(() => {
        if (!showBar) return;
        const measure = () => {
            const rect = sectionRef.current?.getBoundingClientRect();
            if (rect) setBarBox({ left: rect.left, width: rect.width });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [showBar]);
    // Escuchar va primero: así nadie empieza a practicar sin haber oído el ejercicio.
    const startChoices = <>
        <Button onClick={() => start(true)} className="min-w-40"><Headphones size={16}/>Escuchar ejercicio</Button>
        <Button variant="secondary" onClick={() => introSeen ? start(false) : setShowIntro(true)}><Play size={16} fill="currentColor"/>Practicar</Button>
    </>;
    const playingInfo = <span className="text-sm text-muted">{listening ? <span className="inline-flex items-center gap-1.5"><Headphones size={15}/>Escuchando</span> : session ? <>Sesión de {session.minutes} min · ronda <b className="text-fg-soft">{round}</b></> : <>Ronda <b className="text-fg-soft">{round} de {rounds}</b></>} · <b className="text-fg-soft">{bpm} BPM</b></span>;
    const nextButton = session && nextInPlan && !listening ? <Button variant="secondary" onClick={goNext} title={nextInPlan.lesson.title}><SkipForward size={15}/>Siguiente lección</Button> : null;
    const stopButton = <Button variant="secondary" onClick={userStop} className="min-w-40"><Square size={15}/>Detener <kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs text-muted">Esc</kbd></Button>;

    const tempoSelect = <label className="flex items-center gap-2 text-sm text-muted"><Gauge size={16}/><span className="sr-only">Velocidad</span>
        <select value={bpm} onChange={event => { setBpm(Number(event.target.value)); event.target.blur(); }} className="min-h-10 py-1.5 font-bold text-fg">
            {tempos.map(item => <option key={item.bpm} value={item.bpm}>{item.name} · {item.bpm} BPM</option>)}
        </select>
    </label>;

    // Duración de una ronda a un BPM fijo de referencia (no al elegido, para que el tope no cambie al mover la velocidad).
    const roundSeconds = pattern.length / FIGURES[figure].notesPerBeat / ROUNDS_REFERENCE_BPM * 60;
    const maxRounds = Math.min(MAX_ROUNDS[activeExercise.difficulty], Math.max(1, Math.floor(ROUNDS_BUDGET_SECONDS / roundSeconds)));
    const roundsGroup = <div role="radiogroup" aria-label="Rondas" className="flex items-center gap-2 text-sm text-muted"><Repeat size={15}/>Rondas
        <div className="flex overflow-hidden rounded-md border border-line-strong">
            {ROUND_OPTIONS.map(option => {
                const selected = rounds === option;
                const disabled = option > maxRounds;
                return <button key={option} type="button" role="radio" aria-checked={selected} aria-label={`${option} ${option === 1 ? 'ronda' : 'rondas'}`} disabled={disabled} onClick={() => setRounds(option)}
                    className={cn('min-h-9 min-w-9 border-l border-line-strong px-2.5 font-mono font-bold transition first:border-l-0', selected ? 'bg-brand text-white' : disabled ? 'cursor-not-allowed text-muted/40' : 'text-fg-soft hover:bg-white/5')}>{option}</button>;
            })}
        </div>
    </div>;

    return <>
        <BackLink to={moduleUrl(activeModule.id)}>{activeModule.title}</BackLink>
        <PageTitle eyebrow={activeModule.category} title={activeExercise.title} text={activeExercise.description}/>
        {activeExercise.artist && <ArtistCredit id={activeExercise.artist}/>}


        <div role="tablist" aria-label="Modo" className="flex border-b border-line">
            {(['goal', 'practice'] as const).map(value => {
                const { label, icon: Icon } = modeInfo[value];
                const selected = mode === value;
                return <Link key={value} to={value === 'goal' ? lessonUrl(activeModule.id, activeExercise.id) : exerciseUrl(activeModule.id, activeExercise.id, search)} role="tab" aria-selected={selected} aria-disabled={active} className={cn(
                    '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition aria-disabled:pointer-events-none aria-disabled:opacity-50',
                    selected ? 'border-violet text-accent-strong' : 'border-transparent text-muted hover:text-fg',
                )}><Icon size={16}/>{label}</Link>;
            })}
        </div>
        <Caption className="mt-3 mb-6">{modeInfo[mode].text}</Caption>


        {mode === 'goal' && <Card>
            <h2 className="mb-3">Objetivo técnico</h2>
            <p className="text-sm leading-relaxed text-muted">{activeExercise.goal}</p>
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
            <LinkButton className="mt-8" to={exerciseUrl(activeModule.id, activeExercise.id, search)}>Ir al ejercicio</LinkButton>
        </Card>}

        {mode !== 'goal' && <div className="flex flex-col gap-6">
            <section ref={sectionRef} className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-card">
                <div ref={headerRef}>
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
                    <div className="min-w-0">
                        <Eyebrow>{activeModule.title.toUpperCase()}</Eyebrow>
                        <h2 className="mt-2 flex items-center gap-3 text-[1.1875rem]">{activeExercise.title}<DifficultySignal difficulty={activeExercise.difficulty}/></h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {active && phase !== 'loading' ? <>{session && !listening ? <Remaining until={sessionEnd}/> : <Elapsed since={startedAtView}/>}{nextButton}{stopButton}</> : tempoSelect}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 xl:px-5.5">
                    {phase === 'idle'
                        ? <>
                            {startChoices}
                        </>
                        : phase === 'loading'
                            ? <Button disabled className="min-w-40"><Loader2 size={17} className="animate-spin"/>Cargando sonido…</Button>
                            : playingInfo}
                    {!active && <div className="ml-auto flex flex-wrap items-center gap-3 text-sm text-muted">{session ? <span>Sesión de <b className="text-fg-soft">{session.minutes} min</b>: las rondas se repiten hasta completar el tiempo</span> : roundsGroup}</div>}
                </div>
                </div>
                {showBar && createPortal(<div style={{ left: barBox.left, width: barBox.width }} className="fixed top-16 z-20 rounded-b-xl border border-t-0 border-line bg-card/90 shadow-[0_8px_30px_#0007] backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 md:px-6">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-fg">{activeExercise.title}</p>
                            {playingInfo}
                        </div>
                        {session && !listening ? <Remaining until={sessionEnd}/> : <Elapsed since={startedAtView}/>}
                        {nextButton}
                        {stopButton}
                    </div>
                </div>, document.body)}
                {showIntro && <PracticeIntro onCancel={() => setShowIntro(false)} onStart={dontShowAgain => { setShowIntro(false); if (dontShowAgain) setPracticeIntroSeen(true); start(false); }}/>}
                {phase === 'idle' && finished && <PracticeSummary {...finished} onClose={closeSummary}/>}
                <p className="border-t border-line px-5 py-3 text-xs text-muted"><b className="text-fg-soft">{FIGURES[figure].label}</b> · {study?.notation ?? 'Púa alternada · Dedos 1–2–3–4 = trastes 5–6–7–8'}</p>
                <div className="relative overflow-auto border-t border-line bg-sunken px-4 pt-9 pb-5 md:px-6">
                    <div className="flex min-w-180 flex-col gap-8" aria-label={`Tablatura: ${activeExercise.title}. ${FIGURES[figure].label}.`}>
                        {bars.map((bar, barIndex) => <div key={barIndex} ref={element => { rowRefs.current[barIndex] = element; }}>
                            {/* Encabezado de parte al estilo de una partitura: marca de ensayo en recuadro y título en cursiva. */}
                            {bar.part && <h3 className={cn('mb-4 flex items-center gap-3', barIndex > 0 && 'mt-4')}>
                                <span className="grid size-8 shrink-0 place-items-center rounded-[3px] border-2 border-fg-soft font-serif text-lg font-bold text-fg">{bar.part.number}</span>
                                <span className="font-serif text-lg font-normal text-fg italic">{bar.part.title}</span>
                                <span aria-hidden className="h-px flex-1 bg-line-strong"/>
                            </h3>}
                            {/* Ataque de cada nota: ⊓ abajo · V arriba · h hammer-on · p pull-off (según el estudio, `pickingOf`). */}
                            <div style={tabColumns(bar.columns)} className="mb-1 grid text-center text-sm text-accent-strong" aria-label="Dirección de púa"><span/>{bar.notes.map((_, index) => { const stroke = STROKES[picks[bar.start + index]]; return <span key={index} title={stroke.title} className={cn(stroke.legato && 'font-serif text-fg-soft italic')}>{stroke.mark}</span>; })}</div>
                            {strings.map((name, row) => <div key={name} style={tabColumns(bar.columns)} className={cn('relative grid h-7 items-center font-mono before:absolute before:right-0 before:left-8 before:bg-[#58709a55]', row === 5 ? 'before:h-0.5' : 'before:h-px')}>
                                <b className="text-sm text-muted">{name}</b>
                                {bar.notes.map((note, index) => {
                                    const noteIndex = bar.start + index;
                                    const playing = step === noteIndex;
                                    // Ligado con la nota anterior de la misma cuerda (en la misma fila): arco para hammer-on/pull-off, línea para slide.
                                    const previous = bar.notes[index - 1];
                                    const tie = note.string === row + 1 && previous?.string === note.string ? picks[noteIndex] : undefined;
                                    return <span key={index} className="relative grid justify-items-center">
                                        {(tie === 'hammer' || tie === 'pull') && <span aria-hidden className="absolute -top-1.5 right-1/2 z-20 h-2.5 w-full rounded-t-full border-x-[1.5px] border-t-[1.5px] border-accent/70"/>}
                                        {tie === 'slide' && <svg aria-hidden className="absolute top-1/2 right-1/2 z-20 h-3 w-full -translate-y-1/2 text-accent/80" preserveAspectRatio="none" viewBox="0 0 10 10"><line x1="3" x2="7" y1={note.fret > previous.fret ? 9 : 1} y2={note.fret > previous.fret ? 1 : 9} stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg>}
                                        <span className={cn('z-10 px-1 text-base', note.string === row + 1 ? (playing ? 'rounded-[5px] bg-linear-135 from-brand to-brand-strong text-white shadow-[0_0_22px_#e0662f4a]' : 'bg-sunken text-fg-soft') : 'invisible')}>{note.fret}</span>
                                    </span>;
                                })}
                            </div>)}
                        </div>)}
                    </div>
                </div>
                {/* Cuenta de entrada: pantalla completa con el fondo borroso.
                    Va en <body> porque el `transform` animado de <main> encerraría un `fixed`. */}
                {phase === 'countdown' && createPortal(<div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-sunken/60 px-6 text-center backdrop-blur-md">
                    {count < 0
                        ? <span key={pulse} className="block size-28 animate-pop rounded-full bg-violet/60 shadow-[0_0_80px_#e0662f88] md:size-36"/>
                        : <span key={pulse} className={cn('block animate-pop font-black leading-none text-accent-strong', count > 0 ? 'text-[9rem] md:text-[12rem]' : 'text-6xl md:text-7xl')}>{count > 0 ? count : `Ronda ${round}`}</span>}
                    <div>
                        <p className="text-2xl font-bold md:text-3xl">{count < 0 ? FIGURES[figure].perBeat : round === 1 ? 'Prepárate' : 'Siguiente ronda'}</p>
                        <p className="mx-auto mt-3 max-w-md font-serif text-lg text-fg-soft italic md:text-xl">{MOTIVATION[(round - 1) % MOTIVATION.length]}</p>
                        <p className="mt-3 text-sm text-muted"><kbd className="rounded border border-line-strong px-1.5 font-mono text-xs">Esc</kbd> para cancelar</p>
                    </div>
                </div>, document.body)}
            </section>
        </div>}
    </>;
}
