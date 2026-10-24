'use client';

import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, useHydrated } from '@/lib/router';
import { ArrowRight, LogIn, Loader2 } from 'lucide-react';
import { Button, Card, Eyebrow, PageTitle } from '@/components/ui';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { DEFAULT_RHYTHM, DEFAULT_SESSION_MINUTES, LEVELS, levelLabel, setLevel, setSessionMinutes, setWeeklyGoal, signIn, useAccount } from '@/lib/account';
import { RhythmPicker, SessionPicker } from '@/components/quest/RhythmPicker';
import type { Difficulty } from '@/data/questMock';
import { cn } from '@/lib/cn';

const LEVEL_TEXT: Record<Difficulty, string> = {
    base: 'Estás empezando con la técnica: mano izquierda, púa alternada y pulso.',
    intermedio: 'Ya tocas con soltura y quieres más independencia y limpieza.',
    avanzado: 'Dominas lo básico y buscas velocidad y cambios de posición.',
    experto: 'Trabajas licks y técnicas exigentes a tempos altos.',
};

// Cuestionario de nivel: cada opción vale de 0 a 3 (de menos a más experiencia).
// La última es la autoevaluación: su respuesta ES un nivel.
type Question = { text: string; options: string[] };
const QUESTIONS: Question[] = [
    { text: '¿Cuántos años llevas tocando?', options: ['Menos de 1 año', 'Entre 1 y 3 años', 'Entre 3 y 6 años', 'Más de 6 años'] },
    { text: '¿Puedes sacar un tema completo de inicio a fin?', options: ['Todavía no', 'Partes sueltas', 'Sí, con tablatura', 'Sí, de oído'] },
    { text: '¿Interpretas los covers a tu manera o los sacas igual?', options: ['Aún no toco covers', 'Los saco igual, nota por nota', 'Igual, con algún cambio mío', 'Les doy mi propio estilo'] },
    { text: '¿Sientes que tienes precisión y limpieza al tocar, o llegas al objetivo como sea?', options: ['Llego como sea', 'Depende del tema', 'Casi siempre limpio', 'Preciso y limpio'] },
    { text: 'Cuando te grabas y luego te escuchas, ¿qué tan satisfecho te sientes con el resultado?', options: ['Nunca me he grabado', 'Poco: escucho muchos errores', 'Bastante, con detalles por pulir', 'Muy satisfecho'] },
    { text: '¿Con qué frecuencia practicas?', options: ['Una o dos veces al mes', 'Una vez por semana', 'Varias veces por semana', 'Soy constante: casi todos los días'] },
    { text: 'Con honestidad: ¿en qué nivel consideras que estás?', options: ['Básico', 'Intermedio', 'Avanzado', 'Experto'] },
];

/** Nivel sugerido: la media de las seis primeras (0–3) y la autoevaluación, a partes iguales; en empate, manda la autoevaluación. */
function suggestLevel(answers: number[]): Difficulty {
    const experience = answers.slice(0, -1).reduce((total, value) => total + value, 0) / (QUESTIONS.length - 1);
    const self = answers[answers.length - 1];
    const combined = (experience + self) / 2;
    return LEVELS[Math.min(3, combined % 1 === 0.5 ? self : Math.round(combined))];
}

