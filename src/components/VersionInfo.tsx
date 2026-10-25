import { changelog } from '@/data/changelog';
import { cn } from '@/lib/cn';

// La versión abre las novedades al hacer clic.
export function VersionInfo({ className }: { className?: string }) {
    return <details className={cn('font-mono text-2xs', className)}>
        <summary className="cursor-pointer list-none hover:text-fg">Versión {process.env.NEXT_PUBLIC_APP_VERSION} (beta)</summary>
        <ul className="mt-2 flex flex-col gap-2 font-sans">
            {changelog.map(({ version, date, notes }) => <li key={version}>
                <span className="font-mono text-muted">{version} · {date}</span>
                {notes.map(note => <p key={note} className="text-fg-soft">{note}</p>)}
            </li>)}
        </ul>
    </details>;
}
