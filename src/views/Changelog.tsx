'use client';

import { Card, PageTitle } from '@/components/ui';
import { changelog } from '@/data/changelog';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dayLabel = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} de ${MONTHS[m - 1]} de ${y}`;
};

// Línea de tiempo por día; cada versión del día en su propia tarjeta.
export default function ChangelogPage() {
    const days = new Map<string, typeof changelog>();
    for (const entry of changelog) days.set(entry.date, [...(days.get(entry.date) ?? []), entry]);
    return <>
        <PageTitle eyebrow="FRET QUEST" title="Novedades" text="Lo nuevo en cada versión."/>
        <ol className="relative flex flex-col gap-8 border-l border-line pl-6">
            {[...days].map(([date, entries], i) => <li key={date} className="relative">
                <span className={`absolute -left-[31px] top-1.5 size-3 rounded-full border-2 ${i === 0 ? 'border-accent bg-accent' : 'border-line-strong bg-surface'}`}/>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{dayLabel(date)}</h2>
                <div className="flex flex-col gap-3">
                    {entries.map(({ version, notes }) => <Card key={version}>
                        <span className="mb-3 inline-block rounded-full border border-accent px-2.5 py-0.5 font-mono text-xs text-accent-strong">v{version}</span>
                        <ul className="flex flex-col gap-2 text-base text-fg-soft">
                            {notes.map(note => <li key={note} className="flex gap-3">
                                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"/>
                                <span>{note}</span>
                            </li>)}
                        </ul>
                    </Card>)}
                </div>
            </li>)}
        </ol>
    </>;
}
