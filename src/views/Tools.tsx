'use client';

import { ROUTES } from '@/lib/routes';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight, Gauge, Mic, MicOff, Minus, Music2, Pause, Play, Plus, Square } from 'lucide-react';
import { BackLink, Badge, Button, Caption, Card, PageTitle } from '@/components/ui';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { cn } from '@/lib/cn';
import { useMetronome } from '@/lib/audio/metronome';
import { useAudioDevices, useMicPitch } from '@/lib/audio/mic';
import { MAX_TAKE_S, useRecorder } from '@/lib/audio/recorder';
import { DeviceSelect, LevelMeter } from '@/components/exercise/AudioInput';
import { GUITAR_STRINGS, centsBetween, nearestString } from '@/lib/audio/pitch';

/**
 * Catálogo de herramientas. Para añadir una nueva: una entrada aquí + su página y ruta.
 * `image`: cabecera de la tarjeta en public/images/tools/, con el mismo alto que CourseCard (h-44).
 */
const tools: { to: string; icon: ReactNode; title: string; text: string; category: string; image?: string }[] = [
    { to: ROUTES.tuner, icon: <Music2/>, title: 'Afinador', category: 'AFINACIÓN', text: 'Afinación estándar E A D G B e a 440 Hz. Afina antes de cada sesión.', image: '/images/tools/tuner.webp' },
    { to: ROUTES.metronome, icon: <Gauge/>, title: 'Metrónomo', category: 'RITMO', text: 'Un pulso constante de 30 a 300 BPM para entrenar con control.', image: '/images/tools/metronome.webp' },
];

