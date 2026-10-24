import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Reproductor con el estilo de la app. `duration` sirve de respaldo si el archivo no la trae. */
export function AudioPlayer({ src, duration: fallback = 0, label }: { src: string; duration?: number; label: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const duration = Number.isFinite(loaded) && loaded > 0 ? loaded : fallback;
  const progress = duration ? Math.min(100, (current / duration) * 100) : 0;

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-raised/50 p-2.5 pr-4">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setLoaded(e.currentTarget.duration)}
      />
      <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : `Reproducir ${label}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_4px_20px_#4f4aff25] transition hover:-translate-y-px hover:shadow-[0_5px_25px_#3198dc44]">
        {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
      </button>
      <div className="relative h-1.5 flex-1 rounded-full bg-line has-focus-visible:ring-2 has-focus-visible:ring-[#5ab8ec]/60 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-surface">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#5ab8ec]" style={{ width: `${progress}%` }} />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={current}
          onChange={(e) => { if (ref.current) ref.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); }}
          aria-label={`Posición de ${label}`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <span className="shrink-0 font-mono text-xs text-muted tabular-nums">{formatTime(current)} / {formatTime(duration)}</span>
    </div>
  );
}
