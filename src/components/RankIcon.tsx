import type { Rank } from '@/data/ranks';
import { cn } from '@/lib/cn';

const BADGES: Record<number, string> = {
    1: 'primer-acorde-v2',
    6: 'entre-cuerdas-v2',
    9: 'riff-hunter-v2',
    12: 'fret-explorer-v2',
    16: 'riff-machine-v3',
    22: 'shred-seeker-v2',
    30: 'fret-warrior-v2',
    42: 'fret-legend-v5',
};

/** La misma insignia transparente en el encabezado, el perfil y la página de rangos. */
export function RankGlyph({ rank, size }: { rank: Rank; size: number }) {
    return <img
        src={`/images/ranks/${BADGES[rank.fromLevel] ?? 'primer-acorde-v2'}.webp`}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="block shrink-0 object-contain"
    />;
}

/** Símbolos sin marco, con lienzo de 250 px y escala óptica uniforme. */
export function RankIcon({ rank, size = 48, className }: { rank: Rank; size?: number; className?: string }) {
    return <span aria-hidden="true" className={cn('shrink-0', className)}>
        <RankGlyph rank={rank} size={size}/>
    </span>;
}
