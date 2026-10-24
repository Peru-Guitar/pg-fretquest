import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./buttonClass";

/* ── Botones ─────────────────────────────────────────────── */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonClass(variant, size), className)} {...props} />;
}

/** Enlace con aspecto de botón y flecha final. */
export function LinkButton({ to, children, variant = "primary", size, className }: { to: string; children: ReactNode; variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  return <Link to={to} className={cn(buttonClass(variant, size), className)}>{children}<ArrowRight size={16} /></Link>;
}

export function IconButton({ active, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-white/2 transition hover:bg-white/5", active && "text-accent", className)} {...props} />;
}

/* ── Texto ───────────────────────────────────────────────── */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("flex items-center gap-1.5 text-3xs font-black tracking-[0.18em] text-accent-strong md:text-2xs", className)}>{children}</p>;
}

export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("flex items-center gap-1.5 text-sm text-muted", className)}>{children}</p>;
}

export function Badge({ children, icon = true, className }: { children: ReactNode; icon?: boolean; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded border border-accent/25 bg-accent/5 px-2 py-1.5 text-4xs font-black tracking-[0.15em] text-accent-strong xs:whitespace-nowrap", className)}>{icon && <Sparkles size={13} />}{children}</span>;
}

export function Tags({ items, className }: { items: ReactNode[]; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2", className)}>{items.map((item, index) => <span key={index} className="rounded-[5px] border border-violet/20 bg-violet/5 px-3 py-2 text-2xs text-fg-soft">{item}</span>)}</div>;
}

/* ── Superficies ─────────────────────────────────────────── */

export function Card({ as: Tag = "section", className, children }: { as?: "section" | "div" | "aside" | "form"; className?: string; children: ReactNode }) {
  return <Tag className={cn("rounded-2xl border border-line bg-card p-5.5 xl:p-6.5", className)}>{children}</Tag>;
}

export function TipCard({ symbol = "✦", title, children }: { symbol?: string; title: string; children: ReactNode }) {
  return <div className="rounded-lg border border-brand/25 bg-linear-145 from-[#e0662f18] to-surface p-6">
    <span className="text-3xl text-accent-strong">{symbol}</span>
    <h3 className="my-2 text-accent">{title}</h3>
    <p className="text-sm leading-loose text-fg-soft">{children}</p>
  </div>;
}

export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("grid size-10.5 shrink-0 place-items-center rounded-lg border border-violet/15 bg-violet/5 text-accent-strong", className)}>{children}</span>;
}

export function Avatar({ children, size = "md", className }: { children: ReactNode; size?: "sm" | "md"; className?: string }) {
  return <span className={cn("grid shrink-0 place-items-center rounded-[10px] border border-brand/30 bg-brand-soft font-black text-accent", size === "sm" ? "size-8 text-sm" : "size-9.5", className)}>{children}</span>;
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-5 py-14 text-center text-muted">
    <span className="mb-4 text-accent">{icon}</span>
    <h2 className="mb-2.5 text-fg">{title}</h2>
    <p>{children}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

/* ── Progreso ────────────────────────────────────────────── */

/** Barra de progreso. `value` va de 0 a 100. */
export function Meter({ value, label, tone = "brand", size = "sm", className }: { value: number; label: string; tone?: "brand" | "success" | "blue"; size?: "sm" | "md" | "lg"; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return <div className={cn("w-full overflow-hidden rounded-full bg-line", { sm: "h-1.5", md: "h-2.5", lg: "h-3" }[size], className)} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
    <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", { brand: "bg-linear-90 from-blue to-[#8350ff]", success: "bg-success", blue: "bg-blue" }[tone])} style={{ width: `${pct}%` }} />
  </div>;
}

/* ── Controles ───────────────────────────────────────────── */

export type TabItem<T extends string> = T | { value: T; label?: ReactNode };

/** Grupo de pestañas/filtros con un elemento seleccionado. */
export function Tabs<T extends string>({ items, value, onChange, label, className }: { items: TabItem<T>[]; value: T; onChange: (value: T) => void; label?: string; className?: string }) {
  return <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
    {items.map(item => {
      const { value: itemValue, label: itemLabel } = typeof item === "string" ? { value: item, label: item } : item;
      const selected = itemValue === value;
      return <button key={itemValue} type="button" aria-pressed={selected} onClick={() => onChange(itemValue)} className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs font-bold transition xs:px-4 xs:text-sm",
        selected ? "border-brand/40 bg-brand-soft text-accent" : "border-transparent text-muted hover:bg-white/5",
      )}>{itemLabel ?? itemValue}</button>;
    })}
  </div>;
}

export function Toggle({ title, text, defaultOn = true }: { title: string; text: string; defaultOn?: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn);
  return <div className="my-6 flex items-center justify-between gap-5 border-b border-line py-5">
    <div><h3>{title}</h3><p className="mt-2 text-xs leading-relaxed text-muted">{text}</p></div>
    <button type="button" role="switch" aria-checked={enabled} aria-label={title} onClick={() => setEnabled(!enabled)} className={cn("h-6 w-10 shrink-0 rounded-full p-0.75", enabled ? "bg-linear-90 from-[#439aff] to-[#8750ee]" : "bg-[#414b55]")}>
      <span className={cn("block size-4.5 rounded-full transition-transform", enabled ? "translate-x-4 bg-white" : "bg-[#d6ded1]")} />
    </button>
  </div>;
}

export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return <label className={cn("my-5.5 flex flex-col gap-2 text-sm text-fg-soft", className)}>{label}{children}</label>;
}

