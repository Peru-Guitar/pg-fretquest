import { Link } from '@/lib/router';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';

// La versión lleva a la página de novedades.
export function VersionInfo({ className }: { className?: string }) {
    return <Link to={ROUTES.changelog} className={cn('inline-block font-mono text-2xs hover:text-fg hover:underline', className)}>Versión {process.env.NEXT_PUBLIC_APP_VERSION} (beta)</Link>;
}
