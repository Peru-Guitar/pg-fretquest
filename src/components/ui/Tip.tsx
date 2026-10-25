import type { ReactNode } from "react";

/** Tooltip al pasar el cursor (o enfocar con teclado), centrado sobre el elemento con `group/face`. */
export function Tip({ children }: { children: ReactNode }) {
  return <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-[0_10px_30px_#0008] transition duration-150 group-hover/face:translate-y-0 group-hover/face:opacity-100 group-focus-visible/face:translate-y-0 group-focus-visible/face:opacity-100">
    {children}
    <span className="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 border-r border-b border-line bg-raised"/>
  </span>;
}
