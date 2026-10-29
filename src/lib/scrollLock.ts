import { useEffect } from "react";

// Bloquea el scroll de la página mientras haya algún bloqueo activo (modal, cuenta de entrada, modo práctica).
// Va en <html> y no en <body>: con `overflow-x: clip` en <html> (globals.css), el que hace scroll es <html>.
let locks = 0;

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) document.documentElement.style.overflow = "hidden";
    return () => { if (--locks === 0) document.documentElement.style.overflow = ""; };
  }, [active]);
}
