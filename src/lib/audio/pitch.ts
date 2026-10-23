/** Cuerdas al aire en afinación estándar (A4 = 440 Hz), de la 6.ª a la 1.ª. */
export const GUITAR_STRINGS = [
  { name: "E", hz: 82.41 },
  { name: "A", hz: 110.0 },
  { name: "D", hz: 146.83 },
  { name: "G", hz: 196.0 },
  { name: "B", hz: 246.94 },
  { name: "e", hz: 329.63 },
];

export const centsBetween = (hz: number, ref: number) => 1200 * Math.log2(hz / ref);

/** Índice de la cuerda más cercana (en cents) a una frecuencia. */
export function nearestString(hz: number) {
  let best = 0;
  GUITAR_STRINGS.forEach((s, i) => {
    if (Math.abs(centsBetween(hz, s.hz)) < Math.abs(centsBetween(hz, GUITAR_STRINGS[best].hz))) best = i;
  });
  return best;
}

/**
 * Frecuencia fundamental por YIN (de Cheveigné & Kawahara, 2002).
 * Devuelve null si hay silencio o la señal no es periódica.
 * Con 4096 muestras a 48 kHz cubre de ~60 Hz (por debajo del Mi grave) a 1 kHz.
 */
export function detectPitch(buf: Float32Array, sampleRate: number, minHz = 60, maxHz = 1000): number | null {
  let rms = 0;
  for (const v of buf) rms += v * v;
  if (Math.sqrt(rms / buf.length) < 0.01) return null;

  const maxTau = Math.min(Math.floor(sampleRate / minHz), Math.floor(buf.length / 2));
  const minTau = Math.floor(sampleRate / maxHz);
  const w = buf.length - maxTau;
  const d = new Float32Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < w; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }

  // Diferencia normalizada acumulada; primer mínimo bajo el umbral.
  let running = 0;
  let tau = -1;
  for (let t = 1; t <= maxTau; t++) {
    running += d[t];
    d[t] = running ? (d[t] * t) / running : 1;
    if (tau < 0 && t > minTau + 1 && d[t - 1] < 0.15 && d[t - 1] <= d[t]) tau = t - 1;
  }
  if (tau < 0) return null;

  // Interpolación parabólica para precisión sub-muestra.
  const [a, b, c] = [d[tau - 1], d[tau], d[tau + 1]];
  const shift = (a - c) / (2 * (a - 2 * b + c)) || 0;
  return sampleRate / (tau + shift);
}
