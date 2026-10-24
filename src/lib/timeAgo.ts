/**
 * Fechas para mostrar. Lo guardado es UTC (`createdAt` de Firestore); aquí se muestra en la hora del navegador.
 * `timeAgo`: «hace 5 minutos», «hace 2 horas», «ayer», «hace 3 días»… · `fullDateTime`: «jueves, 23 de octubre, 19:42».
 */
const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60]];

export function timeAgo(at: number, now = Date.now()) {
  const seconds = Math.round((at - now) / 1000);
  if (Math.abs(seconds) < 60) return "hace un momento";
  for (const [unit, size] of UNITS) if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return relative.format(Math.round(seconds / 60), "minute");
}

export const fullDateTime = (at: number) => new Date(at).toLocaleString("es", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
