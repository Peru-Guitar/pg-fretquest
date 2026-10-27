import { useEffect, useRef, useState } from 'react';
import { AudioLines, Pause, Play } from 'lucide-react';
import type { RoundTake } from '@/lib/audio/practiceRecorder';
import { peakToLevel } from '@/lib/audio/mic';
import { cn } from '@/lib/cn';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/**
 * Tomas de la práctica: se elige la ronda y se escucha. Empieza en la última (la más reciente);
 * cambiar de ronda corta la que sonaba.
 */
export function RoundRecordings({ takes, note, onPlay }: { takes: RoundTake[]; note: string; onPlay: () => void }) {
    const [round, setRound] = useState(takes[takes.length - 1].round);
    const take = takes.find(item => item.round === round) ?? takes[takes.length - 1];
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState({ current: 0, total: 0 });
    // Al llegar una toma nueva (la ronda que se cortó al detener), queda elegida la última.
    const [count, setCount] = useState(takes.length);
    if (count !== takes.length) { setCount(takes.length); setRound(takes[takes.length - 1].round); }
    // Otra toma: vuelve a cero (el <audio> cambia de fuente y se detiene solo).
    const [shownUrl, setShownUrl] = useState(take.url);
    if (shownUrl !== take.url) { setShownUrl(take.url); setPlaying(false); setTime({ current: 0, total: 0 }); }

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) { void audio.play(); onPlay(); } else audio.pause();
    };
    // El webm de MediaRecorder llega sin duración (Infinity): se usa la medida al grabar.
    const total = Number.isFinite(time.total) && time.total > 0 ? time.total : take.seconds;

    return <div className="w-full rounded-xl border border-accent/30 bg-accent/5 p-3 text-left">
        <p className="flex items-center gap-2 text-sm font-bold text-fg"><AudioLines size={16} className="text-accent"/>Escúchate</p>
        <div className="mt-2.5 flex items-center gap-2">
            <select aria-label="Ronda grabada" value={take.round} onChange={event => setRound(Number(event.target.value))} className="min-h-10 min-w-0 flex-1 py-1.5 font-bold text-fg">
                {takes.map(item => <option key={item.round} value={item.round}>Ronda {item.round}</option>)}
            </select>
            <button type="button" onClick={toggle} aria-label={playing ? 'Pausar' : 'Escuchar ronda'} className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue text-white transition hover:brightness-110">
                {playing ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}
            </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 font-mono text-2xs text-muted">
            <span className="block h-1 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, time.current / total * 100)}%` }}/></span>
            <span className="tabular-nums">{formatTime(time.current)} / {formatTime(total)}</span>
        </div>
        <audio ref={audioRef} src={take.url} preload="metadata"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onTimeUpdate={event => setTime({ current: event.currentTarget.currentTime, total: event.currentTarget.duration })}
            onLoadedMetadata={event => setTime({ current: 0, total: event.currentTarget.duration })}/>
        <p className="mt-2 text-2xs text-muted">{note}</p>
    </div>;
}

/** Nivel de la entrada en vivo (escala en dB), para ver que llega señal antes de practicar. */
export function InputLevel({ analyser, ready }: { analyser: () => AnalyserNode | null; ready: boolean }) {
    const [level, setLevel] = useState(0);
    useEffect(() => {
        if (!ready) return;
        let raf = 0;
        let shown = 0;
        const tick = () => {
            const node = analyser();
            if (node) {
                const buffer = new Float32Array(node.fftSize);
                node.getFloatTimeDomainData(buffer);
                let peak = 0;
                for (const value of buffer) peak = Math.max(peak, Math.abs(value));
                // Sube al instante y cae despacio, como un medidor de pico.
                shown = Math.max(peakToLevel(peak), shown * 0.92);
                setLevel(shown);
            }
            raf = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [analyser, ready]);
    return <div className="flex items-center gap-2.5 text-2xs text-muted">
        <span className="shrink-0">{ready ? 'Toca algo para probar' : 'Conectando…'}</span>
        <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className={cn('block h-full rounded-full transition-[width] duration-75', level > 0.95 ? 'bg-danger' : 'bg-success')} style={{ width: `${(ready ? level : 0) * 100}%` }}/></span>
    </div>;
}
