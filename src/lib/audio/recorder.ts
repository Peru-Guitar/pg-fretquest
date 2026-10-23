import { useCallback, useEffect, useRef, useState } from "react";
import { audio, clickBus } from "./metronome";
import { peakToLevel } from "./mic";

export type RecorderStatus = "idle" | "starting" | "recording" | "denied" | "unsupported" | "error";

/**
 * Graba la entrada elegida mezclada con el clic del metrónomo, para escucharte después.
 * La guitarra va solo a la grabación (no a los parlantes) para no realimentar.
 * Todo queda en memoria del navegador: cada toma reemplaza a la anterior y se libera al salir.
 */
/** Duración máxima de una toma, en segundos. */
export const MAX_TAKE_S = 60;

export function useRecorder(deviceId = "", onLimit?: () => void) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [take, setTake] = useState<{ url: string; duration: number } | null>(null);
  const [level, setLevel] = useState(0);
  const stopRef = useRef<() => void>(() => {});
  const urlRef = useRef<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const onLimitRef = useRef(onLimit);
  useEffect(() => {
    onLimitRef.current = onLimit;
  });

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return setStatus("unsupported");
    setStatus("starting");
    let stream: MediaStream;
    try {
      const constraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
      stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { ...constraints, deviceId: { exact: deviceId } } : constraints });
    } catch (e) {
      return setStatus((e as DOMException).name === "NotAllowedError" ? "denied" : "error");
    }
    const ac = audio();
    const source = ac.createMediaStreamSource(stream);
    const dest = ac.createMediaStreamDestination();
    const analyser = ac.createAnalyser();
    source.connect(dest);
    source.connect(analyser);
    clickBus().connect(dest);

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(dest.stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    // Chrome no escribe la duración en el WebM grabado: la medimos nosotros.
    let startedAt = 0;
    recorder.onstop = () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
      setTake({ url: urlRef.current, duration: (performance.now() - startedAt) / 1000 });
    };
    recorder.start();
    startedAt = performance.now();

    const buf = new Float32Array(analyser.fftSize);
    let shown = 0;
    let raf = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v));
      shown = Math.max(peakToLevel(peak), shown * 0.92);
      setLevel(shown);
      const secs = (performance.now() - startedAt) / 1000;
      setElapsed(secs);
      // Al llegar al límite se detiene sola y avisa (p. ej. para parar también el metrónomo).
      if (secs >= MAX_TAKE_S) {
        stopRef.current();
        stopRef.current = () => {};
        setLevel(0);
        setStatus("idle");
        return onLimitRef.current?.();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    stopRef.current = () => {
      cancelAnimationFrame(raf);
      if (recorder.state !== "inactive") recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
      source.disconnect();
      clickBus().disconnect(dest);
    };
    setStatus("recording");
    return true;
  }, [deviceId]);

  const stop = useCallback(() => {
    stopRef.current();
    stopRef.current = () => {};
    setLevel(0);
    setStatus("idle");
  }, []);

  useEffect(() => () => {
    stopRef.current();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { status, take, level, elapsed, start, stop };
}
