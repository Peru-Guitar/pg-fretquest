import { useSyncExternalStore } from "react";

/**
 * Valor guardado en localStorage y compartido entre componentes (y pestañas).
 * Si el almacenamiento no está disponible, el valor dura solo esta sesión.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: { value: T } | null = null;

  function get(): T {
    if (cache) return cache.value;
    try {
      const raw = localStorage.getItem(key);
      cache = { value: raw ? (JSON.parse(raw) as T) : fallback };
    } catch {
      cache = { value: fallback };
    }
    return cache.value;
  }

  function set(value: T) {
    cache = { value };
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* sin almacenamiento: queda en memoria */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      cache = null;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  // En el HTML estático (y al hidratar) se usa el valor por defecto; el guardado llega justo después.
  const use = () => useSyncExternalStore(subscribe, get, () => fallback);
  return { get, set, use };
}
