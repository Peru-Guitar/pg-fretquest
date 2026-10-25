'use client';

import { Card, PageTitle } from '@/components/ui';
import { changelog } from '@/data/changelog';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dayLabel = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} de ${MONTHS[m - 1]} de ${y}`;
};

// Una tarjeta por día: varias versiones subidas el mismo día van juntas.
export default function ChangelogPage() {
    const days = new Map<string, typeof changelog>();
    for (const entry of changelog) days.set(entry.date, [...(days.get(entry.date) ?? []), entry]);
    return <>
        <PageTitle eyebrow="FRET QUEST · BETA" title="Novedades" text="Lo nuevo en cada versión."/>
        <div className="flex flex-col gap-4">
            {[...days].map(([date, entries]) => <Card key={date}>
                <h2 className="mb-3 text-lg">{dayLabel(date)}</h2>
                <div className="flex flex-col gap-3">
                    {entries.map(({ version, notes }) => <div key={version}>
                        <p className="font-mono text-xs text-muted">v{version}</p>
                        <ul className="list-disc pl-5 text-base text-fg-soft">
                            {notes.map(note => <li key={note}>{note}</li>)}
                        </ul>
                    </div>)}
                </div>
            </Card>)}
        </div>
    </>;
}
