import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, Settings, UserRound, Zap } from 'lucide-react';
import { player } from '@/data/questMock';
import { Avatar } from '@/components/ui';
import { usePlayerLevel } from '@/lib/practiceTime';
import { cn } from '@/lib/cn';

const links = [{ to: '/profile', label: 'Mi perfil', icon: UserRound }, { to: '/settings', label: 'Ajustes', icon: Settings }];

/** Barra superior: nivel y puntos visibles, y menú de usuario con perfil y ajustes. */
export function UserMenu() {
    const [open, setOpen] = useState(false);
    const level = usePlayerLevel();
    const root = useRef<HTMLDivElement>(null);

    // Se cierra al hacer clic fuera o con Escape.
    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('pointerdown', onPointer); window.removeEventListener('keydown', onKey); };
    }, [open]);

    return <div className="flex items-center gap-6">
        <span className="hidden items-center gap-2 text-sm text-[#b19bff] sm:flex" title={`${(level.next - level.points).toLocaleString('es')} pts para el nivel ${level.level + 1}`}>
            <Zap size={16} className="fill-gold text-gold"/>Nivel {level.level} · <b className="text-fg">{level.rank}</b><span className="text-muted">·</span><b className="font-mono text-fg">{level.points.toLocaleString('es')} pts</b>
        </span>
        <div ref={root} className="relative">
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition hover:bg-white/5">
            <Avatar size="sm">{player.name[0]}</Avatar>
            <b className="hidden text-sm md:block">{player.name}</b>
            <ChevronDown size={15} className={cn('text-muted transition', open && 'rotate-180')}/>
        </button>
        {open && <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border border-line bg-raised p-2 shadow-[0_20px_60px_#0008]">
            <div>
                {links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fg-soft hover:bg-white/5 hover:text-fg"><Icon size={17}/>{label}</Link>)}
            </div>
        </div>}
        </div>
    </div>;
}
