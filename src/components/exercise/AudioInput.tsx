import { Mic } from "lucide-react";
import type { AudioDevices } from "@/lib/audio/mic";

export function LevelMeter({ level, segments = 16 }: { level: number; segments?: number }) {
  return (
    <div className="flex h-3 items-stretch gap-0.5" role="meter" aria-label="Nivel de entrada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
      {Array.from({ length: segments }, (_, i) => {
        const on = i / segments < level;
        const tone = i >= segments - 2 ? "bg-[#ff6b6b]" : i >= segments - 5 ? "bg-gold" : "bg-success";
        return <span key={i} className={`flex-1 rounded-[2px] transition-colors duration-75 ${on ? tone : "bg-line"}`} />;
      })}
    </div>
  );
}

/** Selector de entrada de audio: micrófono, webcam, interfaz… */
export function DeviceSelect({ audio, className = "" }: { audio: AudioDevices; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Dispositivo de entrada</span>
      <Mic className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <select value={audio.deviceId} onChange={(e) => audio.setDeviceId(e.target.value)} className="w-full appearance-none truncate rounded-2xl border border-line bg-canvas py-2 pr-3 pl-9 text-sm font-semibold text-fg focus:border-success focus:outline-none">
        <option value="">Entrada predeterminada</option>
        {audio.devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Entrada ${i + 1}`}</option>)}
      </select>
    </label>
  );
}

