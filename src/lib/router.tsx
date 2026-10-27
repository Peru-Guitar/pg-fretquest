'use client';

/**
 * Capa de navegación sobre Next.js con la misma forma que usaba la app con React Router
 * (Link `to`, NavLink, Navigate, useParams, useSearchParams, useNavigate, useLocation).
 * Así las vistas no cambian al pasar a Next.
 */
import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; children?: ReactNode };

export function Link({ to, ...props }: LinkProps) {
    return <NextLink href={to} {...props}/>;
}

type NavLinkProps = Omit<LinkProps, 'className'> & { end?: boolean; className?: string | ((state: { isActive: boolean }) => string) };

/** Enlace que sabe si su ruta está activa (`end`: solo si coincide exacta). */
export function NavLink({ to, end, className, ...props }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = end || to === '/' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
    return <NextLink href={to} aria-current={isActive ? 'page' : undefined} className={typeof className === 'function' ? className({ isActive }) : className} {...props}/>;
}

/** true solo en el navegador ya hidratado (en el HTML estático y en la hidratación, false). */
export const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/**
 * Redirección. Espera a la hidratación: en el primer render aún no se han leído los datos guardados
 * (sesión, cuenta) y redirigir ahí mandaría a todos al login.
 */
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
    const router = useRouter();
    const hydrated = useHydrated();
    useEffect(() => {
        if (!hydrated) return;
        if (replace) router.replace(to); else router.push(to);
    }, [hydrated, replace, router, to]);
    return null;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
    return (useNextParams() ?? {}) as T;
}

/**
 * Parámetros de la URL (?sesion, ?repetir), como en React Router: tupla y solo de lectura.
 * Se leen de `window.location` y no con el `useSearchParams` de Next, que en la exportación estática dejaría
 * la página vacía en el HTML (sin contenido para Google ni para la vista previa). En el HTML valen vacíos.
 */
export function useSearchParams() {
    usePathname(); // vuelve a leer la URL en cada navegación
    const search = useSyncExternalStore(subscribeToHistory, () => window.location.search, () => '');
    return [useMemo(() => new URLSearchParams(search), [search])] as const;
}
// pushState/replaceState no emiten evento: cambiar solo `?tab=` (misma ruta) no se notaría. Se envuelven una vez.
const HISTORY_EVENT = 'fq:history';
let historyPatched = false;
const patchHistory = () => {
    if (historyPatched) return;
    historyPatched = true;
    for (const method of ['pushState', 'replaceState'] as const) {
        const original = window.history[method].bind(window.history);
        window.history[method] = (...args: Parameters<History['pushState']>) => {
            original(...args);
            // Next llama a pushState dentro de useInsertionEffect, donde no se puede actualizar estado: se avisa después.
            queueMicrotask(() => window.dispatchEvent(new Event(HISTORY_EVENT)));
        };
    }
};
const subscribeToHistory = (listener: () => void) => {
    patchHistory();
    window.addEventListener('popstate', listener);
    window.addEventListener(HISTORY_EVENT, listener);
    return () => {
        window.removeEventListener('popstate', listener);
        window.removeEventListener(HISTORY_EVENT, listener);
    };
};

export function useNavigate() {
    const router = useRouter();
    return (to: string) => router.push(to);
}

export function useLocation() {
    return { pathname: usePathname() };
}
