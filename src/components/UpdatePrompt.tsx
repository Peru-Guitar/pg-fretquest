'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { buttonClass } from '@/components/ui/buttonClass';

const CHECK_EVERY_MS = 5 * 60 * 1000;

/**
 * Registra el service worker (soporte PWA) y avisa cuando hay una versión nueva publicada:
 * compara /version.json con el build en ejecución al volver a la app y cada 5 minutos.
 */
export function UpdatePrompt() {
    const [outdated, setOutdated] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        const check = () => fetch('/version.json', { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null)
            .then((data: { buildId?: string } | null) => { if (data?.buildId && data.buildId !== process.env.NEXT_PUBLIC_BUILD_ID) setOutdated(true); })
            .catch(() => undefined);
        const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
        const timer = setInterval(check, CHECK_EVERY_MS);
        document.addEventListener('visibilitychange', onVisible);
        return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    }, []);

    if (!outdated) return null;

    return <div role="status" className="fixed right-4 bottom-4 z-90 flex items-center gap-3 rounded-xl border border-line-strong bg-card py-2 pr-2 pl-4 text-sm text-fg shadow-2xl shadow-black/40">
        <RefreshCw size={16} className="text-accent"/>
        Hay una nueva versión
        <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary', 'sm')}>Actualizar</button>
    </div>;
}
