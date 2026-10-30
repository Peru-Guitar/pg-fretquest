'use client';

import { lessonTabHash } from '@/data/artists';
import { exerciseUrl, lessonIdFromSlug, lessonUrl, moduleIdFromSlug, moduleUrl } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { rhythmSummary } from '@/lib/rhythm';
import { createLocalStore } from '@/lib/localStore';
import { FIGURES, pickingOf, practiceStudies, speedName, speedPlan, type Speed, type Stroke } from '@/data/practiceStudies';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollLock } from '@/lib/scrollLock';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from '@/lib/router';
import { courses, type PracticeLesson } from '@/data/questMock';
import { BookOpen, ChevronLeft, ChevronRight, CircleCheck, Gauge, Headphones, Loader2, Mic, Music, Play, Repeat, Save, SkipForward, Square, Target, Trash2, X } from 'lucide-react';
import { Button, Caption, Card, Eyebrow } from '@/components/ui';
import { ModuleHero } from '@/components/quest/ModuleHero';
import { cn } from '@/lib/cn';
import { prepare } from '@/lib/audio/guitar';
import { scheduleRound, setRoundBpm, type PatternNote } from '@/lib/audio/practiceRound';
import { setLastExercise } from '@/lib/progress';
import { PracticeField, PracticeIntro, PracticeOption } from '@/components/practice/PracticeIntro';
import { RichSelect, SpeedSelect, type RichOption } from '@/components/practice/SpeedSelect';
import { InputLevel, RoundRecordings } from '@/components/practice/RoundRecordings';
import { usePracticeRecorder } from '@/lib/audio/practiceRecorder';
import { completeSessionToday, DEFAULT_SESSION_MINUTES, getPlanSession, levelLabel, planFor, recordPractice, setPlanSession, useAccount, usePlanSession } from '@/lib/account';
import { ArtistCredit } from '@/components/quest/ArtistCredit';
import { PracticeSummary, type SummaryProgress } from '@/components/practice/PracticeSummary';
import { getProgress, recordFinishedPractice, todayOf } from '@/lib/progressDb';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { useCommunity } from '@/lib/community';
import { PeopleThisWeek } from '@/components/quest/QuestUI';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
const now = () => Date.now();
/** Guitarra de guía al practicar: prendida por defecto y recordada en este navegador. */
const practiceGuideStore = createLocalStore('fq-practice-guide', true);
/** Marca de ataque sobre cada nota de la tablatura. */
const STROKES: Record<Stroke, { mark: string; title: string; legato?: boolean }> = { down: { mark: '⊓', title: 'Downstroke' }, up: { mark: 'V', title: 'Upstroke' }, hammer: { mark: 'h', title: 'Hammer-on', legato: true }, pull: { mark: 'p', title: 'Pull-off', legato: true }, slide: { mark: 's', title: 'Slide', legato: true }, tap: { mark: 'T', title: 'Tapping' }, rest: { mark: '𝄽', title: 'Silencio' } };
/** Medida del bend como se escribe en tablatura: ½ = medio tono, full = un tono. */
const bendLabel = (semitones: number) => semitones === 1 ? '½' : semitones === 2 ? 'full' : semitones === 3 ? '1½' : `${semitones / 2}`;
// Rondas por práctica; siempre empieza en 1.
const ROUND_OPTIONS: RichOption<number>[] = [
    { value: 1, badge: '1', title: '1 ronda', detail: 'Una pasada completa' },
    { value: 3, badge: '3', title: '3 rondas', detail: 'Calentamiento corto' },
    { value: 5, badge: '5', title: '5 rondas', detail: 'Práctica estándar' },
    { value: 7, badge: '7', title: '7 rondas', detail: 'Para fijar el patrón' },
    { value: 10, badge: '10', title: '10 rondas', detail: 'Resistencia' },
];
/** Fuerza de la guitarra de guía al practicar: apenas una referencia bajo el metrónomo. */
const GUIDE_VELOCITY = 0.08;
/**
 * TODO(deuda técnica): grabación por ronda apagada hasta pulirla. Pendiente:
 * - Probarla con interfaces de varios canales (p. ej. Quad Cortex): el navegador solo toma los canales 1/2,
 *   que pueden traer la señal seca (DI) en vez de la procesada.
 * - Con parlantes, el micrófono capta la guía por el aire (solo la mezcla digital la excluye).
 * - Revisar el flujo completo en el navegador: permiso, cambio de entrada, tomas al detener a mano, Safari/iOS.
 * Con `true` vuelve la opción «Grabar cada ronda» en la preparación; el resto ya está conectado.
 */
