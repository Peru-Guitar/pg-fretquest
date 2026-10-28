'use client';

import { ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Tip } from '@/components/ui/Tip';
import { useAccount } from '@/lib/account';
import { useCommunity } from '@/lib/community';
import { initials, toneOf } from '@/lib/avatar';
import { ROUTES, userProfileUrl } from '@/lib/routes';
import { cn } from '@/lib/cn';

/**
 * Pulso de la comunidad en el Home: quiénes practican esta semana y tu puesto, en una franja.
 * Usa los mismos datos (y la misma caché de 1 hora) que Comunidad: si ya la abriste, no lee nada.
 */
const FACES = 5;
const hoursLabel = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;
};

/** `embedded`: franja al pie de otra tarjeta (el banner del Home) en vez de tarjeta propia. */
export function CommunityPulse({ embedded = false }: { embedded?: boolean }) {
    const frame = embedded ? 'relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm' : 'mt-5 rounded-xl border border-line bg-card';
    const account = useAccount();
    const { data } = useCommunity(account !== null);
    if (!account) return null;
    // Esqueleto del mismo alto: la página no salta al llegar los datos.
    if (!data) return <div aria-hidden className={cn('h-16 animate-pulse', frame)}/>;
    if (data.ranking.length === 0) return null;

    const shown = data.ranking.slice(0, FACES);
    const rest = data.ranking.length - shown.length;
    const place = data.ranking.findIndex(row => row.uid === account.uid);
    const mine = data.ranking[place];
    return <section aria-label="Comunidad esta semana" className={cn('flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 md:px-5', frame)}>
        <ul className="flex shrink-0 items-center -space-x-2">
            {shown.map(row => <li key={row.uid}>
                <Link to={userProfileUrl(row.uid)} aria-label={`${row.name}: ${hoursLabel(row.seconds)}`} className={cn('group/face relative grid size-9 place-items-center rounded-full text-2xs font-black text-white ring-2 ring-raised transition-transform duration-150 hover:z-10 hover:-translate-y-0.5', row.uid === account.uid ? 'bg-raised !text-fg' : toneOf(row.uid))}>
                    {initials(row.name)}
                    <Tip>{row.name} <span className="text-muted">· {hoursLabel(row.seconds)}</span></Tip>
                </Link>
            </li>)}
            {rest > 0 && <li><Link to={ROUTES.community} className="relative grid size-9 place-items-center rounded-full bg-raised text-2xs font-black text-fg-soft ring-2 ring-raised hover:text-fg">+{rest}</Link></li>}
        </ul>
        <p className="order-first min-w-0 basis-full text-sm text-fg-soft sm:order-none sm:basis-auto sm:flex-1">
            <b className="block text-fg sm:inline">{data.people} {data.people === 1 ? 'guitarrista practicando' : 'guitarristas practicando'}</b> esta semana
            {data.today > 0 && <span className="text-muted"> · <span className="inline-block size-1.5 -translate-y-0.5 animate-pulse rounded-full bg-success"/> {data.today} hoy</span>}
        </p>
        <Link to={ROUTES.community} className="group ml-auto flex shrink-0 items-center gap-2 text-sm sm:ml-0">
            {mine
                ? <span className="text-muted">Ver <b className="text-accent">ranking</b></span>
                : <span className="text-muted">¡Practica hoy y <b className="text-accent">entra al ranking</b>!</span>}
            <ChevronRight size={16} className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent"/>
        </Link>
    </section>;
}
