'use client';

import { Card, PageTitle } from '@/components/ui';
import { changelog } from '@/data/changelog';

export default function ChangelogPage() {
    return <>
        <PageTitle eyebrow="FRET QUEST · BETA" title="Novedades" text="Lo nuevo en cada versión."/>
        <div className="flex flex-col gap-4">
            {changelog.map(({ version, date, notes }) => <Card key={version}>
                <h2 className="mb-2 text-lg">Versión {version} <span className="font-mono text-xs text-muted">· {date}</span></h2>
                <ul className="list-disc pl-5 text-base text-fg-soft">
                    {notes.map(note => <li key={note}>{note}</li>)}
                </ul>
            </Card>)}
        </div>
    </>;
}
