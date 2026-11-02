/**
 * Meta semanal: horas de práctica por semana (`users/{uid}.weeklyHours`).
 */
export const WEEKLY_HOURS = [
  { hours: 1, label: "Tranquilo", text: "Para mantener la mano activa." },
  { hours: 3, label: "Constante", text: "Recomendado: progreso real sin agobio." },
  { hours: 5, label: "Comprometido", text: "Avance visible semana a semana." },
  { hours: 7, label: "Intenso", text: "Una hora al día, o lo que te acomode." },
];
export const DEFAULT_WEEKLY_HOURS = 3;

const isWeeklyHours = (value: unknown): value is number => WEEKLY_HOURS.some(option => option.hours === value);

/** La meta guardada de un usuario, si es válida. */
export const weeklyHoursOf = (data: { weeklyHours?: unknown }) => isWeeklyHours(data.weeklyHours) ? data.weeklyHours : undefined;

/** Tiempo legible («25 min», «1 h 20 min», «3 h»), hacia abajo: no muestra «3 h» hasta llegar de verdad a 3 h. */
export function timeLabel(seconds: number) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}
