import { useState } from "react";
import { Link } from "react-router";
import { Meter } from "@/components/ui";
import { findExercise, LEVELS } from "@/lib/domain/catalog";
import { addDays, computeReport, dateKey, weekStart, type DayTotal } from "@/lib/domain/report";
import { usePracticeLog } from "@/lib/progress";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function dayLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_SHORT[date.getDay()]} ${d}`;
}

export default function ReportPage() {
  const entries = usePracticeLog();
  const [now] = useState(() => Date.now());
  const report = computeReport(entries, LEVELS, now);
  const today = dateKey(now);
  const recent = [...entries].sort((a, b) => b.at - a.at).slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-black text-fg">Mi progreso</h1>
        <p className="mt-1 text-sm text-muted">Cuánto practicas y cómo avanzas en la ruta. Solo cuentan las sesiones de progreso completadas; el modo práctica no se registra.</p>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Minutos esta semana" value={report.weekMinutes} />
        <Tile label="Minutos este mes" value={report.monthMinutes} />
        <Tile label="Sesiones" value={report.sessions} hint={`${report.totalMinutes} min · ${report.totalXP} XP`} />
        <Tile label="Días seguidos" value={report.streak} hint={`${report.daysPracticed} días con práctica`} />
      </dl>

      <Panel title="Minutos por día" subtitle="Últimos 14 días">
        {report.totalMinutes === 0 ? <Empty /> : <DayBars days={report.lastDays} today={today} />}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Progreso por nivel" subtitle="Lecciones terminadas">
          <ul className="flex flex-col gap-3.5">
            {report.levels.map((l) => (
              <li key={l.number}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <Link to={`/#nivel-${l.number}`} className="truncate text-fg-soft hover:text-fg">
                    <span className="text-muted">{l.number}.</span> {l.title}
                  </Link>
                  <span className="shrink-0 text-muted tabular-nums">{l.done} / {l.total}</span>
                </div>
                <Meter value={(l.done / l.total) * 100} size="sm" label={`Nivel ${l.number}`} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Calendario de práctica" subtitle="Últimas 18 semanas">
          <ActivityCalendar minutesByDate={report.minutesByDate} today={today} />
        </Panel>
      </div>

      <Panel title="Historial reciente">
        {recent.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-semibold">Ejercicio</th>
                <th className="hidden pb-2 font-semibold sm:table-cell">Lección</th>
                <th className="pb-2 font-semibold">Fecha</th>
                <th className="pb-2 text-right font-semibold">BPM</th>
                <th className="pb-2 text-right font-semibold">Min</th>
                <th className="hidden pb-2 text-right font-semibold sm:table-cell">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-raised">
              {recent.map((e) => {
                const ref = findExercise(e.exerciseId);
                return (
                  <tr key={e.id}>
                    <td className="py-2.5 text-fg-soft">{ref ? <Link to={`/practice/${e.exerciseId}`} className="hover:text-fg">{ref.exercise.title}</Link> : e.exerciseId}</td>
                    <td className="hidden py-2.5 text-muted sm:table-cell">{ref?.lesson.title ?? "—"}</td>
                    <td className="py-2.5 text-muted tabular-nums">{new Date(e.at).toLocaleDateString("es", { day: "numeric", month: "short" })}</td>
                    <td className="py-2.5 text-right text-fg-soft tabular-nums">{e.bpm}</td>
                    <td className="py-2.5 text-right text-fg-soft tabular-nums">{e.minutes}</td>
                    <td className="hidden py-2.5 text-right text-success tabular-nums sm:table-cell">+{e.xp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <dt className="text-xs font-bold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-black text-fg tabular-nums">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted">{hint}</dd>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-black text-fg">{title}</h2>
      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty() {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
      Completa una sesión de progreso en cualquier ejercicio para ver tus datos aquí. <Link to="/" className="text-success hover:underline">Ir a la ruta</Link>
    </p>
  );
}

/** Barras de una sola serie: minutos por día, con valor al pasar el cursor o al enfocar. */
function DayBars({ days, today }: { days: DayTotal[]; today: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.minutes), 1);
  const H = 160;

  return (
    <div>
      <div className="relative flex items-end gap-0.5 border-b border-line sm:gap-1.5" style={{ height: H }}>
        {/* Línea guía del máximo, recesiva */}
        <span className="absolute inset-x-0 top-0 border-t border-dashed border-line" aria-hidden />
        <span className="absolute top-0 right-0 -translate-y-full pb-1 text-[11px] text-subtle tabular-nums">{max} min</span>
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            className="group relative flex h-full flex-1 items-end justify-center focus:outline-none"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${dayLabel(d.date)}: ${d.minutes} minutos`}
          >
            <span
              className={`w-full max-w-7 rounded-t-[4px] transition-colors ${d.minutes ? (hover === i ? "bg-success" : "bg-success") : "bg-raised"} group-focus-visible:outline-2 group-focus-visible:outline-success`}
              style={{ height: d.minutes ? Math.max(4, (d.minutes / max) * (H - 8)) : 2 }}
            />
            {hover === i && (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-lg bg-canvas px-2.5 py-1.5 text-xs whitespace-nowrap text-fg shadow-lg ring-1 ring-line">
                <span className="text-muted">{dayLabel(d.date)}</span> · <span className="font-bold tabular-nums">{d.minutes} min</span>
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-0.5 sm:gap-1.5">
        {days.map((d, i) => (
          <span key={d.date} className={`flex-1 text-center text-[10px] ${d.date === today ? "font-bold text-fg" : "text-subtle"} ${i % 2 === 1 && d.date !== today ? "max-sm:invisible" : ""}`}>
            {d.date === today ? "Hoy" : dayLabel(d.date).split(" ")[1]}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Mapa de calor semanal: un solo tono, más intenso con más minutos. */
function ActivityCalendar({ minutesByDate, today }: { minutesByDate: Record<string, number>; today: string }) {
  const WEEKS = 18;
  const start = addDays(weekStart(today), -7 * (WEEKS - 1));
  const steps = ["bg-raised", "bg-success/30", "bg-success/55", "bg-success/80", "bg-success"];
  const level = (m: number) => (m <= 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 40 ? 3 : 4);

  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
        {Array.from({ length: WEEKS * 7 }, (_, i) => {
          const date = addDays(start, i);
          const future = date > today;
          const m = minutesByDate[date] ?? 0;
          return (
            <span
              key={date}
              title={future ? undefined : `${dayLabel(date)}: ${m} min`}
              className={`aspect-square rounded-[3px] ${future ? "opacity-0" : steps[level(m)]} ${date === today ? "ring-1 ring-fg-soft" : ""}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-muted">
        Menos
        {steps.map((c) => <span key={c} className={`size-3 rounded-[3px] ${c}`} />)}
        Más
      </div>
    </div>
  );
}
