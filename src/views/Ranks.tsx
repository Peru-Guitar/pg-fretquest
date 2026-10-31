'use client';

import { Heart } from 'lucide-react';
import { RankIcon } from '@/components/RankIcon';
import { Card, PageTitle } from '@/components/ui';
import { MAX_LEVEL, RANKS } from '@/data/ranks';
import { TIER_COLOR } from '@/components/quest/rankStyle';
import { LEVELS, rankLevels } from '@/lib/ranks';
import { cn } from '@/lib/cn';

/** Página «Rangos»: qué miden y cada rango con sus niveles y el tramo de minutos de cada uno. */
export default function RanksPage() {
    return <>
        <PageTitle eyebrow="RANGOS" title="Tu rango de compromiso" text={`${MAX_LEVEL} niveles y ${RANKS.length} rangos que suben con cada hora que entrenas.`}/>

        <Card className="mb-8 flex flex-col gap-4 md:flex-row">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue/20 text-accent-strong"><Heart size={24}/></span>
            <div className="flex-1 text-sm leading-relaxed text-fg-soft">
                <h2 className="mb-2 text-xl text-fg">Cuenta tu constancia</h2>
                <p>Tu rango crece con el tiempo que practicas en Fret Quest. Nosotros solo vemos el reloj, no cómo tocas, así que el resto queda en tu honestidad.</p>
                <p className="mt-2">Es una forma sana y con un toque de juego de seguir tu dedicación y medirte con la comunidad. No dice qué tan buen guitarrista eres, pero quien entrena seguido, mejora.</p>
            </div>
        </Card>

        <section>
            <h2 className="mb-1 text-xl">Rangos y niveles</h2>
            <p className="mb-5 text-sm text-muted">Minutos acumulados de práctica en cada nivel. Las pausas no suman y lo que alcanzas no se pierde.</p>
            <div className="flex flex-col gap-8">{RANKS.map((rank) => {
                const { from, to } = rankLevels(rank);
                return <section key={rank.name}>
                    <h3 className={cn('mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-black md:text-xl', TIER_COLOR[rank.tier])}><RankIcon rank={rank}/>{rank.name}<span className="mx-1 hidden h-px flex-1 bg-line sm:block"/><span className="font-mono text-xs font-normal text-subtle">Niveles {from}–{to} · desde {rank.hours} h</span></h3>
                    <Card>
                        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{LEVELS.filter(level => level.rank === rank).map(({ level, minutes }) => {
                            const next = LEVELS[level];
                            return <li key={level} className="flex items-center gap-3 rounded-xl border border-line bg-raised px-3.5 py-3">
                                <span className="w-8 shrink-0 text-center font-mono text-2xl font-black text-fg">{level}</span>
                                <span className="font-mono text-xs text-fg-soft">{next ? `${minutes.toLocaleString('es')} – ${next.minutes.toLocaleString('es')} min` : `${minutes.toLocaleString('es')}+ min`}</span>
                            </li>;
                        })}</ol>
                    </Card>
                </section>;
            })}</div>
        </section>
    </>;
}
