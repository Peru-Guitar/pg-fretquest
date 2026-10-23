import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { AudioDevices, MicPitch } from "@/lib/audio/mic";
import { GUITAR_STRINGS, centsBetween, nearestString } from "@/lib/audio/pitch";
import { DeviceSelect, LevelMeter } from "./AudioInput";

const NOTE_NAMES = ["Mi", "La", "Re", "Sol", "Si", "Mi"];
const IN_TUNE_CENTS = 5;
const MIC_ERRORS: Partial<Record<string, string>> = {
  denied: "Permiso de micrófono denegado. Actívalo en la configuración del navegador.",
  unsupported: "Tu navegador no permite usar el micrófono (requiere HTTPS).",
  error: "No se encontró ningún micrófono disponible.",
};

export function TunerDialog({ audio, mic, onClose }: { audio: AudioDevices; mic: MicPitch; onClose: () => void }) {
  const { status, hz, level, start } = mic;
  const [locked, setLocked] = useState<number | null>(null);
  const target = locked ?? (hz ? nearestString(hz) : null);
  const s = GUITAR_STRINGS[target ?? 0];
  const cents = hz && target !== null ? Math.round(centsBetween(hz, s.hz)) : null;
  const inTune = cents !== null && Math.abs(cents) <= IN_TUNE_CENTS;

  // Al abrir, empieza a escuchar si no lo estaba.
  useEffect(() => {
    if (status === "idle") void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-labelledby="tuner-title" onClick={onClose}>
      <div className="animate-pop w-full max-w-md rounded-2xl border border-line bg-surface p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="tuner-title" className="font-display text-2xl font-black text-fg">Prueba de sonido</h2>
            <p className="mt-0.5 text-sm text-muted">{status === "on" ? "Micrófono activo" : status === "starting" ? "Pidiendo acceso al micrófono…" : "Micrófono inactivo"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg" aria-label="Cerrar"><X className="size-5" /></button>
        </div>

        <div className="mt-6">
          <DeviceSelect audio={audio} className="mb-4" />
          <p className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">Nivel de entrada</p>
          <LevelMeter level={level} segments={24} />
          <p className="mt-2 text-xs text-muted">Toca fuerte: el nivel debe llegar a la zona amarilla sin tocar la roja.</p>
          <p className="mt-1 text-xs text-muted">Usa un sonido limpio (clean), sin distorsión ni efectos, para una detección más precisa.</p>
          {MIC_ERRORS[status] && <p className="mt-2 text-xs font-bold text-[#ff6b6b]" role="alert">{MIC_ERRORS[status]}</p>}
        </div>

        <div className="mt-8 text-center">
          <p className={`font-display text-6xl font-black ${inTune ? "text-success" : "text-fg"}`}>{target === null ? "–" : s.name}</p>
          <p className="text-sm text-muted">{target === null ? "Toca una cuerda al aire" : `${NOTE_NAMES[target]} · ${s.hz.toFixed(2)} Hz`}</p>

          {/* Escala de ±50 cents con aguja */}
          <div className="relative mx-auto mt-6 h-14 max-w-xs">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
            <div className="absolute top-1/2 left-1/2 h-6 w-[10%] -translate-x-1/2 -translate-y-1/2 rounded-md bg-success/15" />
            {[-50, -25, 0, 25, 50].map((c) => (
              <span key={c} className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-line-strong" style={{ left: `${50 + c}%` }} />
            ))}
            {cents !== null && <span
              className={`absolute top-0 h-full w-1 -translate-x-1/2 rounded-full transition-[left] duration-75 ${inTune ? "bg-success" : "bg-gold"}`}
              style={{ left: `${50 + Math.max(-50, Math.min(50, cents))}%` }}
              aria-hidden
            />}
          </div>
          <p className={`mt-2 text-sm font-bold tabular-nums ${inTune ? "text-success" : "text-gold"}`} aria-live="polite">
            {cents === null ? (status === "on" ? "Escuchando…" : "\u00a0") : inTune ? <span className="inline-flex items-center gap-1"><Check className="size-4" />Afinada</span> : `${cents > 0 ? "+" : ""}${cents} cents · ${cents > 0 ? "baja" : "sube"} la afinación`}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Cuerda">
          {GUITAR_STRINGS.map((st, i) => (
            <button key={i} type="button" role="radio" aria-checked={i === locked} onClick={() => setLocked(i === locked ? null : i)} className={`rounded-xl py-2 font-display text-lg font-black transition ${i === target ? "bg-success text-white" : "bg-raised text-muted hover:text-fg"} ${i === locked ? "ring-2 ring-success/60" : ""}`}>
              {st.name}
            </button>
          ))}
        </div>

        <Button size="lg" className="mt-6 w-full" onClick={onClose}>Listo</Button>
      </div>
    </div>
  );
}
