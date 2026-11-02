import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Estado de una lectura en listas (solo indicador; se marca dentro de la lectura). */
export function ReadStatus({ done }: { done: boolean }) {
    return <span className={cn('flex shrink-0 items-center gap-1 text-2xs', done ? 'text-success' : 'text-subtle')}>{done ? <><Check size={13}/>Leída</> : 'Sin leer'}</span>;
}
