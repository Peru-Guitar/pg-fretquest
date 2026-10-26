import { ROUTES, userProfileUrl } from '@/lib/routes';
import { useEffect, useRef, useState } from 'react';
import { Link, useHydrated } from '@/lib/router';
import { ChevronDown, IdCard, LogIn, LogOut, UserRound } from 'lucide-react';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { DEFAULT_RHYTHM, levelLabel, signOut, useAccount } from '@/lib/account';
import { cn } from '@/lib/cn';
import { completedDaysThisWeek, useProgress } from '@/lib/progressDb';

/**
 * Barra superior de la cuenta. Sin sesión: botón de entrar destacado.
 * Con sesión: meta de la semana (barra de progreso), nivel y menú del usuario.
 */
export function AccountBar() {
    const account = useAccount();
    const hydrated = useHydrated();
    const progress = useProgress();
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('pointerdown', onPointer); window.removeEventListener('keydown', onKey); };
    }, [open]);

    // Hasta saber si hay sesión (HTML estático e hidratación), un hueco neutro: ni «Entrar» ni el nombre.
    if (!hydrated) return <span aria-hidden className="flex items-center gap-2.5"><span className="hidden h-2 w-44 rounded-full bg-white/6 sm:block lg:w-56"/><span className="size-9 rounded-full bg-white/8"/></span>;
    if (!account) return <Link to={ROUTES.login} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand hover:bg-brand-strong px-5 text-sm font-bold text-white transition hover:-translate-y-0.5"><LogIn size={17}/>Entrar</Link>;

    // Meta de la semana: días con la sesión completada / ritmo elegido.
    const goal = account.weeklyGoal ?? DEFAULT_RHYTHM;
    const done = completedDaysThisWeek(progress);
    const reached = done >= goal;
    const initials = account.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

    return <div className="flex items-center gap-4 md:gap-6">
        <Link to={ROUTES.plan} title="Tu semana" className="hidden w-44 flex-col gap-1.5 sm:flex lg:w-56">
            <span className="flex items-center justify-between text-2xs">
                <span className="font-bold text-fg-soft">Tu semana</span>
                <span className={cn('font-mono font-bold', reached ? 'text-success' : 'text-fg')}>{reached ? '¡Cumplida! ' : ''}{done}/{goal} días</span>
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-white/8"><span className={cn('block h-full rounded-full transition-[width]', reached ? 'bg-success' : 'bg-blue')} style={{ width: `${Math.min(100, done / goal * 100)}%` }}/></span>
        </Link>
        <div ref={root} className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-white/5">
                <span className="grid size-9 place-items-center rounded-full border border-line-strong bg-raised text-fg text-xs font-black">{initials}</span>
                <span className="hidden text-left text-xs leading-tight md:block">
                    <b className="block max-w-36 truncate text-sm text-fg">{account.name}</b>
                    {account.level ? <span className="flex items-center gap-1.5 text-muted">{levelLabel(account.level)}<DifficultySignal difficulty={account.level}/></span> : <span className="text-muted">Sin nivel</span>}
                </span>
                <ChevronDown size={15} className={cn('text-muted transition', open && 'rotate-180')}/>
            </button>
            {open && <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-raised p-2 shadow-[0_20px_60px_#0008]">
                <div className="px-3 pt-1 pb-3 sm:hidden">
                    <p className="text-2xs font-bold text-fg-soft">Tu semana · {done}/{goal} días</p>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/8"><span className={cn('block h-full rounded-full', reached ? 'bg-success' : 'bg-blue')} style={{ width: `${Math.min(100, done / goal * 100)}%` }}/></span>
                </div>
                <Link to={userProfileUrl(account.uid)} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fg-soft hover:bg-white/5 hover:text-fg"><IdCard size={17}/>Mi perfil</Link>
                <Link to={ROUTES.account} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fg-soft hover:bg-white/5 hover:text-fg"><UserRound size={17}/>Mi cuenta</Link>
                <button type="button" role="menuitem" onClick={() => { setOpen(false); void signOut(); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fg-soft hover:bg-white/5 hover:text-fg"><LogOut size={17}/>Cerrar sesión</button>
            </div>}
        </div>
    </div>;
}