const RECORDING_ENABLED = false;
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
    // Quiénes practicaron esta lección esta semana (datos y caché de Comunidad).
    const { data: community } = useCommunity(account !== null);
    const practicing = community?.byLesson[activeExercise.id] ?? [];
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
    const baseFigure = study?.figure ?? 'negras';
    const suggestedSpeed = study?.speed ?? 2;
    // Velocidad: el nivel elegido decide la figura (en las lecciones en corcheas) y el BPM.
    const [speed, setSpeed] = useState<Speed>(suggestedSpeed);
    const { figure, bpm } = speedPlan(baseFigure, speed, study?.originalBpm);
    const perRow = study?.perRow ?? 16;
    const rhythmLabel = rhythmSummary(pattern, FIGURES[figure].label.split(' · ')[0], FIGURES[figure].notesPerBeat);
    // Filas de la tablatura: cada parte empieza en una fila nueva (con su título) aunque la anterior no se haya llenado.
    const bars: { notes: PatternNote[]; start: number; columns: number; part?: { number: number; title: string } }[] = [];
    let offset = 0;
    for (const [sectionIndex, section] of (study?.sections ?? [{ title: undefined, pattern }]).entries()) {
        for (let at = 0; at < section.pattern.length; at += perRow) {
            // Una o dos notas sueltas al final no hacen fila propia: se suman a la anterior.
            const rest = section.pattern.length - at - perRow;
            const merge = rest > 0 && rest <= 2;
            const notes = section.pattern.slice(at, merge ? section.pattern.length : at + perRow);
            bars.push({ notes, start: offset + at, columns: notes.length >= 6 ? notes.length : perRow, part: at === 0 && section.title ? { number: sectionIndex + 1, title: section.title } : undefined });
            if (merge) break;
        }
        offset += section.pattern.length;
    }
    // Una fila incompleta con 6 notas o más las reparte en todo el ancho; con menos, quedan alineadas con las filas completas.
    const tabColumns = (count: number) => ({ gridTemplateColumns: `25px repeat(${count}, 1fr)` });
    const [phase, setPhase] = useState<Phase>('idle');
    const [round, setRound] = useState(1);
    const suggestedRounds = activeExercise.rounds ?? 1;
    const [rounds, setRounds] = useState(suggestedRounds);
    const [finished, setFinished] = useState<{ rounds: number; speed: Speed; bpm: number; seconds: number; sessionMinutes?: number; progress: SummaryProgress | null } | null>(null);
    const startedAt = useRef(0);
    const [startedAtView, setStartedAtView] = useState(0);
    // Grabación opcional, una toma por ronda: en memoria, se escucha al final y se borra al cerrar el resumen.
    const recorder = usePracticeRecorder();
    const { clear: clearTakes, startTake } = recorder;
    const [record, setRecord] = useState(false);
    // Entrada de audio elegida para grabar ("" = la predeterminada). No se guarda: cada visita parte de la predeterminada.
    const [inputId, setInputId] = useState('');
    const closeSummary = useCallback(() => { setFinished(null); clearTakes(); }, [clearTakes]);
    // Nota elegida en la tablatura: Reproducir empieza desde ahí (Practicar siempre toca el patrón completo).
    const [from, setFrom] = useState<number | null>(null);
    // Al cambiar de ejercicio vuelve al valor por defecto de su tablatura.
    const [roundsFor, setRoundsFor] = useState(activeExercise.id);
    if (roundsFor !== activeExercise.id) {
        setRoundsFor(activeExercise.id);
        setSpeed(suggestedSpeed);
        setRounds(suggestedRounds);
        setFinished(null);
        setFrom(null);
    }
    const roundsRef = useRef(rounds);
    useEffect(() => { roundsRef.current = rounds; }, [rounds]);
    const [count, setCount] = useState(-1);
    const [pulse, setPulse] = useState(0);
    useScrollLock(phase === 'countdown');
    const [step, setStep] = useState(-1);
    const [listening, setListening] = useState(false);
    // Guitarra de guía al practicar: muy bajita (al escuchar suena normal). Prendida por defecto; se recuerda.
    const practiceGuide = practiceGuideStore.use();
    const setPracticeGuide = practiceGuideStore.set;
    const practiceGuideRef = useRef(practiceGuide);
    useEffect(() => { practiceGuideRef.current = practiceGuide; }, [practiceGuide]);
    const active = phase !== 'idle';
    // Practicar (no Reproducir) se muestra en su propia pantalla completa: la tablatura gana todo el espacio.
    const stage = active && !listening;
    useScrollLock(stage);
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
        const offset = listen ? from ?? 0 : 0;
        cancelRef.current = scheduleRound(bpmRef.current, pattern.slice(offset), {
            // El metrónomo siempre marca negras (un clic por pulso), sin importar la figura de la tablatura.
            notesPerBeat: FIGURES[figure].notesPerBeat,
            guide: listen || practiceGuideRef.current,
            guideVelocity: listen ? undefined : GUIDE_VELOCITY,
            countIn: !listen,
            onCount: value => { setCount(value); setPulse(beat => beat + 1); },
            onStep: index => { setPhase('playing'); setStep(index + offset); },
            onEnd: () => {
                if (listen) { stop(); return; }
                recorder.endTake();
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
    // Cada ronda se graba desde que suena (sin la cuenta de entrada) hasta su final.
    useEffect(() => { if (phase === 'playing' && !listening) startTake(round); }, [phase, listening, round, startTake]);
    // Con «Grabar», la entrada se abre en la preparación (al activarla o al volver a abrirla) para ver que llega señal.
    const openIntro = () => { setShowIntro(true); if (record) void recorder.open(inputId); };
    const closeIntro = () => { setShowIntro(false); recorder.close(); };
    const toggleRecord = (value: boolean) => { setRecord(value); if (value) void recorder.open(inputId); else recorder.close(); };
    const changeInput = (id: string) => { setInputId(id); void recorder.open(id); };
    // Una práctica nueva borra las tomas anteriores y la nota elegida en la tablatura (practicar siempre es desde el inicio).
    const startPractice = () => {
        recorder.clear();
        setFrom(null);
        setShowIntro(false);
        void start(false);
    };
    // Al salir el resumen se registra la práctica (solo con sesión iniciada); el modal muestra los minutos sumados.
    const finish = (rounds: number, session?: { sessionMinutes: number; seconds: number }) => {
        const endedAt = new Date();
        const startedAtDate = new Date(startedAt.current);
        const seconds = (endedAt.getTime() - startedAtDate.getTime()) / 1000;
        setFinished({ rounds, speed, bpm: bpmRef.current, seconds: session?.seconds ?? seconds, sessionMinutes: session?.sessionMinutes, progress: null });
        if (!account) return;
        recordPractice(activeExercise.id);
        const goalMinutes = account.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
        const before = todayOf(getProgress());
        setFinished(value => value && { ...value, progress: { beforeSeconds: before?.seconds ?? 0, addedSeconds: seconds, goalMinutes, completedBefore: before?.completed ?? false } });
        recordFinishedPractice({ name: account.name, level: account.level, sessionMinutes: goalMinutes, lessonId: activeExercise.id, startedAt: startedAtDate, endedAt, rounds, speed, bpm: bpmRef.current })
            .catch(() => setFinished(value => value && { ...value, progress: null }));
    };
    const start = async (listen: boolean) => {
        setFinished(null);
        setListening(listen);
        setCount(-1);
        setPhase('loading');
        try { await prepare(); } catch { setPhase('idle'); return; }
        startedAt.current = now();
        setStartedAtView(startedAt.current);
        runRound(1, listen);
    };
    const stop = () => { cancelRef.current?.(); cancelRef.current = null; if (!listening) recorder.close(); setStep(-1); setRound(1); setPhase('idle'); };

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
    // Espacio reproduce el ejercicio (desde la nota elegida, si hay una); Practicar se inicia solo con su botón.
    // Escape quita la nota elegida: Reproducir vuelve a empezar desde el inicio.
    useEffect(() => {
        if (active) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setFrom(null); return; }
            if (event.key !== ' ' || event.repeat || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
            event.preventDefault();
            void startRef.current(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active]);
    // Escape detiene (al escuchar y al practicar). Espacio no hace nada mientras suena: no se detiene por accidente.
    useEffect(() => {
        if (!active) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === ' ' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) event.preventDefault();
            if (event.key === 'Escape') userStopRef.current();
        };
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

    // Cabecera fija: aparece mientras suena y la cabecera del ejercicio ya salió de la pantalla. Va pegada arriba; en móvil,
    // debajo del header de la app (h-16), que ahí es sticky.
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerHidden, setHeaderHidden] = useState(false);
    useEffect(() => {
        const element = headerRef.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => setHeaderHidden(!entry.isIntersecting), { rootMargin: window.matchMedia("(min-width: 768px)").matches ? "0px" : "-64px 0px 0px 0px" });
        observer.observe(element);
        return () => observer.disconnect();
    }, [mode, stage]);
    // La barra fija se alinea con la tarjeta del ejercicio (la columna de contenido, no toda la ventana).
    const sectionRef = useRef<HTMLElement | null>(null);
    const [barBox, setBarBox] = useState({ left: 0, width: 0 });
    const showBar = active && !stage && phase !== 'loading' && headerHidden;
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
        <Button onClick={() => start(true)} className="flex-1 sm:min-w-40 sm:flex-none"><Headphones size={16}/>Reproducir <kbd className="hidden rounded border border-white/40 px-1.5 font-mono text-3xs font-normal sm:inline">Espacio</kbd></Button>
        <Button variant="secondary" className="flex-1 sm:min-w-40 sm:flex-none" onClick={openIntro}><Play size={16} fill="currentColor"/>Practicar</Button>
    </>;
    const playingInfo = <span className="text-sm text-muted">{listening ? <span className="inline-flex items-center gap-1.5"><Headphones size={15}/>Escuchando</span> : session ? <>Sesión de {session.minutes} min · ronda <b className="text-fg-soft">{round}</b></> : <>Ronda <b className="text-fg-soft">{round} de {rounds}</b></>} · <b className="text-fg-soft">{speedName(speed)} · {bpm} BPM</b>{recorder.recording && <> · <span className="inline-flex items-center gap-1.5 font-bold text-danger"><span className="size-2 animate-pulse rounded-full bg-danger"/>REC</span></>}</span>;
    const nextButton = session && nextInPlan && !listening ? <Button variant="secondary" onClick={goNext} title={nextInPlan.lesson.title}><SkipForward size={15}/>Siguiente lección</Button> : null;
    const stopButton = <Button variant="secondary" onClick={userStop} className="min-w-40"><Square size={15}/>Detener <kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs text-muted">Esc</kbd></Button>;

    const tempoSelect = <SpeedSelect value={speed} onChange={setSpeed} figure={baseFigure} originalBpm={study?.originalBpm} suggested={suggestedSpeed}/>;

    const roundsSelect = <RichSelect label="Rondas" options={ROUND_OPTIONS} value={rounds} onChange={setRounds} suggested={suggestedRounds} full/>;

    // La misma tarjeta del ejercicio; al practicar va en una capa a pantalla completa (en <body>, por el `transform` de <main>).
    const inStage = (content: ReactNode) => stage
        // Mientras suena no hay scroll a mano: la tablatura baja sola siguiendo la nota (el scroll automático sí funciona).
        ? createPortal(<div role="region" aria-label="Modo práctica" className={cn('fixed inset-0 z-40 bg-canvas p-3 md:p-6', phase === 'playing' ? 'overflow-hidden' : 'overflow-y-auto')}>{content}</div>, document.body)
        : content;

    return <>
        <ModuleHero image={activeModule.image} back={{ to: moduleUrl(activeModule.id) + lessonTabHash(activeModule.lessons, activeExercise.id), label: activeModule.title }} eyebrow="Práctica" title={activeExercise.title} text={activeExercise.description}
            stats={[['Lección', `${activeModule.lessons.indexOf(activeExercise) + 1} de ${activeModule.lessons.length}`], ['Dificultad', levelLabel(activeExercise.difficulty)]]}/>
        {activeExercise.artist && <ArtistCredit id={activeExercise.artist} transcribedBy={activeExercise.transcribedBy}/>}


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


        {mode === 'goal' && <div className="flex flex-col gap-4">
            {/* Objetivo: una frase destacada y los datos clave en fichas. */}
            <section className="rounded-2xl border border-accent/30 bg-[linear-gradient(120deg,#232323,#151515)] p-5.5 xl:p-6.5">
                <span className="flex items-center gap-2 text-3xs font-bold tracking-[0.2em] text-accent"><Target size={15}/>OBJETIVO</span>
                <p className="mt-3 text-base leading-relaxed text-fg-soft">{activeExercise.goal}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">{[
                    [Gauge, `Velocidad sugerida: ${speedName(suggestedSpeed)}`],
                    [Repeat, `${suggestedRounds} ${suggestedRounds === 1 ? 'ronda' : 'rondas'}`],
                    [Music, rhythmLabel],
                ].map(([Icon, text]) => { const ChipIcon = Icon as typeof Gauge; return <span key={text as string} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white/3 px-3 py-1.5 text-fg-soft"><ChipIcon size={14} className="text-accent"/>{text as string}</span>; })}
                </div>
            </section>

            {study ? <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <h2 className="mb-4 text-md">Cómo tocarlo</h2>
                    <ol className="space-y-3">{study.steps.map((text, index) => <li key={text} className="flex gap-3 text-sm leading-relaxed text-fg-soft">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-2xs font-bold text-accent">{index + 1}</span>{text}
                    </li>)}</ol>
                </Card>
                <div className="flex flex-col gap-4">
                    <Card>
                        <h2 className="mb-4 text-md">Evita</h2>
                        <ul className="space-y-2.5">{study.mistakes.map(text => <li key={text} className="flex gap-2.5 text-sm leading-relaxed text-fg-soft"><X size={16} className="mt-0.5 shrink-0 text-danger"/>{text}</li>)}</ul>
                    </Card>
                    {/* El bloque (ícono + texto) se centra en la caja; el ícono queda arriba, a la altura del título. */}
                    <div className="flex flex-1 flex-col justify-center rounded-2xl border border-success/30 bg-success/5 p-5.5">
                        <div className="flex gap-3">
                            <CircleCheck size={20} className="mt-0.5 shrink-0 text-success"/>
                            <div><h2 className="mb-1 text-md">Avanza cuando</h2><p className="text-sm leading-relaxed text-fg-soft">{study.criterion}</p></div>
                        </div>
                    </div>
                </div>
            </div> : <Card><p className="text-sm text-muted">Esta lección usa un patrón cromático de ejemplo.</p></Card>}

            {/* Igual en todas las lecciones: cómo se practica en Fret Quest y cuándo se guarda el progreso. */}
            <Card>
                <h2 className="mb-5 text-md">Cómo practicar</h2>
                <ol className="grid gap-5 md:grid-cols-3">{[
                    [Headphones, 'Escúchalo y apréndelo', 'Escucha el ejercicio y practícalo hasta tenerlo.'],
                    [Gauge, 'Practica con lo sugerido', `Ya dominado, ve a velocidad ${speedName(suggestedSpeed)} · ${suggestedRounds} ${suggestedRounds === 1 ? 'ronda' : 'rondas'}. O empieza más lento: también cuenta.`],
                    [Save, 'Completa las rondas', 'Tu progreso se guarda solo al terminar todas las rondas, con sesión iniciada.'],
                ].map(([Icon, title, text], index) => { const StepIcon = Icon as typeof Gauge; return <li key={title as string} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-raised text-accent"><StepIcon size={19}/></span>
                    <div><p className="text-2xs font-mono text-muted">PASO {index + 1}</p><h3 className="text-sm font-bold">{title as string}</h3><p className="mt-1 text-xs leading-relaxed text-muted">{text as string}</p></div>
                </li>; })}</ol>
            </Card>

            <PeopleThisWeek title="Practicando esta semana" people={practicing}/>
        </div>}

        {mode !== 'goal' && <div className="flex flex-col gap-6">
            {inStage(<section ref={sectionRef} className={cn('relative min-w-0 overflow-hidden rounded-xl border border-line bg-card', stage && 'mx-auto w-full max-w-7xl')}>
                <div ref={headerRef} className={cn(stage && 'sticky top-0 z-20 bg-card')}>
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
                    <div className="min-w-0">
                        <Eyebrow>{activeModule.title.toUpperCase()}</Eyebrow>
                        <h2 className="mt-2 flex items-center gap-3 text-[1.1875rem]">{activeExercise.title}<DifficultySignal difficulty={activeExercise.difficulty}/></h2>
                    </div>
                    <div className={cn('flex flex-wrap items-center gap-3', !(active && phase !== 'loading') && 'w-full sm:w-auto')}>
                        {active && phase !== 'loading' ? <>{session && !listening ? <Remaining until={sessionEnd}/> : <Elapsed since={startedAtView}/>}{nextButton}{stopButton}</> : tempoSelect}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 xl:px-5.5">
                    {phase === 'idle'
                        ? <>
                            {startChoices}
                            {/* Nota elegida en la tablatura: se quita con Esc, con «Quitar» o tocándola otra vez. En móvil baja a su propia línea. */}
                            {from !== null && <p className="flex basis-full items-center gap-2 text-xs text-muted sm:ml-auto sm:basis-auto">
                                <span>Comenzar desde la nota <b className="text-accent">{pattern[from].fret}</b></span>
                                <span aria-hidden>·</span>
                                <button type="button" onClick={() => setFrom(null)} className="inline-flex items-center gap-1.5 text-fg-soft hover:text-fg">
                                    <kbd className="hidden rounded border border-line-strong px-1.5 font-mono text-3xs lg:inline">Esc</kbd>
                                    <span className="lg:hidden">Quitar</span><span className="hidden lg:inline">para quitar</span>
                                </button>
                            </p>}
                        </>
                        : phase === 'loading'
                            ? <Button disabled className="min-w-40"><Loader2 size={17} className="animate-spin"/>Cargando sonido…</Button>
                            : playingInfo}
                </div>
                </div>
                {showBar && createPortal(<div style={{ left: barBox.left, width: barBox.width }} className="fixed top-16 z-40 rounded-b-xl md:top-0 border border-t-0 border-line bg-card/90 shadow-[0_8px_30px_#0007] backdrop-blur-md">
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
                {showIntro && <PracticeIntro onCancel={closeIntro} onStart={startPractice} canStart={!record || recorder.status === 'ready'}>
                    {/* Velocidad y rondas: una por fila en móvil, en dos columnas desde sm. */}
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
                        <PracticeField label="Velocidad" icon={Gauge}>
                            <SpeedSelect value={speed} onChange={setSpeed} figure={baseFigure} originalBpm={study?.originalBpm} suggested={suggestedSpeed} full/>
                        </PracticeField>
                        {session
                            ? <div className="flex flex-col gap-1.5"><span className="flex items-center gap-1.5 text-2xs font-bold tracking-wider text-muted uppercase"><Repeat size={13}/>Sesión</span><p className="text-sm text-fg-soft"><b>{session.minutes} min</b>: rondas hasta completar el tiempo</p></div>
                            : <PracticeField label="Rondas" icon={Repeat}>{roundsSelect}</PracticeField>}
                    </div>
                    <PracticeOption icon={Headphones} title="Tablatura de guía, muy bajita" checked={practiceGuide} onChange={setPracticeGuide} 
                        note={practiceGuide ? 'La guía sonará por debajo del metrónomo.' : 'Una referencia suave por debajo del metrónomo.'}/>
                    {RECORDING_ENABLED && <>
                    <PracticeOption icon={Mic} title="Grabar cada ronda" checked={record} onChange={toggleRecord} warning={record && (recorder.status === 'denied' || recorder.status === 'none')}
                        note={!record ? 'Al terminar eliges una ronda y te escuchas: es la mejor forma de notar errores de tiempo y de limpieza. Queda solo en tu dispositivo y se borra al cerrar el resumen.'
                            : recorder.status === 'denied' ? 'No tenemos permiso para usar tu entrada de audio. Actívalo en el navegador e inténtalo de nuevo.'
                            : recorder.status === 'none' ? 'No encontramos ninguna entrada de audio. Conecta tu interfaz o micrófono.'
                            : 'Se graba tu entrada con el metrónomo; la guía no se graba. Con audífonos queda más limpio.'}/>
                    {record && recorder.status !== 'denied' && recorder.status !== 'none' && <div className="grid gap-3 rounded-xl border border-line bg-sunken/50 p-3.5">
                        <PracticeField label="Entrada de audio" icon={Mic}>
                            <select value={inputId} onChange={event => changeInput(event.target.value)} disabled={recorder.status !== 'ready'} className="min-h-10 w-full py-1.5 font-bold text-fg">
                                <option value="">Entrada predeterminada</option>
                                {recorder.devices.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label || 'Entrada de audio'}</option>)}
                            </select>
                        </PracticeField>
                        <InputLevel analyser={recorder.analyser} ready={recorder.status === 'ready'}/>
                    </div>}
                    </>}
                </PracticeIntro>}
                {phase === 'idle' && finished && <PracticeSummary {...finished} onClose={closeSummary}>
                    {recorder.takes.length > 0 && <RoundRecordings takes={recorder.takes} onPlay={recorder.markHeard} note="Solo está en tu dispositivo y se borra al cerrar este resumen."/>}
                </PracticeSummary>}
                {/* Detenida a mano no hay resumen: las tomas quedan aquí hasta borrarlas o empezar otra práctica. */}
                {phase === 'idle' && !finished && recorder.takes.length > 0 && <div className="flex flex-col gap-2 border-t border-line px-4 py-3 sm:flex-row sm:items-start xl:px-5.5">
                    <RoundRecordings takes={recorder.takes} onPlay={recorder.markHeard} note="Solo está en tu dispositivo: se borra al salir o al empezar otra práctica."/>
                    <Button variant="secondary" onClick={recorder.clear} className="shrink-0"><Trash2 size={15}/>Borrar</Button>
                </div>}
                <div className="relative overflow-auto border-t border-line bg-sunken px-4 pt-9 pb-5 md:px-6">
                    <div className="flex min-w-180 flex-col gap-8" aria-label={`Tablatura: ${activeExercise.title}. ${rhythmLabel}.`}>
                        {bars.map((bar, barIndex) => <div key={barIndex} ref={element => { rowRefs.current[barIndex] = element; }}>
                            {/* Encabezado de parte al estilo de una partitura: marca de ensayo en recuadro y título en cursiva. */}
                            {bar.part && <h3 className={cn('mb-4 flex items-center gap-3', barIndex > 0 && 'mt-4')}>
                                <span className="grid size-8 shrink-0 place-items-center rounded-[3px] border-2 border-fg-soft font-serif text-lg font-bold text-fg">{bar.part.number}</span>
                                <span className="font-serif text-lg font-normal text-fg italic">{bar.part.title}</span>
                                <span aria-hidden className="h-px flex-1 bg-line-strong"/>
                            </h3>}
                            {/* Ataque de cada nota: ⊓ abajo · V arriba · h hammer-on · p pull-off · T tapping (según el estudio, `pickingOf`). */}
                            <div style={tabColumns(bar.columns)} className="mb-1 grid text-center text-sm text-accent-strong" aria-label="Dirección de púa"><span/>{bar.notes.map((_, index) => { const stroke = STROKES[picks[bar.start + index]]; return <span key={index} tabIndex={0} aria-label={stroke.title} className={cn('group relative cursor-help outline-none', stroke.legato && 'font-serif text-fg-soft italic')}>{stroke.mark}
                                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 rounded-md border border-line-strong bg-card px-2 py-1 font-sans text-xs whitespace-nowrap text-fg not-italic opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">{stroke.title}</span>
                            </span>; })}</div>
                            {strings.map((name, row) => <div key={name} style={tabColumns(bar.columns)} className={cn('relative grid h-7 items-center font-mono before:absolute before:right-0 before:left-8 before:bg-[#58709a55]', row === 5 ? 'before:h-0.5' : 'before:h-px')}>
                                <b className="text-sm text-muted">{name}</b>
                                {bar.notes.map((note, index) => {
                                    const noteIndex = bar.start + index;
                                    const playing = step === noteIndex;
                                    // Ligado con la nota anterior de la misma cuerda (en la misma fila): arco para hammer-on/pull-off, línea para slide.
                                    // Con tapping el arco no cruza de un pulso al siguiente: cada grupo se lee solo y la p o h de arriba basta.
                                    const previous = bar.notes[index - 1];
                                    const newBeat = study?.picking === 'tapping' && noteIndex % FIGURES[figure].notesPerBeat === 0;
                                    const tie = note.string === row + 1 && previous?.string === note.string && !newBeat ? picks[noteIndex] : undefined;
                                    return <span key={index} className="relative grid justify-items-center">
                                        {(tie === 'hammer' || tie === 'pull') && <span aria-hidden className="absolute -top-1.5 right-1/2 z-20 h-2.5 w-full rounded-t-full border-x-[1.5px] border-t-[1.5px] border-accent/70"/>}
                                        {tie === 'slide' && <svg aria-hidden className="absolute top-1/2 right-1/2 z-20 h-3 w-full -translate-y-1/2 text-accent/80" preserveAspectRatio="none" viewBox="0 0 10 10"><line x1="3" x2="7" y1={note.fret > previous.fret ? 9 : 1} y2={note.fret > previous.fret ? 1 : 9} stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg>}
                                        {note.string === row + 1
                                            ? <button type="button" disabled={active} onClick={() => setFrom(from === noteIndex ? null : noteIndex)} aria-pressed={from === noteIndex} aria-label={`Reproducir desde ${note.fret}/${note.string}`}
                                                className={cn('z-10 rounded-[5px] px-1 text-base', playing ? 'bg-blue text-white' : !active && from === noteIndex ? 'bg-accent text-canvas' : 'bg-sunken text-fg-soft', !active && 'cursor-pointer hover:text-fg', !active && from !== null && noteIndex < from && 'opacity-40')}>{note.fret}</button>
                                            : <span className="invisible z-10 px-1 text-base">{note.fret}</span>}
                                        {/* Bend: flecha y medida arriba a la derecha (con release, flecha de vuelta). Vibrato: onda a la derecha. */}
                                        {note.string === row + 1 && note.bend && <span title={`${note.prebend ? 'Pre-bend' : 'Bend'} ${bendLabel(note.bend)}${note.release ? ' y release' : ''}`} className="absolute -top-2.5 left-1/2 z-20 ml-2 font-sans text-2xs leading-none font-bold whitespace-nowrap text-accent-strong">{note.prebend ? 'PB ' : ''}{note.prebend ? '↘' : note.release ? '↗↘' : '↗'} {bendLabel(note.bend)}</span>}
                                        {note.string === row + 1 && note.vibrato && <span title="Vibrato" className="absolute top-1/2 left-1/2 z-20 ml-3 -translate-y-1/2 text-sm leading-none text-accent-strong">〰</span>}
                                    </span>;
                                })}
                            </div>)}
                        </div>)}
                    </div>
                </div>
                {/* Cuenta de entrada: pantalla completa con el fondo borroso. Al practicar sale ya mientras carga el sonido, sin hueco.
                    Va en <body> porque el `transform` animado de <main> encerraría un `fixed`. */}
                {(phase === 'countdown' || (phase === 'loading' && !listening)) && createPortal(<div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-sunken/60 px-6 text-center backdrop-blur-md">
                    {count < 0
                        ? <span key={pulse} className="block size-28 animate-pop rounded-full bg-violet/60 shadow-[0_0_80px_#3198dc88] md:size-36"/>
                        : <span key={pulse} className={cn('block animate-pop font-black leading-none text-accent-strong', count > 0 ? 'text-[9rem] md:text-[12rem]' : 'text-6xl md:text-7xl')}>{count > 0 ? count : `Ronda ${round}`}</span>}
                    <div>
                        <p className="text-2xl font-bold md:text-3xl">{round === 1 ? 'Prepárate' : 'Siguiente ronda'}</p>
                        <p className="mx-auto mt-3 max-w-md font-serif text-lg text-fg-soft italic md:text-xl">{MOTIVATION[(round - 1) % MOTIVATION.length]}</p>
                        <p className="mt-3 text-sm text-muted"><kbd className="rounded border border-line-strong px-1.5 font-mono text-xs">Esc</kbd> para cancelar</p>
                    </div>
                </div>, document.body)}
            </section>)}
        </div>}
        {!active && !session && <LessonPager moduleId={activeModule.id} moduleTitle={activeModule.title} lessons={practiceLessons} current={activeExercise} mode={mode}/>}
    </>;
}

type PagerLesson = { id: string; title: string; category?: string };
/** Anterior / siguiente lección del módulo, en el mismo modo (Objetivo o Práctica). En la última, vuelve al módulo. También en las lecturas. */
export function LessonPager({ moduleId, moduleTitle, lessons, current, mode }: { moduleId: string; moduleTitle: string; lessons: PagerLesson[]; current: PagerLesson; mode: Mode }) {
    const index = lessons.indexOf(current);
    const [previous, next] = [lessons[index - 1], lessons[index + 1]];
    const urlOf = (lesson: PagerLesson) => mode === 'goal' ? lessonUrl(moduleId, lesson.id) : exerciseUrl(moduleId, lesson.id);
    const card = 'group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5 transition hover:border-accent/60';
    const label = (text: string, lesson?: PagerLesson) => <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-2xs font-bold tracking-wide text-muted uppercase">{text}{lesson?.category && lesson.category !== current.category && <> · {lesson.category}</>}</span>
        <span className="line-clamp-2 font-bold text-fg-soft group-hover:text-fg">{lesson ? lesson.title : moduleTitle}</span>
    </span>;
    return <nav aria-label="Otros ejercicios del módulo" className="mt-8 flex flex-col gap-3 sm:flex-row">
        {previous ? <Link to={urlOf(previous)} className={card}><ChevronLeft size={20} className="shrink-0 text-muted group-hover:text-accent"/>{label('Anterior', previous)}</Link> : <span className="hidden flex-1 sm:block"/>}
        <Link to={next ? urlOf(next) : moduleUrl(moduleId)} className={cn(card, 'justify-end text-right')}>{label(next ? 'Siguiente' : 'Volver a', next)}<ChevronRight size={20} className="shrink-0 text-muted group-hover:text-accent"/></Link>
    </nav>;
}