export default function ToolsPage() {
    return <>
        <PageTitle eyebrow="PREPARA TU SONIDO" title="Herramientas" text="Utilidades para preparar y acompañar cada práctica."/>
        <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:gap-5">
            {tools.map(tool => <Link key={tool.to} to={tool.to} className="overflow-hidden rounded-lg border border-line bg-card transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_6px_25px_#e0662f16]">
                <div className="relative h-44 overflow-hidden bg-sunken">
                    {tool.image
                        ? <img src={tool.image} alt="" width={1440} height={480} loading="lazy" decoding="async" className="h-44 w-full object-cover"/>
                        : <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[#f1c7a1] opacity-60 [&_svg]:size-10 [&_svg]:stroke-1">{tool.icon}</span>}
                </div>
                <div className="p-4 xl:p-5">
                    <p className="text-4xs leading-relaxed font-black tracking-[0.15em] text-accent">{tool.category}</p>
                    <h2 className="mt-2 mb-2 text-base md:text-[1.0625rem] xl:text-lg">{tool.title}</h2>
                    <p className="text-xs leading-relaxed text-muted xs:min-h-9.5">{tool.text}</p>
                    <div className="mt-4.5 flex items-center justify-between border-t border-line pt-3 text-xs text-accent"><span>Abrir herramienta</span><ArrowRight size={16}/></div>
                </div>
            </Link>)}
        </div>
    </>;
}

function ToolLayout({ title, text, tip, children, badge = 'DEMOSTRACIÓN VISUAL · SIN AUDIO' }: { title: string; text: string; tip: string; children: ReactNode; badge?: string | null }) {
    return <>
        <BackLink to={ROUTES.tools}>Herramientas</BackLink>
        <PageTitle eyebrow="HERRAMIENTAS" title={title} text={text}/>
        <Card className="mx-auto w-full max-w-280 px-6 py-10 text-center md:px-16 md:py-16">
            {badge && <Badge>{badge}</Badge>}
            {children}
        </Card>
        <div className="mx-auto my-6 flex max-w-162 items-center gap-4 text-sm leading-relaxed text-muted">
            <span className="text-2xl text-accent">✦</span><p>{tip}</p>
        </div>
    </>;
}

/** Botón tipo chip compartido por el compás del metrónomo y las cuerdas del afinador. */
const chip = (active: boolean) => cn('min-h-12 min-w-14 rounded-full border px-4 font-bold transition md:min-w-18',
    active ? 'border-brand bg-brand text-white' : 'border-line-strong text-fg-soft hover:border-accent/60');

const IN_TUNE_CENTS = 5;
const MIC_ERRORS: Partial<Record<string, string>> = {
    denied: 'Permiso de micrófono denegado. Actívalo en la configuración del navegador.',
    unsupported: 'Tu navegador no permite usar el micrófono (requiere HTTPS).',
    error: 'No se encontró ningún micrófono disponible.',
};

/** Escala de ±50 cents: rayas cada 2,5 cents, mayores cada 10; graves en naranja, agudos en turquesa. */
function CentsScale({ cents, inTune }: { cents: number | null; inTune: boolean }) {
    const ticks = Array.from({ length: 41 }, (_, i) => -50 + i * 2.5);
    return <div className="flex items-center gap-3 md:gap-5">
        <span className="w-10 shrink-0 text-center text-xs leading-tight text-muted md:text-base">−50<span className="block">cents</span></span>
        <div className="relative h-16 flex-1">
            <div className="absolute inset-0 mask-[linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
                {ticks.map(c => c !== 0 && <i key={c} style={{ left: `${50 + c}%` }} className={cn('absolute top-1/2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    c % 10 === 0 ? 'h-10' : 'h-4', c < 0 ? 'bg-[#e0662f]' : 'bg-[#2fd6d0]', c % 10 === 0 ? 'opacity-90' : 'opacity-50')}/>)}
            </div>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-success">0</span>
            <span aria-hidden="true" style={{ left: `${50 + Math.max(-50, Math.min(50, cents ?? 0))}%` }}
                className={cn('absolute top-1/2 h-14 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-100',
                    cents === null || inTune ? 'bg-success shadow-[0_0_18px_#28dfa1aa]' : 'bg-gold shadow-[0_0_18px_#ffc156aa]')}/>
        </div>
        <span className="w-10 shrink-0 text-center text-xs leading-tight text-muted md:text-base">+50<span className="block">cents</span></span>
    </div>;
}

export function TunerPage() {
    const audio = useAudioDevices();
    const mic = useMicPitch(audio.deviceId, audio.refresh);
    const [locked, setLocked] = useState<number | null>(null);
    const listening = mic.status === 'on';
    const target = locked ?? (mic.hz ? nearestString(mic.hz) : null);
    const cents = mic.hz && target !== null ? Math.round(centsBetween(mic.hz, GUITAR_STRINGS[target].hz)) : null;
    const inTune = cents !== null && Math.abs(cents) <= IN_TUNE_CENTS;
    const note = target !== null ? GUITAR_STRINGS[target].name : '–';
    const status = cents === null ? (listening ? 'Toca una cuerda al aire…' : 'Activa el micrófono para empezar') : inTune ? 'En tono' : cents > 0 ? 'Baja la afinación' : 'Sube la afinación';

    return <ToolLayout badge={null} title="Afinador" text="Afinación estándar · E A D G B e · 440 Hz" tip="Afina antes de cada sesión. Usa un sonido limpio (clean), sin distorsión ni efectos: la detección es mucho más precisa.">
        <h2 className="text-[1.375rem] md:text-3xl">Encuentra tu punto de equilibrio.</h2>
        <div className="relative mx-auto mt-16 max-w-4xl"><CentsScale cents={cents} inTune={inTune}/></div>

        <p className="mt-12 bg-linear-to-b from-[#f0894f] to-[#c4521f] bg-clip-text text-[7rem] leading-none font-black text-transparent md:text-[9rem]">{note}</p>
        <p aria-live="polite" className={cn('mt-2 min-h-6 font-bold tabular-nums', inTune ? 'text-success' : cents === null ? 'text-muted' : 'text-gold')}>
            {cents === null ? status : inTune ? '✓ En tono' : `${cents > 0 ? '+' : ''}${cents} cents · ${status.toLowerCase()}`}
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-2 md:gap-3">{GUITAR_STRINGS.map((string, index) =>
            <button key={index} aria-label={`Cuerda ${6 - index}, nota ${string.name}`} aria-pressed={locked === index} onClick={() => setLocked(locked === index ? null : index)}
                className={cn(chip(target === index), 'text-xl', locked === index && 'ring-2 ring-[#f0894f]/70 ring-offset-2 ring-offset-surface')}>
                {string.name}
            </button>)}
        </div>
        <div className="mx-auto mt-16 mb-6 flex max-w-md flex-col gap-4">
            <DeviceSelect audio={audio}/>
            {listening && <LevelMeter level={mic.level} segments={24}/>}
        </div>
        <Button size="lg" className="min-w-60" onClick={listening ? mic.stop : mic.start} disabled={mic.status === 'starting'}>{listening ? <MicOff/> : <Mic/>} {listening ? 'Detener micrófono' : 'Activar micrófono'}</Button>
        {MIC_ERRORS[mic.status] && <Caption className="mt-3 justify-center">{MIC_ERRORS[mic.status]}</Caption>}
    </ToolLayout>;
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const MIN_BPM = 30;
const MAX_BPM = 300;
const METERS = [{ label: '1/4', beats: 1 }, { label: '2/4', beats: 2 }, { label: '3/4', beats: 3 }, { label: '4/4', beats: 4 }, { label: '5/4', beats: 5 }, { label: '6/8', beats: 6 }, { label: '7/8', beats: 7 }];
const REC_MESSAGES: Partial<Record<string, string>> = {
    idle: 'Graba hasta 1 minuto con el clic y escúchate. La toma queda solo en este navegador.',
    starting: 'Pidiendo acceso a la entrada de audio…',
    recording: 'Grabando guitarra + clic…',
    denied: 'Permiso de micrófono denegado. Actívalo en la configuración del navegador.',
    unsupported: 'Tu navegador no permite grabar audio.',
    error: 'No se encontró ninguna entrada de audio disponible.',
};

/** Aro del tempo: el arco marca el BPM en el rango y destella en cada pulso. */
function TempoRing({ tempo, pulse, accent }: { tempo: number; pulse: number; accent: boolean }) {
    const r = 88;
    const length = 2 * Math.PI * r;
    const fraction = (tempo - MIN_BPM) / (MAX_BPM - MIN_BPM);
    const angle = fraction * 2 * Math.PI - Math.PI / 2;
    return <div className="relative grid size-52 shrink-0 place-items-center md:size-64">
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden="true">
            <defs><linearGradient id="tempo-arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4521f"/><stop offset="1" stopColor="#f0894f"/></linearGradient></defs>
            <circle cx="100" cy="100" r={r} fill="#0d1424" stroke="var(--color-line)" strokeWidth="5"/>
            <circle cx="100" cy="100" r={r - 12} fill="none" stroke="#ffffff08" strokeWidth="1"/>
            <circle cx="100" cy="100" r={r} fill="none" stroke="url(#tempo-arc)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${fraction * length} ${length}`} transform="rotate(-90 100 100)" className="drop-shadow-[0_0_6px_#e0662f80]"/>
            <circle cx={100 + r * Math.cos(angle)} cy={100 + r * Math.sin(angle)} r="6" fill="#e0662f" stroke="#f6c9a8" strokeWidth="1.5"/>
        </svg>
        {pulse > 0 && <span key={pulse} aria-hidden="true" className={cn('absolute inset-0 animate-tick rounded-full border-2', accent ? 'border-[#f0894f] shadow-[0_0_40px_#e0662f90]' : 'border-[#a9775a] shadow-[0_0_24px_#e0662f50]')}/>}
        <strong className="relative text-center text-[4.5rem] leading-none font-black text-fg md:text-[5.5rem]">{tempo}<small className="mt-3 block text-sm font-semibold tracking-[0.3em] text-fg-soft">BPM</small></strong>
    </div>;
}

export function MetronomePage() {
    const [tempo, setTempo] = useState(80);
    const [beats, setBeats] = useState(4);
    const [playing, setPlaying] = useState(false);
    const [pulse, setPulse] = useState({ count: 0, beat: 0 });
    const timers = useRef<number[]>([]);

    useMetronome(tempo, playing, {
        beats,
        onBeat: (index, at) => {
            timers.current.push(window.setTimeout(() => setPulse(p => ({ count: p.count + 1, beat: index })), Math.max(0, at - performance.now())));
        },
    });

    const stopMetronome = () => {
        timers.current.forEach(id => window.clearTimeout(id));
        timers.current = [];
        setPulse({ count: 0, beat: 0 });
        setPlaying(false);
    };
    const audio = useAudioDevices();
    const rec = useRecorder(audio.deviceId, stopMetronome);
    const recording = rec.status === 'recording';
    const toggleRecording = async () => {
        if (recording) {
            rec.stop();
            return stopMetronome();
        }
        if (!await rec.start()) return;
        await audio.refresh();
        setPlaying(true);
    };
    const changeTempo = (value: number) => setTempo(Math.max(MIN_BPM, Math.min(MAX_BPM, value)));
    const stepButton = 'grid size-14 shrink-0 place-items-center rounded-xl border border-line-strong bg-raised/60 text-fg shadow-[0_6px_20px_#0006] transition hover:border-accent/60 md:size-18 [&_svg]:size-7';

    return <ToolLayout badge={null} title="Metrónomo" text="Un ritmo constante. Una nota a la vez." tip="Empieza más lento de lo que crees necesario. La precisión construye velocidad.">
        <h2 className="text-[1.375rem] md:text-3xl">Encuentra tu pulso.</h2>
        <div>
            <div className="relative my-12 flex items-center justify-center gap-5 xs:gap-10 md:gap-16">
                <button type="button" aria-label="Reducir tempo" onClick={() => changeTempo(tempo - 1)} className={stepButton}><Minus/></button>
                <TempoRing tempo={tempo} pulse={pulse.count} accent={pulse.beat === 0}/>
                <button type="button" aria-label="Aumentar tempo" onClick={() => changeTempo(tempo + 1)} className={stepButton}><Plus/></button>
            </div>
        </div>

        <div className="mx-auto flex max-w-3xl items-center gap-4 text-sm text-muted">
            <span className="w-8 text-right tabular-nums">{MIN_BPM}</span>
            <input type="range" min={MIN_BPM} max={MAX_BPM} value={tempo} onChange={event => changeTempo(Number(event.target.value))} aria-label="Tempo del metrónomo"
                className="range-brand flex-1" style={{ '--fill': `${((tempo - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100}%` } as CSSProperties}/>
            <span className="w-8 text-left tabular-nums">{MAX_BPM}</span>
        </div>

        <p id="compas" className="mt-14 mb-4 text-fg-soft">Compás</p>
        <div role="radiogroup" aria-labelledby="compas" className="flex flex-wrap justify-center gap-2 md:gap-3">{METERS.map(meter =>
            <button key={meter.label} type="button" role="radio" aria-checked={beats === meter.beats} onClick={() => setBeats(meter.beats)}
                className={cn(chip(beats === meter.beats), 'text-sm')}>{meter.label}</button>)}
        </div>

        <div className="mx-auto mt-14 flex max-w-md flex-col gap-4">
            <DeviceSelect audio={audio}/>
            {recording && <LevelMeter level={rec.level}/>}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="min-w-52 text-lg" disabled={recording} onClick={() => playing ? stopMetronome() : setPlaying(true)}>{playing ? <Pause className="fill-current"/> : <Play className="fill-current"/>} {playing ? 'Detener' : 'Iniciar'}</Button>
            <Button size="lg" variant={recording ? 'danger' : 'secondary'} className="min-w-52 text-lg" disabled={rec.status === 'starting'} onClick={() => void toggleRecording()}>
                {recording ? <Square className="fill-current"/> : <span className="size-6 rounded-full bg-[#ff5f5f] shadow-[0_0_12px_#ff5f5f66]"/>}
                {recording ? <>Detener <span className="font-mono tabular-nums">{formatTime(Math.max(0, MAX_TAKE_S - rec.elapsed) + 0.999)}</span></> : 'Grabar · 1:00'}
            </Button>
        </div>
        {rec.take && !recording && <div className="mt-8"><AudioPlayer key={rec.take.url} src={rec.take.url} duration={rec.take.duration} label="tu grabación"/></div>}
        {REC_MESSAGES[rec.status] && <Caption className="mt-4 justify-center">{REC_MESSAGES[rec.status]}</Caption>}

    </ToolLayout>;
}
