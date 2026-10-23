import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch } from "./pitch";

export type MicPitch = ReturnType<typeof useMicPitch>;
export type AudioDevices = ReturnType<typeof useAudioDevices>;
export type MicStatus = "idle" | "starting" | "on" | "denied" | "unsupported" | "error";

const DEVICE_KEY = "fq.audioDevice";

/** Pico de la señal en escala dB: −60 dBFS → 0, 0 dBFS (saturación) → 1. */
export const peakToLevel = (peak: number) => Math.min(1, Math.max(0, (20 * Math.log10(peak || 1e-6) + 60) / 60));

/**
 * Entradas de audio del sistema y la elegida (recordada entre visitas; "" = predeterminada).
 * Los nombres solo aparecen después de conceder el permiso de micrófono: llama a `refresh` tras activarlo.
 */
export function useAudioDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceIdState] = useState(() => {
    try {
      return localStorage.getItem(DEVICE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const refresh = useCallback(async () => {
    const all = (await navigator.mediaDevices?.enumerateDevices()) ?? [];
    setDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId && d.deviceId !== "default"));
  }, []);

  useEffect(() => {
    // enumerateDevices es asíncrono: el estado se actualiza al resolver.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    navigator.mediaDevices?.addEventListener("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener("devicechange", refresh);
  }, [refresh]);

  const setDeviceId = useCallback((id: string) => {
    setDeviceIdState(id);
    try {
      localStorage.setItem(DEVICE_KEY, id);
    } catch {
      // Sin almacenamiento: la elección dura solo esta visita.
    }
  }, []);

  const label = devices.find((d) => d.deviceId === deviceId)?.label || "Entrada predeterminada";
  return { devices, deviceId, setDeviceId, label, refresh };
}

/** Escucha una entrada de audio y entrega la frecuencia detectada (Hz) y el nivel (0–1, en dB). */
export function useMicPitch(deviceId = "", onStarted?: () => void) {
  const [status, setStatus] = useState<MicStatus>("idle");
  const [hz, setHz] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const stopRef = useRef<() => void>(() => {});
  const onStartedRef = useRef(onStarted);
  useEffect(() => {
    onStartedRef.current = onStarted;
  });

  const stop = useCallback(() => {
    stopRef.current();
    stopRef.current = () => {};
    setHz(null);
    setLevel(0);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return setStatus("unsupported");
    setStatus("starting");
    let stream: MediaStream;
    try {
      // Sin procesado: la supresión de ruido y el control de ganancia deforman la nota.
      const audio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
      stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { ...audio, deviceId: { exact: deviceId } } : audio });
    } catch (e) {
      const name = (e as DOMException).name;
      return setStatus(name === "NotAllowedError" ? "denied" : "error");
    }
    const ctx = new AudioContext();
    void ctx.resume();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    let smooth: number | null = null;
    let shown = 0;
    let raf = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v));
      // Sube al instante y cae despacio, como un medidor de pico.
      shown = Math.max(peakToLevel(peak), shown * 0.92);
      setLevel(shown);
      const f = detectPitch(buf, ctx.sampleRate);
      // Suavizado ligero; si salta más de un semitono, reinicia.
      smooth = f && smooth && Math.abs(1200 * Math.log2(f / smooth)) < 100 ? smooth * 0.7 + f * 0.3 : f;
      setHz(smooth);
      raf = requestAnimationFrame(tick);
    };
    tick();
    // Si ya había una escucha (p. ej. doble montaje en StrictMode o cambio de entrada), libérala.
    stopRef.current();
    stopRef.current = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    };
    setStatus("on");
    onStartedRef.current?.();
  }, [deviceId]);

  // Al cambiar de entrada mientras escucha, reabre con la nueva.
  const listening = status === "on";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (listening) void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  useEffect(() => () => stopRef.current(), []);

  return { status, hz, level, start, stop };
}