/* ── Layout ──────────────────────────────────────────────── */

/** Contenido principal + columna lateral. Bajo lg la columna pasa debajo (en 2 columnas desde md). */
export function DetailLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-4.5 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
    <div className="flex min-w-0 flex-col gap-6">{children}</div>
    <aside className="grid min-w-0 content-start items-start gap-5 md:max-lg:grid-cols-2 lg:gap-6">{aside}</aside>
  </div>;
}

/* ── Encabezados ─────────────────────────────────────────── */

export function PageTitle({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: ReactNode }) {
  return <div className="mb-7.5 flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-5">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-2.5 mb-3 text-3xl md:text-[clamp(1.6875rem,2.5vw,2.375rem)]">{title}</h1>
      <p className="text-sm leading-relaxed text-muted md:text-md">{text}</p>
    </div>
    {children}
  </div>;
}

export function SectionTitle({ title, to, label = "Ver todo", className }: { title: string; to?: string; label?: string; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-2 xs:gap-4", className)}>
    <h2 className="text-base xs:text-lg xl:text-xl">{title}</h2>
    {to && <Link to={to} className="flex items-center gap-1.5 text-3xs text-link xs:text-2xs md:text-xs">{label}<ArrowRight size={15} /></Link>}
  </div>;
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"><ArrowLeft size={15} />{children}</Link>;
}

/* ── Estadísticas ────────────────────────────────────────── */

const statTones = {
  orange: "from-[#eb6c2220] [&_svg]:text-[#ff9d39]",
  blue: "from-[#259eea20] [&_svg]:text-[#34bdff]",
  green: "from-[#1fe5a018] [&_svg]:text-success",
  gold: "from-[#f4af2820] [&_svg]:text-gold",
};

export function Stat({ icon, value, label, detail, tone = "orange", stacked }: { icon: ReactNode; value: string; label: string; detail?: string; tone?: keyof typeof statTones; stacked?: boolean }) {
  return <div className={cn("flex items-start gap-2 rounded-lg border border-line bg-radial-[at_top_left] to-surface to-70% px-3 py-4 text-left xs:gap-3 xs:px-4 xl:gap-3.5 xl:py-5", statTones[tone], stacked && "max-lg:block")}>
    <span className={cn("flex pt-0.5 drop-shadow-[0_0_8px_currentColor] [&_svg]:size-4.5 xs:[&_svg]:size-5", stacked && "max-lg:mb-3")}>{icon}</span>
    <div>
      <strong className="text-lg leading-tight font-black tracking-tight xs:text-xl xl:text-[1.375rem]">{value}</strong>
      <p className="my-1.5 text-2xs text-muted md:text-xs xl:text-2xs">{label}</p>
      {detail && <small className="text-4xs text-success xs:text-3xs">{detail}</small>}
    </div>
  </div>;
}
