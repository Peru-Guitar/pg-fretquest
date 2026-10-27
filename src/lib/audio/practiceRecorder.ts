import { useCallback, useEffect, useRef, useState } from "react";
import { connectClicks, disconnectClicks } from "./guitar";
import { audio } from "./metronome";

/** 96 kbps sobra para escucharse y deja el peso acotado: ~0,7 MB por minuto. */
const BITS_PER_SECOND = 96_000;
/** Tope de toda la práctica grabada (todas las rondas): las sesiones del plan pueden ser largas. */
const MAX_SECONDS = 15 * 60;
/** Chrome/Firefox graban webm/opus; Safari, mp4/aac. */
const TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"];

/** `seconds`: lo que duró la toma (el webm de MediaRecorder no trae duración). */
export type RoundTake = { round: number; url: string; seconds: number };
/** `none`: no hay ninguna entrada de audio; `denied`: se negó el permiso. */
export type InputStatus = "off" | "starting" | "ready" | "denied" | "none";

/** Entrada abierta: el micrófono, su medidor y la mezcla que se graba (entrada + clics del metrónomo). */
type Input = { stream: MediaStream; source: MediaStreamAudioSourceNode; analyser: AnalyserNode; mix: MediaStreamAudioDestinationNode; clicks: boolean };

/**
 * Grabación temporal de la práctica, una toma por ronda y solo en memoria: nunca se sube ni se guarda en disco.
 * `open` abre la entrada elegida (desde un clic) y la deja lista; `startTake`/`endTake` graban cada ronda.
 * Se graba la entrada con el metrónomo tomado directo de la app: la guitarra de guía nunca entra en la grabación.
 * Las tomas se borran con `clear`, al salir de la página o al refrescarla (con aviso si aún no se escucharon).
 */
export function usePracticeRecorder() {
  const input = useRef<Input | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const recordedMs = useRef(0);
  // Sube al borrar: una toma que termina después ya no se guarda.
  const generation = useRef(0);
  const urls = useRef<string[]>([]);
  const [status, setStatus] = useState<InputStatus>("off");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [takes, setTakes] = useState<RoundTake[]>([]);
  const [recording, setRecording] = useState(false);
  const [heard, setHeard] = useState(false);

  /** Cierra la toma de la ronda en curso. */
  const endTake = useCallback(() => {
    const current = recorder.current;
    recorder.current = null;
    setRecording(false);
    if (current?.state === "recording") current.stop();
  }, []);

  /** Cierra la toma (se queda) y suelta el micrófono. */
  const close = useCallback(() => {
    endTake();
    const current = input.current;
    input.current = null;
    setStatus("off");
    if (!current) return;
    current.stream.getTracks().forEach((track) => track.stop());
    current.source.disconnect();
    if (current.clicks) disconnectClicks(current.mix);
  }, [endTake]);

  /** Abre la entrada (`deviceId` vacío = la predeterminada) sin los filtros de voz que estropean una guitarra. */
  const open = useCallback(async (deviceId = "") => {
    close();
    if (!navigator.mediaDevices?.getUserMedia) return setStatus("none");
    setStatus("starting");
    let stream: MediaStream;
    try {
      const constraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
      stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { ...constraints, deviceId: { exact: deviceId } } : constraints });
    } catch (error) {
      return setStatus((error as DOMException).name === "NotAllowedError" ? "denied" : "none");
    }
    const ac = audio();
    const source = ac.createMediaStreamSource(stream);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    const mix = ac.createMediaStreamDestination();
    source.connect(analyser);
    source.connect(mix);
    input.current = { stream, source, analyser, mix, clicks: false };
    // Los nombres de las entradas solo aparecen con el permiso concedido.
    const all = await navigator.mediaDevices.enumerateDevices();
    setDevices(all.filter((device) => device.kind === "audioinput" && device.deviceId && device.deviceId !== "default"));
    setStatus("ready");
  }, [close]);

  /** Empieza la toma de la ronda (con la entrada abierta y sin pasar el tope). */
  const startTake = useCallback((round: number) => {
    const current = input.current;
    if (!current || recorder.current || recordedMs.current >= MAX_SECONDS * 1000) return;
    // El metrónomo se suma a la mezcla aquí: antes de practicar el sonido aún no estaba cargado.
    if (!current.clicks) { connectClicks(current.mix); current.clicks = true; }
    const take = new MediaRecorder(current.mix.stream, { mimeType: TYPES.find((type) => MediaRecorder.isTypeSupported(type)), audioBitsPerSecond: BITS_PER_SECOND });
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    const own = generation.current;
    take.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    take.onstop = () => {
      const ms = Date.now() - startedAt;
      recordedMs.current += ms;
      if (own !== generation.current || !chunks.length) return;
      const url = URL.createObjectURL(new Blob(chunks, { type: take.mimeType }));
      urls.current.push(url);
      setTakes((list) => [...list, { round, url, seconds: ms / 1000 }]);
    };
    recorder.current = take;
    take.start(1000);
    setRecording(true);
  }, []);

  /** Borra todas las tomas (la entrada sigue abierta). */
  const clear = useCallback(() => {
    generation.current++;
    endTake();
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
    recordedMs.current = 0;
    setTakes([]);
    setHeard(false);
  }, [endTake]);

  // Al salir de la página (también si el navegador la guarda en caché para «Atrás») se borra todo.
  useEffect(() => {
    const leave = () => { clear(); close(); };
    window.addEventListener("pagehide", leave);
    return () => { window.removeEventListener("pagehide", leave); leave(); };
  }, [clear, close]);
  // Refrescar o cerrar la pestaña con tomas sin escuchar pide confirmación.
  useEffect(() => {
    if (!takes.length || heard) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [takes.length, heard]);

  const analyser = useCallback(() => input.current?.analyser ?? null, []);
  return { open, close, startTake, endTake, clear, analyser, status, devices, takes, recording, markHeard: useCallback(() => setHeard(true), []) };
}
