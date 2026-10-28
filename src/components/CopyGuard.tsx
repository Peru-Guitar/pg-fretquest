"use client";

import { useEffect } from "react";

// Sin clic derecho ni copiar texto en el sitio. Los campos de formulario siguen funcionando con normalidad.
const isField = (target: EventTarget | null) =>
  target instanceof HTMLElement && !!target.closest("input, textarea, [contenteditable='true']");

export function CopyGuard() {
  useEffect(() => {
    const block = (event: Event) => {
      if (!isField(event.target)) event.preventDefault();
    };
    const events = ["contextmenu", "copy", "cut", "selectstart", "dragstart"] as const;
    events.forEach((name) => document.addEventListener(name, block));
    return () => events.forEach((name) => document.removeEventListener(name, block));
  }, []);

  return null;
}