/** Maqueta del alta: login simulado → autoevaluación → nivel sugerido (se puede cambiar). */
export default function LoginPage() {
    const account = useAccount();
    const hydrated = useHydrated();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const retake = searchParams.has('repetir');
    const [answers, setAnswers] = useState<number[]>([]);
    const [picked, setPicked] = useState<Difficulty | null>(null);
    const [signingIn, setSigningIn] = useState(false);
    const [choosingRhythm, setChoosingRhythm] = useState(false);
    const [rhythm, setRhythm] = useState(DEFAULT_RHYTHM);
    const [sessionMinutes, setSessionLength] = useState(DEFAULT_SESSION_MINUTES);
    const [error, setError] = useState('');
    const answered = answers.length === QUESTIONS.length;
    const suggested = answered ? suggestLevel(answers) : 'base';
    const current = QUESTIONS[answers.length];
    const level = picked ?? (answered ? suggested : null);

    if (!hydrated) return <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;
    if (!account) return <div className="grid min-h-[calc(100dvh-12rem)] place-items-center">
        <Card className="relative w-full max-w-3xl overflow-hidden px-6 py-14 text-center md:px-16 md:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"/>
            <div className="relative">
                <img src="/icons/quest-mark.svg" alt="" className="mx-auto h-16 w-16 drop-shadow-[0_0_20px_#e0662f55]"/>
                <Eyebrow className="mt-6 justify-center">BIENVENIDO A FRET QUEST</Eyebrow>
                <h1 className="mt-3 text-4xl md:text-5xl">Entra para tener tu plan</h1>
                <p className="mx-auto mt-4 max-w-md text-base text-muted">El temario completo es libre. Con tu cuenta te sugerimos qué practicar según tu nivel y guardamos tu progreso.</p>
                <Button className="mx-auto mt-10 min-h-14 w-full max-w-md text-base" disabled={signingIn} onClick={() => { setError(''); setSigningIn(true); signIn().catch((reason: { code?: string }) => { if (reason.code !== 'auth/popup-closed-by-user' && reason.code !== 'auth/cancelled-popup-request') setError('No se pudo entrar. Inténtalo de nuevo.'); }).finally(() => setSigningIn(false)); }}><LogIn size={20}/>{signingIn ? 'Entrando…' : 'Entrar con Google'}</Button>
                {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
        </Card>
    </div>;

    // Paso aparte del cuestionario: el ritmo semanal.
    // Con nivel ya guardado se salta el cuestionario: al plan, o al ritmo si aún no lo eligió.
    // `?repetir` (desde Mi cuenta) vuelve a hacer el cuestionario.
    // Cuenta nueva en este navegador: esperar a Firestore antes de decidir si hace falta el cuestionario.
    if (account.synced === false && !account.level) return <div className="grid place-items-center py-24 text-muted"><Loader2 className="animate-spin"/></div>;
    if (account.level && !retake && account.weeklyGoal && !choosingRhythm) return <Navigate to={ROUTES.plan} replace/>;
    const showRhythm = choosingRhythm || (!!account.level && !retake);

    // Pasos del alta: 1 cuestionario · 2 nivel · 3 ritmo. Mismo ancho y cabecera que el resto de páginas.
    const stepNumber = showRhythm ? 3 : answered ? 2 : 1;
    const steps = ['Cuestionario', 'Tu nivel', 'Tu ritmo'];
    const header = (eyebrow: string, title: string, text: string) => <>
        <ol className="mb-7 flex flex-wrap gap-2">{steps.map((label, index) => <li key={label} className={cn('flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold',
            index + 1 === stepNumber ? 'border-brand bg-brand/15 text-fg' : index + 1 < stepNumber ? 'border-success/40 text-success' : 'border-line text-muted')}>
            <span className="font-mono">{index + 1}</span>{label}</li>)}</ol>
        <PageTitle eyebrow={eyebrow} title={title} text={text}/>
    </>;

    if (showRhythm) return <>
        {header('UN ÚLTIMO PASO', '¿Cuántos días por semana quieres practicar?', 'Puedes practicar el día que quieras: el ritmo es tu meta semanal, para que sientas tu progreso. Lo cambias cuando quieras.')}
        <Card className="p-6 md:p-8">
            <RhythmPicker value={rhythm} onChange={setRhythm}/>
            <h2 className="mt-9 text-xl">¿Cuánto dura cada sesión?</h2>
            <p className="mt-1 mb-4 text-sm text-muted">En la sesión repites los ejercicios de tu plan hasta completar el tiempo. Si completas tu sesión, ese día cuenta para tu ritmo; si no, no pasa nada.</p>
            <SessionPicker value={sessionMinutes} onChange={setSessionLength}/>
            <Button className="mt-8 min-h-13 px-8 text-base" onClick={() => { setWeeklyGoal(rhythm); setSessionMinutes(sessionMinutes); navigate(ROUTES.plan); }}>Ver mi plan <ArrowRight size={18}/></Button>
        </Card>
    </>;

    return <>
        {header(`HOLA, ${account.name.toUpperCase()}`, answered ? 'Este es tu nivel' : '¿Cuál es tu nivel?', 'Siete preguntas rápidas. Responde con honestidad: solo sirve para sugerirte ejercicios y puedes cambiarlo cuando quieras.')}

        {!answered && <Card className="relative overflow-hidden p-6 md:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-brand/15 blur-3xl"/>
            <div className="relative">
                <div className="mb-8 flex items-center gap-4 text-sm text-muted">
                    <span className="font-mono text-base font-bold text-fg">{answers.length + 1}<span className="text-muted"> / {QUESTIONS.length}</span></span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-linear-90 from-brand to-gold transition-[width] duration-300" style={{ width: `${answers.length / QUESTIONS.length * 100}%` }}/></span>
                    {answers.length > 0 && <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="font-bold text-fg-soft hover:text-fg">← Atrás</button>}
                </div>
                <h2 key={answers.length} className="animate-rise text-2xl md:text-4xl">{current.text}</h2>
                <div className="mt-8 grid gap-3 md:grid-cols-2">{current.options.map((option, value) => <button key={option} type="button" onClick={() => setAnswers([...answers, value])}
                    className="flex min-h-16 items-center gap-4 rounded-xl border border-line-strong px-5 py-4 text-left text-base font-bold text-fg-soft transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:text-fg">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-sm text-muted">{String.fromCharCode(65 + value)}</span>{option}
                </button>)}</div>
            </div>
        </Card>}

        {answered && <Card className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl">Te sugerimos <span className="text-accent">{levelLabel(suggested)}</span></h2>
                <button type="button" onClick={() => { setAnswers([]); setPicked(null); }} className="text-sm text-muted hover:text-fg">Repetir el cuestionario</button>
            </div>
            <p className="mt-1 text-sm text-muted">Puedes elegir otro si lo prefieres.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{LEVELS.map(option => <button key={option} type="button" aria-pressed={level === option} onClick={() => setPicked(option)}
                className={cn('flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition', level === option ? 'border-brand bg-brand/12' : 'border-line hover:border-line-strong')}>
                <span className="flex items-center gap-2.5 text-lg font-bold">{levelLabel(option)}<DifficultySignal difficulty={option}/></span>
                <span className="text-sm text-muted">{LEVEL_TEXT[option]}</span>
                {option === suggested && <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-3xs font-black tracking-wider text-accent">SUGERIDO</span>}
            </button>)}</div>
            <Button className="mt-8 min-h-13 px-8 text-base" disabled={!level} onClick={() => { if (level) { setLevel(level); if (account.weeklyGoal) navigate(ROUTES.plan); else setChoosingRhythm(true); } }}>Continuar <ArrowRight size={18}/></Button>
        </Card>}
    </>;
}
