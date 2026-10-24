'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Navigate } from '@/lib/router';
import { legacyRoute } from '@/lib/routes';

/** En la 404: lleva las URL antiguas (inglés, con ?exercise=) a las nuevas; cualquier otra, al inicio. */
export function LegacyRedirect() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return <Navigate to={legacyRoute(pathname, new URLSearchParams(searchParams.toString())) ?? '/'} replace/>;
}
