'use client';

import { lessonTabHash } from '@/data/artists';
import { exerciseUrl, lessonIdFromSlug, lessonUrl, moduleIdFromSlug, moduleUrl } from '@/lib/routes';
import { ComingSoon } from '@/components/quest/ComingSoon';
import { rhythmSummary } from '@/lib/rhythm';
import { createLocalStore } from '@/lib/localStore';
import { FIGURES, pickingOf, practiceStudies, speedName, speedPlan, type Speed, type Stroke } from '@/data/practiceStudies';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useScrollLock } from '@/lib/scrollLock';
import { createPortal } from 'react-dom';
import { Link, useParams } from '@/lib/router';
import { courses, type PracticeLesson } from '@/data/questMock';
import { BookOpen, ChevronLeft, ChevronRight, CircleCheck, Gauge, Headphones, Info, Loader2, Music, Play, Repeat, Save, Square, Target, Timer, X } from 'lucide-react';
import { Button, Caption, Card, Eyebrow } from '@/components/ui';
import { ModuleHero } from '@/components/quest/ModuleHero';
import { cn } from '@/lib/cn';
import { type PatternNote } from '@/lib/audio/practiceRound';
import { usePlayback } from '@/lib/audio/usePlayback';
import { setLastExercise } from '@/lib/progress';
import { PracticeField, PracticeIntro, PracticeOption } from '@/components/practice/PracticeIntro';
import { RichSelect, SpeedSelect, type RichOption } from '@/components/practice/SpeedSelect';
import { addTotalSeconds, levelLabel, recordPractice, useAccount } from '@/lib/account';
import { ArtistCredit } from '@/components/quest/ArtistCredit';
import { PracticeSummary, type SummaryProgress } from '@/components/practice/PracticeSummary';
import { LevelUpDialog } from '@/components/practice/LevelUpDialog';
import { levelFromSeconds } from '@/lib/ranks';
import { DEFAULT_WEEKLY_HOURS } from '@/lib/domain/weeklyGoal';
import { getProgress, recordFinishedPractice, weekSecondsOf } from '@/lib/progressDb';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { useCommunity } from '@/lib/community';
import { PeopleThisWeek } from '@/components/quest/QuestUI';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
const now = () => Date.now();
/** Guitarra de guía al practicar: prendida por defecto y recordada en este navegador. */
const practiceGuideStore = createLocalStore('fq-practice-guide', true);
/** Descanso entre rondas, en segundos: se recuerda en este navegador. */
const practiceRestStore = createLocalStore('fq-practice-rest', 0);
/** Marca de ataque sobre cada nota de la tablatura. */
const STROKES: Record<Stroke, { mark: string; title: string; legato?: boolean }> = { down: { mark: '⊓', title: 'Downstroke' }, up: { mark: 'V', title: 'Upstroke' }, hammer: { mark: 'h', title: 'Hammer-on', legato: true }, pull: { mark: 'p', title: 'Pull-off', legato: true }, slide: { mark: 's', title: 'Slide', legato: true }, tap: { mark: 'T', title: 'Tapping' }, rest: { mark: '𝄽', title: 'Silencio' } };
/** Medida del bend como se escribe en tablatura: ½ = medio tono, full = un tono. */
const bendLabel = (semitones: number) => semitones === 1 ? '½' : semitones === 2 ? 'full' : semitones === 3 ? '1½' : `${semitones / 2}`;
// Rondas por práctica; siempre empieza en 1.
const ROUND_OPTIONS: RichOption<number>[] = [
    { value: 1, title: '1 ronda', detail: 'Una pasada completa' },
    { value: 3, title: '3 rondas', detail: 'Calentamiento corto' },
    { value: 5, title: '5 rondas', detail: 'Práctica estándar' },
    { value: 7, title: '7 rondas', detail: 'Para fijar el patrón' },
    { value: 10, title: '10 rondas', detail: 'Resistencia' },
];
const REST_OPTIONS: RichOption<number>[] = [
    { value: 0, title: 'Sin descanso', detail: 'Solo la cuenta de entrada' },
    { value: 5, title: '5 segundos', detail: 'Para respirar' },
    { value: 10, title: '10 segundos', detail: 'Para soltar la mano' },
    { value: 15, title: '15 segundos', detail: 'Para aflojar los dedos' },
    { value: 20, title: '20 segundos', detail: 'Para descansar de verdad' },
];
/** Fuerza de la guitarra de guía al practicar: apenas una referencia bajo el metrónomo. */
const GUIDE_VELOCITY = 0.08;
/** Fuerza de la guitarra al escuchar con Reproducir. */
const LISTEN_VELOCITY = 0.3;
// Un mensaje por pantalla (cuenta o descanso). Nunca repite uno ya visto, tampoco entre prácticas; al verlos todos, vuelve a empezar.
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
    'Lo difícil de hoy será lo fácil de mañana.',
    'Toca como si alguien te estuviera escuchando.',
    'Relaja la mano: la tensión frena tus dedos.',
    'Una nota limpia vale más que diez apuradas.',
    'El metrónomo no es tu enemigo: es tu mejor maestro.',
    'No busques velocidad, busca control.',
    'Mantén los dedos cerca de las cuerdas.',
    'Si te sale lento, ya vas por buen camino.',
    'Cada repetición deja huella en tus manos.',
    'Respira hondo y vuelve a empezar.',
    'Hoy no tiene que salir perfecto: tiene que salir mejor.',
    'Afloja la púa: no hace falta apretarla tanto.',
    'Tu oído también está entrenando.',
    'Pequeños avances, todos los días.',
    'Equivocarse también es practicar.',
    'Siente el pulso antes de tocar.',
    'La paciencia también se entrena.',
    'Nadie nació tocando así: todos empezaron lento.',
    'Deja que el ritmo te lleve.',
    'Tu yo de hace un mes estaría orgulloso.',
    'Busca el sonido, no solo la nota.',
    'Hombros abajo, muñeca suelta.',
    'Lo estás haciendo mejor de lo que crees.',
    'Mira menos el diapasón y escucha más.',
    'Cinco minutos bien hechos valen más que una hora distraída.',
    'La memoria de tus dedos se construye así.',
    'Un error a tiempo se corrige a tiempo.',
    'Toca con intención cada nota.',
    'Ya estás aquí: eso es lo más difícil.',
    'Los grandes también repiten lo básico.',
    'Silencia lo que no debe sonar.',
    'Mejor corto y todos los días que largo y de vez en cuando.',
    'Si te duele, para: cuidar tus manos también es técnica.',
    'Busca que tu mano izquierda y la púa lleguen juntas.',
    'No cuentes los errores: cuenta las rondas.',
    'Una ronda más cerca de tu meta.',
    'La técnica es libertad para tocar lo que imaginas.',
    'Hazlo fácil, aunque todavía no lo sea.',
    'Cada día suena un poco más a ti.',
    'Concéntrate solo en esta ronda.',
    'La calma también se escucha en tu sonido.',
    'Si se complica, baja la velocidad sin culpa.',
    'El progreso se nota cuando miras hacia atrás.',
    'Toca parejo: ninguna nota vale menos que otra.',
    'Tus manos aprenden incluso cuando no lo notas.',
    'Sigue: hoy cuenta.',
    'La música empieza en la cabeza; tus dedos la siguen.',
    'Dedos ligeros, mente tranquila.',
    'Ese pasaje difícil ya te teme un poco.',
    'Tu guitarra agradece cada minuto que le das.',
];
/** Mensajes ya vistos en este navegador. */
const seenMessagesStore = createLocalStore<string[]>('fq-practice-seen-messages', []);
const shuffled = <T,>(items: T[]) => {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i--) {
        const other = Math.floor(Math.random() * (i + 1));
        [list[i], list[other]] = [list[other], list[i]];
    }
    return list;
};
/** Orden de mensajes de una práctica: primero los que aún no salieron. */
const nextMessages = () => {
    const seen = new Set(seenMessagesStore.get());
    const fresh = MOTIVATION.filter(message => !seen.has(message));
    if (!fresh.length) { seenMessagesStore.set([]); return shuffled(MOTIVATION); }
    return [...shuffled(fresh), ...shuffled(MOTIVATION.filter(message => seen.has(message)))];
};

