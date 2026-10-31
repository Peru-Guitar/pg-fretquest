import { RANKS } from '@/data/ranks';
import { RankGlyph } from '@/components/RankIcon';
import { TIER_BAR, TIER_COLOR } from '@/components/quest/rankStyle';
import { cn } from '@/lib/cn';

/**
 * Cuántas personas hay en cada rango: una barra apilada (un tramo por rango, con su color) y la leyenda en dos columnas.
 * Compacta a propósito, para ir al lado de otra tarjeta sin estirarla. `byRank`: personas por nombre de rango.
 */
export function RankDistribution({ byRank }: { byRank: { rank: string; people: number }[] }) {
    const count = (name: string) => byRank.find(row => row.rank === name)?.people ?? 0;
    return <>
        <div className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/8">{RANKS.map(rank => {
            const people = count(rank.name);
            return people > 0 && <span key={rank.name} title={`${rank.name}: ${people}`} className={TIER_BAR[rank.tier]} style={{ flexGrow: people }}/>;
        })}</div>
        <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5">{RANKS.map(rank => {
            const people = count(rank.name);
            return <li key={rank.name} className={cn('flex min-w-0 items-center gap-2 text-sm', people === 0 && 'opacity-40')}>
                <RankGlyph rank={rank} size={28}/>
                <span className={cn('min-w-0 flex-1 truncate', TIER_COLOR[rank.tier])}>{rank.name}</span>
                <b className="font-mono text-fg">{people}</b>
            </li>;
        })}</ul>
    </>;
}
