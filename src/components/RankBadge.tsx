import { useHydrated } from '@/lib/router';
import { useAccount } from '@/lib/account';
import { levelFromSeconds } from '@/lib/ranks';
import { RankGlyph } from '@/components/RankIcon';
import { SegmentedBar } from '@/components/quest/SegmentedBar';
import { TIER_BAR, TIER_COLOR } from '@/components/quest/rankStyle';
import { cn } from '@/lib/cn';

/**
 * Tu rango de compromiso (por horas practicadas), con el icono, el nombre del rango, el nivel
 * y una barra de XP por bloques con el progreso al siguiente nivel.
 */
export function RankBadge({ className }: { className?: string }) {
    const account = useAccount();
    const hydrated = useHydrated();
    if (!hydrated || !account) return null;
    const seconds = account.totalSeconds ?? 0;
    const rank = levelFromSeconds(seconds);
    const left = rank.next && Math.ceil(rank.next.minutes - seconds / 60);
    return <span title={left ? `${left} min para el nivel ${rank.next?.level}` : 'Nivel máximo'} className={cn('items-center gap-2.5', className)}>
        <RankGlyph rank={rank.rank} size={36}/>
        <span className="flex w-36 flex-col gap-1 text-xs">
            <span className="flex items-baseline justify-between gap-2">
                <b className={cn('truncate', TIER_COLOR[rank.rank.tier])}>{rank.rank.name}</b>
                <b className="font-mono whitespace-nowrap text-fg">Nv. {rank.level}</b>
            </span>
            <SegmentedBar progress={rank.progress} color={TIER_BAR[rank.rank.tier]}/>
        </span>
    </span>;
}
