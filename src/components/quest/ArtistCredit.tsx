import { useState } from 'react';
import { artistImage, artists } from '@/data/artists';
import { cn } from '@/lib/cn';

function ArtistPhoto({ id, name, className }: { id: string; name: string; className: string }) {
    const [ok, setOk] = useState(true);
    const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2);
    return <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-135 from-gold to-brand font-black text-white', className)}>
        {ok ? <img src={artistImage(id)} alt="" width={400} height={400} loading="lazy" decoding="async" onError={() => setOk(false)} className="size-full object-cover"/> : initials}
    </span>;
}

/** Etiqueta pequeña con el autor del ejercicio (listas). */
export function ArtistTag({ id }: { id: string }) {
    const artist = artists[id];
    if (!artist) return null;
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 py-0.5 pr-2.5 pl-0.5 text-2xs font-bold text-gold">
        <ArtistPhoto id={id} name={artist.name} className="size-5 text-[0.5rem]"/>{artist.name}
    </span>;
}

/** Crédito destacado del autor (pantalla del ejercicio). */
export function ArtistCredit({ id }: { id: string }) {
    const artist = artists[id];
    if (!artist) return null;
    return <section className="mb-6 flex items-center gap-4 rounded-2xl border border-gold/35 bg-linear-120 from-gold/15 via-card to-card p-4 md:gap-5 md:p-5">
        <ArtistPhoto id={id} name={artist.name} className="size-16 text-xl ring-2 ring-gold/50 md:size-20 md:text-2xl"/>
        <div className="min-w-0">
            <p className="text-3xs font-black tracking-[0.18em] text-gold">EJERCICIO DE ARTISTA</p>
            <h2 className="mt-1 text-xl md:text-2xl">Realizado por {artist.name}</h2>
            <p className="mt-1 text-sm text-muted">{artist.note}</p>
        </div>
    </section>;
}

/** Título de un grupo de lecciones de un artista: su foto, su nombre en grande y una línea hasta el final. */
export function ArtistHeader({ id }: { id: string }) {
    const artist = artists[id];
    if (!artist) return null;
    return <h3 className="flex items-center gap-3.5 text-2xl md:text-3xl">
        <ArtistPhoto id={id} name={artist.name} className="size-12 text-base ring-2 ring-gold/40 md:size-14"/>
        <span className="shrink-0">{artist.name}</span>
        <span aria-hidden className="h-px flex-1 bg-linear-90 from-gold/50 to-line"/>
    </h3>;
}

/** Título de un grupo de lecciones de una misma categoría (p. ej. «Grupos de tres cuerdas»), con el mismo estilo que el de artista. */
export function CategoryHeader({ title }: { title: string }) {
    return <h3 className="flex items-center gap-3.5 text-2xl md:text-3xl">
        <span className="shrink-0">{title}</span>
        <span aria-hidden className="h-px flex-1 bg-linear-90 from-gold/50 to-line"/>
    </h3>;
}
