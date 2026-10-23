import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Clases de botón compartidas por <Button>, <LinkButton> y enlaces con aspecto de botón. Objetivo táctil ≥ 44 px. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-md border font-black whitespace-nowrap transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50",
    { sm: "min-h-9 px-3 text-2xs", md: "min-h-11 px-4 text-sm", lg: "min-h-13 px-6 text-base" }[size],
    {
      primary: "border-violet/40 bg-brand text-white shadow-[0_4px_20px_#4f4aff25] hover:shadow-[0_5px_25px_#6254ff44]",
      secondary: "border-line-strong bg-raised/50 text-fg-soft hover:border-violet/60",
      ghost: "border-transparent text-fg-soft hover:bg-white/5 hover:text-fg",
      danger: "border-danger/50 text-danger hover:bg-danger/10",
    }[variant],
  );
}
