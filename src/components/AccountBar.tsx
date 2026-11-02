import { ROUTES, userProfileUrl } from '@/lib/routes';
import { useEffect, useRef, useState } from 'react';
import { Link, useHydrated } from '@/lib/router';
import { ChevronDown, IdCard, ListChecks, LogIn, LogOut, UserRound } from 'lucide-react';
import { DifficultySignal } from '@/components/quest/DifficultySignal';
import { RankBadge } from '@/components/RankBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { WeekStrip } from '@/components/WeekStrip';
import { levelLabel, signOut, useAccount } from '@/lib/account';
import { cn } from '@/lib/cn';

const item = 'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fg-soft hover:bg-white/5 hover:text-fg';

/**
 * Cuenta, a la derecha del header. Sin sesión: botón de entrar destacado. Con sesión: avatar y nombre, y un menú con
 * tu plan de entrenamiento (el nivel de guitarrista del cuestionario), perfil, cuenta y salir.
 * La semana va a la izquierda del header y el rango, justo antes de esta cuenta; en móvil no caben y van al principio de este menú.
 */
export function AccountBar() {
    const account = useAccount();
    const hydrated = useHydrated();
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
    if (!hydrated) return <span aria-hidden className="size-9 rounded-[22%] bg-white/8"/>;
    if (!account) return <Link to={ROUTES.login} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand hover:bg-brand-strong px-5 text-sm font-bold text-white transition hover:-translate-y-0.5"><LogIn size={17}/>Entrar</Link>;

    const close = () => setOpen(false);

    return <div ref={root} className="relative">
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-white/5">
            <UserAvatar uid={account.uid} name={account.name} avatar={account.avatar} tone="bg-raised" className="size-9 border border-line-strong text-xs !text-fg"/>
            <b className="hidden max-w-36 truncate text-sm text-fg md:block">{account.name}</b>
            <ChevronDown size={15} className={cn('text-muted transition', open && 'rotate-180')}/>
        </button>
        {open && <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-raised p-2 shadow-[0_20px_60px_#0008]">
            <div className="flex flex-col items-start gap-2 border-b border-line-soft px-1 pt-1 pb-3 md:hidden" onClick={close}>
                <WeekStrip className="flex w-full flex-wrap"/>
                <RankBadge className="flex"/>
            </div>
            <Link to={ROUTES.plan} role="menuitem" onClick={close} className={item}>
                <ListChecks size={17}/>
                <span className="flex-1">Mi plan</span>
                {account.level
                    ? <span className="flex items-center gap-1.5 text-xs text-muted">{levelLabel(account.level)}<DifficultySignal difficulty={account.level}/></span>
                    : <span className="text-xs text-muted">Sin elegir</span>}
            </Link>
            <Link to={userProfileUrl(account.uid)} role="menuitem" onClick={close} className={item}><IdCard size={17}/>Mi perfil</Link>
            <Link to={ROUTES.account} role="menuitem" onClick={close} className={item}><UserRound size={17}/>Mi cuenta</Link>
            <button type="button" role="menuitem" onClick={() => { close(); void signOut(); }} className={cn(item, 'w-full')}><LogOut size={17}/>Cerrar sesión</button>
        </div>}
    </div>;
}