// Ejercicio real: cromático 1-2-3-4 por las seis cuerdas (6ª → 1ª) y 4-3-2-1 de vuelta (1ª → 6ª), una nota por clic.
const PATTERN: PatternNote[] = [
    ...[6, 5, 4, 3, 2, 1].flatMap(string => [5, 6, 7, 8].map(fret => ({ string, fret }))),
    ...[1, 2, 3, 4, 5, 6].flatMap(string => [8, 7, 6, 5].map(fret => ({ string, fret }))),
];
export type Mode = 'goal' | 'practice';

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

/** Pantalla de celular (menos de 768 px). Al generar el HTML estático cuenta como escritorio. */
const compactQuery = '(max-width: 767.98px)';
const useCompactTab = () => useSyncExternalStore(listener => {
    const media = window.matchMedia(compactQuery);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
}, () => window.matchMedia(compactQuery).matches, () => false);

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
    const hasPractice = (course: typeof courses[number]) => course.lessons.some(lesson => lesson.type === 'practice');
    const activeModule = courses.find(course => course.id === exerciseId && hasPractice(course)) ?? courses.find(course => course.id === 'fingering')!;
    const practiceLessons = activeModule.lessons.filter((lesson): lesson is PracticeLesson => lesson.type === 'practice');
    const activeExercise = practiceLessons.find(lesson => lesson.id === lessonIdFromSlug(activeModule.id, leccion)) ?? practiceLessons[0];
    const study = practiceStudies[activeExercise.id];
    const account = useAccount();
    // Quiénes practicaron esta lección esta semana (datos y caché de Comunidad).
    const { data: community } = useCommunity(account !== null);
    const practicing = community?.byLesson[activeExercise.id] ?? [];
    useEffect(() => { setLastExercise({ moduleId: activeModule.id, exerciseId: activeExercise.id }); }, [activeModule.id, activeExercise.id]);
    const pattern = study?.pattern ?? PATTERN;
    const picks = pickingOf(pattern, study?.picking, study?.legatoFrom);
    const baseFigure = study?.figure ?? 'negras';
    const suggestedSpeed = study?.speed ?? 2;
    // Velocidad: el nivel elegido decide la figura (en las lecciones en corcheas) y el BPM.
    const [speed, setSpeed] = useState<Speed>(suggestedSpeed);
    const { figure, bpm } = speedPlan(baseFigure, speed, study?.originalBpm);
    const fullRow = study?.perRow ?? 16;
    // En el celular las filas se parten a la mitad (hasta 8 notas): la tablatura se lee en vertical, sin scroll lateral.
    const compact = useCompactTab();
    let perRow = fullRow;
    while (compact && perRow > 8) perRow = Math.ceil(perRow / 2);
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
    const tabColumns = (count: number) => ({ gridTemplateColumns: `25px repeat(${count}, minmax(0, 1fr))` });
    const suggestedRounds = activeExercise.rounds ?? 1;
    const [rounds, setRounds] = useState(suggestedRounds);
    const [finished, setFinished] = useState<{ rounds: number; speed: Speed; bpm: number; seconds: number; progress: SummaryProgress | null } | null>(null);
    // Si la práctica subió el nivel, la celebración sale al cerrar el resumen (con el total nuevo, en segundos).
    const [levelUp, setLevelUp] = useState<number | null>(null);
    const pendingLevelUp = useRef<number | null>(null);
    const closeSummary = useCallback(() => {
        setFinished(null);
        setLevelUp(pendingLevelUp.current);
        pendingLevelUp.current = null;
    }, []);
    // Nota elegida en la tablatura: Reproducir empieza desde ahí (Practicar siempre toca el patrón completo).
    const [picked, setFrom] = useState<number | null>(null);
    // En el celular no se elige nota: siempre se escucha desde el inicio.
    const from = compact ? null : picked;
    // Al cambiar de ejercicio vuelve al valor por defecto de su tablatura.
    const [roundsFor, setRoundsFor] = useState(activeExercise.id);
    if (roundsFor !== activeExercise.id) {
        setRoundsFor(activeExercise.id);
        setSpeed(suggestedSpeed);
        setRounds(suggestedRounds);
        setFinished(null);
        setFrom(null);
    }
    // Guitarra de guía al practicar: muy bajita. Prendida por defecto; se recuerda.
    const practiceGuide = practiceGuideStore.use();
    const setPracticeGuide = practiceGuideStore.set;
    // Un valor guardado que ya no está en la lista (p. ej. 3 s) cuenta como sin descanso, igual que lo muestra el selector.
    const savedRest = practiceRestStore.use();
    const restSeconds = REST_OPTIONS.some(option => option.value === savedRest) ? savedRest : 0;
    const [messages, setMessages] = useState(MOTIVATION);
    // Al salir el resumen se registra la práctica (solo con sesión iniciada); el modal muestra los minutos sumados.
    const finish = (rounds: number, startedAt: number) => {
        const endedAt = new Date();
        const startedAtDate = new Date(startedAt);
        const seconds = (endedAt.getTime() - startedAtDate.getTime()) / 1000;
        setFinished({ rounds, speed, bpm, seconds, progress: null });
        if (!account) return;
        recordPractice(activeExercise.id);
        const goalHours = account.weeklyHours ?? DEFAULT_WEEKLY_HOURS;
        const beforeSeconds = weekSecondsOf(getProgress());
        setFinished(value => value && { ...value, progress: { beforeSeconds, addedSeconds: seconds, goalHours } });
        recordFinishedPractice({ name: account.name, level: account.level, lessonId: activeExercise.id, startedAt: startedAtDate, endedAt, rounds, speed, bpm })
            .then(saved => {
                if (!saved) return;
                const before = account.totalSeconds ?? 0;
                const after = before + saved.addedSeconds;
                if (levelFromSeconds(after).level > levelFromSeconds(before).level) pendingLevelUp.current = after;
                addTotalSeconds(saved.addedSeconds);
            })
            .catch(error => {
                console.warn("Práctica: no se pudo guardar.", error);
                setFinished(value => value && { ...value, progress: null });
            });
    };
    const playback = usePlayback({
        // Mismo punto de entrada: Reproducir empieza desde la nota elegida, una pasada y sin cuenta.
        // Practicar empieza siempre desde cero, con cuenta, guía bajita y sus rondas.
        plan: demo => {
            const base = { bpm, pattern, notesPerBeat: FIGURES[figure].notesPerBeat };
            if (demo) return { ...base, startAt: from ?? 0, guideVelocity: LISTEN_VELOCITY };
            return { ...base, rounds, restSeconds, countIn: true, guideVelocity: practiceGuide ? GUIDE_VELOCITY : 0 };
        },
        onFinish: finish,
    });
    const { status, round, count, pulse, step, startedAt, soundError, stop: stopPlayback } = playback;
    const listening = status === 'demoLoading' || status === 'demo';
    // Practicar (no Reproducir) se muestra en su propia pantalla completa: la tablatura gana todo el espacio.
    const stage = status === 'countdown' || status === 'playing' || status === 'rest';
    const active = listening || stage;
    const preparing = status === 'preparing';
    // La nota elegida sigue marcada hasta que suena la primera: así no parpadea mientras Reproducir arranca.
    const showFrom = !active || (listening && step < 0);
    const showIntro = status === 'intro' || status === 'starting';
    useScrollLock(status === 'countdown' || status === 'rest');
    useScrollLock(stage);
    const message = messages[(2 * (round - 1) + (status === 'rest' ? 1 : 0)) % messages.length];
    const messageShown = status === 'countdown' || status === 'rest';
    useEffect(() => {
        if (messageShown && !seenMessagesStore.get().includes(message)) seenMessagesStore.set([...seenMessagesStore.get(), message]);
    }, [messageShown, message]);
    // Practicar parte siempre de cero (menos la configuración: velocidad, rondas y guía): ninguna nota marcada.
    const openIntro = () => { setFrom(null); setFinished(null); void playback.openIntro(); };
    const startPractice = () => { setMessages(nextMessages()); void playback.begin(); };
    const playDemo = () => { setFinished(null); void playback.playDemo(); };

    const playDemoRef = useRef(playDemo);
    const openIntroRef = useRef(openIntro);
    useEffect(() => { playDemoRef.current = playDemo; openIntroRef.current = openIntro; });
    // Espacio reproduce el ejercicio (desde la nota elegida, si hay una); Practicar se inicia solo con su botón.
    // Escape quita la nota elegida: Reproducir vuelve a empezar desde el inicio.
    // Con un modal abierto, o mientras Practicar se prepara, Espacio no reproduce nada.
    const blocked = status !== 'idle' || finished !== null || levelUp !== null;
    useEffect(() => {
        if (blocked) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setFrom(null); return; }
            if (event.key !== ' ' || event.repeat) return;
            // Sobre un control, Espacio activa ese control (p. ej. Practicar); las notas de la tablatura sí dejan reproducir.
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest('button, a, input, select, textarea, [role="button"]') && !target.closest('[data-tab-note]')) return;
            event.preventDefault();
            playDemoRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [blocked]);
    // Mientras Practicar se prepara, Escape lo cancela.
    useEffect(() => {
        if (!preparing) return;
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') stopPlayback(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preparing, stopPlayback]);
    // Escape detiene (al escuchar y al practicar). Espacio no hace nada mientras suena: no se detiene por accidente.
    useEffect(() => {
        if (!active) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === ' ' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) event.preventDefault();
            if (event.key === 'Escape') stopPlayback();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active, stopPlayback]);

    // Scroll automático: mantiene centrada la fila de la tablatura que está sonando.
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Durante la cuenta de entrada se muestra la primera fila.
    const currentRow = status === 'countdown' || status === 'rest' ? 0 : step < 0 ? -1 : bars.filter(bar => bar.start <= step).length - 1;
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
    const showBar = status === 'demo' && headerHidden;
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
        <Button disabled={preparing} onClick={playDemo} className="flex-1 sm:min-w-40 sm:flex-none"><Headphones size={16}/>Reproducir <kbd className="hidden rounded border border-white/40 px-1.5 font-mono text-3xs font-normal sm:inline">Espacio</kbd></Button>
        {/* Practicar solo desde tablet o computadora; en el celular se explora y se escucha. */}
        <Button variant="secondary" className="flex-1 max-md:hidden sm:min-w-40 sm:flex-none" disabled={preparing} onClick={openIntro}>{preparing ? <Loader2 size={16} className="animate-spin"/> : <Play size={16} fill="currentColor"/>}Practicar</Button>
        <p className="flex basis-full items-center gap-2 text-xs text-muted md:hidden"><Info size={15} className="shrink-0 text-accent"/>Practica esta lección desde una tablet o computadora.</p>
    </>;
    const playingInfo = <span className="text-sm text-muted">{listening ? <span className="inline-flex items-center gap-1.5"><Headphones size={15}/>Escuchando</span> : <>Ronda <b className="text-fg-soft">{round} de {rounds}</b></>} · <b className="text-fg-soft">{speedName(speed)} · {bpm} BPM</b></span>;
    const stopButton = <Button variant="secondary" onClick={stopPlayback} className="min-w-40"><Square size={15}/>Detener <kbd className="rounded border border-line-strong px-1.5 font-mono text-3xs text-muted">Esc</kbd></Button>;

    const tempoSelect = <SpeedSelect value={speed} onChange={setSpeed} figure={baseFigure} originalBpm={study?.originalBpm} suggested={suggestedSpeed}/>;


    // La misma tarjeta del ejercicio; al practicar va en una capa a pantalla completa (en <body>, por el `transform` de <main>).
    const inStage = (content: ReactNode) => stage
        // Mientras suena no hay scroll a mano: la tablatura baja sola siguiendo la nota (el scroll automático sí funciona).
        ? createPortal(<div role="region" aria-label="Modo práctica" className={cn('fixed inset-0 z-40 bg-canvas p-3 md:p-6', status === 'playing' ? 'overflow-hidden' : 'overflow-y-auto')}>{content}</div>, document.body)
        : content;

    return <>
        <ModuleHero image={activeModule.image} back={{ to: moduleUrl(activeModule.id) + lessonTabHash(activeModule.lessons, activeExercise.id), label: activeModule.title }} eyebrow="Práctica" title={activeExercise.title} text={activeExercise.description}
            stats={[['Lección', `${activeModule.lessons.indexOf(activeExercise) + 1} de ${activeModule.lessons.length}`], ['Dificultad', levelLabel(activeExercise.difficulty)]]}/>
        {activeExercise.artist && <ArtistCredit id={activeExercise.artist} transcribedBy={activeExercise.transcribedBy}/>}


        <div role="tablist" aria-label="Modo" className="flex border-b border-line">
            {(['goal', 'practice'] as const).map(value => {
                const { label, icon: Icon } = modeInfo[value];
                const selected = mode === value;
                return <Link key={value} to={value === 'goal' ? lessonUrl(activeModule.id, activeExercise.id) : exerciseUrl(activeModule.id, activeExercise.id)} role="tab" aria-selected={selected} aria-disabled={active} className={cn(
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
                    <div className={cn('flex flex-wrap items-center gap-3', !(active && status !== 'demoLoading') && 'w-full sm:w-auto')}>
                        {active && status !== 'demoLoading' ? <><Elapsed since={startedAt}/>{stopButton}</> : tempoSelect}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 xl:px-5.5">
                    {!active
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
                        : status === 'demoLoading'
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
                        <Elapsed since={startedAt}/>
                        {stopButton}
                    </div>
                </div>, document.body)}
                {showIntro && <PracticeIntro onCancel={stopPlayback} onStart={startPractice} starting={status === 'starting'} error={soundError ? 'No pudimos cargar el sonido. Revisa tu conexión e inténtalo otra vez.' : undefined}>
                    {/* Los cuatro ajustes siempre visibles, para que el modal no cambie de tamaño: uno por fila en móvil, en 2×2 desde sm. */}
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
                        <PracticeField label="Velocidad" icon={Gauge}>
                            <SpeedSelect value={speed} onChange={setSpeed} figure={baseFigure} originalBpm={study?.originalBpm} suggested={suggestedSpeed} full/>
                        </PracticeField>
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <span className="flex items-center gap-1.5 text-2xs font-bold tracking-wider text-muted uppercase"><Headphones size={13}/>Guía</span>
                            <PracticeOption title="Tablatura de guía" note="Muy bajita" checked={practiceGuide} onChange={setPracticeGuide}/>
                        </div>
                        <PracticeField label="Rondas" icon={Repeat}><RichSelect label="Rondas" options={ROUND_OPTIONS} value={rounds} onChange={setRounds} suggested={suggestedRounds} full/></PracticeField>
                        <PracticeField label={<>Descanso <span className="font-normal tracking-normal normal-case">· no suma al progreso</span></>} icon={Timer}>
                            <RichSelect label="Descanso entre rondas" options={REST_OPTIONS} value={restSeconds} onChange={practiceRestStore.set} disabled={rounds === 1} full/>
                        </PracticeField>
                    </div>
                </PracticeIntro>}
                {levelUp !== null && <LevelUpDialog seconds={levelUp} onClose={() => setLevelUp(null)}/>}
                {!active && finished && <PracticeSummary {...finished} onClose={closeSummary}/>}
                <div className="relative overflow-x-clip border-t border-line bg-sunken px-3 pt-9 pb-5 md:overflow-auto md:px-6">
                    <div className="flex flex-col gap-8 md:min-w-180" aria-label={`Tablatura: ${activeExercise.title}. ${rhythmLabel}.`}>
                        {bars.map((bar, barIndex) => <div key={barIndex} ref={element => { rowRefs.current[barIndex] = element; }}>
                            {/* Encabezado de parte al estilo de una partitura: marca de ensayo en recuadro y título en cursiva. */}
                            {bar.part && <h3 className={cn('mb-4 flex items-center gap-3', barIndex > 0 && 'mt-4')}>
                                <span className="grid size-8 shrink-0 place-items-center rounded-[3px] border-2 border-fg-soft font-serif text-lg font-bold text-fg">{bar.part.number}</span>
                                <span className="font-serif text-lg font-normal text-fg italic">{bar.part.title}</span>
                                <span aria-hidden className="h-px flex-1 bg-line-strong"/>
                            </h3>}
                            {/* Ataque de cada nota: ⊓ abajo · V arriba · h hammer-on · p pull-off · T tapping (según el estudio, `pickingOf`). */}
                            <div style={tabColumns(bar.columns)} className="mb-1 grid text-center text-sm text-accent-strong" aria-label="Dirección de púa"><span/>{bar.notes.map((_, index) => { const stroke = STROKES[picks[bar.start + index]]; return <span key={index} tabIndex={0} aria-label={stroke.title} className={cn('group relative cursor-help outline-none', stroke.legato && 'font-serif text-fg-soft italic')}>{stroke.mark}
                                <span role="tooltip" className="pointer-events-none absolute max-md:hidden bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 rounded-md border border-line-strong bg-card px-2 py-1 font-sans text-xs whitespace-nowrap text-fg not-italic opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">{stroke.title}</span>
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
                                    const fret = note.string === row + 1 ? note.fret : note.chord?.find(other => other.string === row + 1)?.fret;
                                    const tie = note.string === row + 1 && previous?.string === note.string && !newBeat ? picks[noteIndex] : undefined;
                                    return <span key={index} className="relative grid justify-items-center">
                                        {tie === 'slide' && <svg aria-hidden className="absolute top-1/2 right-1/2 z-20 h-3 w-full -translate-y-1/2 text-accent/80" preserveAspectRatio="none" viewBox="0 0 10 10"><line x1="3" x2="7" y1={note.fret > previous.fret ? 9 : 1} y2={note.fret > previous.fret ? 1 : 9} stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg>}
                                        {fret !== undefined
                                            ? <button type="button" data-tab-note disabled={active || preparing || compact} onClick={() => setFrom(from === noteIndex ? null : noteIndex)} aria-pressed={from === noteIndex} aria-label={`Reproducir desde ${fret}/${row + 1}`}
                                                className={cn('z-10 rounded-[5px] px-1 text-base', playing ? 'bg-blue text-white' : showFrom && from === noteIndex ? 'bg-accent text-canvas' : 'bg-sunken text-fg-soft', !active && !compact && 'cursor-pointer hover:text-fg', from !== null && noteIndex < from && 'opacity-40')}>{fret}</button>
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
                {/* Cuenta de entrada: pantalla completa con el fondo borroso. 
                    Va en <body> porque el `transform` animado de <main> encerraría un `fixed`. */}
                {(status === 'countdown' || status === 'rest') && createPortal(<div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-sunken/60 px-6 text-center backdrop-blur-md">
                    {count < 0
                        ? <span key={pulse} className="block size-28 animate-pop rounded-full bg-violet/60 shadow-[0_0_80px_#3198dc88] md:size-36"/>
                        : <span key={pulse} className={cn('block animate-pop font-black leading-none', status === 'rest' ? 'font-mono text-7xl text-white tabular-nums md:text-9xl' : count > 0 ? 'text-[9rem] text-accent-strong md:text-[12rem]' : 'text-6xl text-accent-strong md:text-7xl')}>{status === 'rest' ? `0:${String(count).padStart(2, '0')}` : count > 0 ? count : `Ronda ${round}`}</span>}
                    <div>
                        <p className="text-2xl font-bold md:text-3xl">{status === 'rest' ? 'Descansa' : round === 1 ? 'Prepárate' : 'Siguiente ronda'}</p>
                        <p className="mx-auto mt-3 max-w-md font-serif text-lg text-fg-soft italic md:text-xl">{message}</p>
                        {status === 'rest' && <p className="mt-3 text-sm text-muted">Este tiempo no cuenta como práctica.</p>}
                        <p className="mt-3 text-sm text-muted"><kbd className="rounded border border-line-strong px-1.5 font-mono text-xs">Esc</kbd> para cancelar</p>
                    </div>
                </div>, document.body)}
            </section>)}
        </div>}
        {!active && <LessonPager moduleId={activeModule.id} moduleTitle={activeModule.title} lessons={practiceLessons} current={activeExercise} mode={mode}/>}
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
