'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from '@/lib/router';
import { BookOpen, CircleHelp, House, ListChecks, Menu, MessageCircle, Users, Wrench, X } from 'lucide-react';
import { useAccount } from '@/lib/account';
import { AccountBar } from '@/components/AccountBar';
import { cn } from '@/lib/cn';

const primaryLinks = [{ to: '/', label: 'Hoy', icon: House }, { to: '/plan', label: 'Mi plan', icon: ListChecks }, { to: '/train', label: 'Ejercicios', icon: BookOpen }, { to: '/community', label: 'Comunidad', icon: Users }, { to: '/tools', label: 'Herramientas', icon: Wrench }];

const linkBase = 'relative flex items-center rounded-md border border-transparent font-bold text-muted transition-colors hover:bg-raised hover:text-white';
const linkActive = 'bg-brand-soft text-fg [&>svg]:text-accent before:absolute before:rounded before:bg-brand';
const sidebarLink = { base: 'mb-1 min-h-11.5 gap-3 px-3.5 text-md', active: 'before:inset-y-2.5 before:-left-px before:w-[3px]' };
const bottomLink = { base: 'min-h-13 flex-col justify-center gap-1 text-3xs', active: 'before:inset-x-1/4 before:bottom-0 before:h-0.5' };

export function AppShell({ children }: { children: ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const account = useAccount();
    // Sin sesión no hay plan: se practica igual, pero sin registrar progreso.
    const links = account ? primaryLinks : primaryLinks.filter(link => link.to !== '/plan');
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    const isActive = (to: string, active: boolean) => active || (to === '/train' && (pathname.startsWith('/lessons') || pathname.startsWith('/modules')));
    const navigation = (items: typeof primaryLinks, variant: typeof sidebarLink) => items.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} end={to === '/'} to={to} onClick={() => setMenuOpen(false)} className={({ isActive: active }) => cn(linkBase, variant.base, isActive(to, active) && cn(linkActive, variant.active))}>
            <Icon size={19}/><span>{label}</span>
        </NavLink>);

    return <div className="min-h-dvh">
        <a href="#main-content" className="fixed -top-20 left-60 z-80 bg-accent-strong p-3 text-canvas focus:top-3">Ir al contenido</a>
        {menuOpen && <button className="fixed inset-0 z-35 bg-black/60 md:hidden" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}/>}

        <aside className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-61 flex-col border-r border-line-soft bg-linear-to-b from-surface to-canvas px-4 pt-6 pb-4 transition-transform',
            'md:w-50 md:translate-x-0 md:px-3 md:pt-8 xl:w-56 xl:px-4',
            menuOpen ? 'overflow-y-auto shadow-[20px_0_80px_#0005]' : 'invisible -translate-x-full md:visible',
        )}>
            <Link to="/" className="relative flex items-center gap-2 px-px pb-3 font-black whitespace-nowrap md:gap-0.5 xl:gap-2">
                <img className="h-12 w-11 object-contain drop-shadow-[0_0_10px_#e0662f30] md:w-9 xl:w-11" src="/icons/quest-mark.svg" alt=""/>
                <span className="text-2xl tracking-tight md:text-[1.3125rem] xl:text-[1.4375rem]">Fret <span className="text-brand">Quest</span></span>
            </Link>
            <p className="mx-3.5 mt-3 mb-3 text-3xs tracking-[0.2em] text-subtle">TU ENTRENAMIENTO</p>
            <nav aria-label="Principal">
                {navigation(links, sidebarLink)}
            </nav>
            {/* Abajo: ayuda y comunidad externa, con el mismo estilo que la navegación (en móvil, desde el menú). */}
            <nav aria-label="Ayuda" className="mt-auto mb-3">
                <NavLink to="/guide" onClick={() => setMenuOpen(false)} className={({ isActive: active }) => cn(linkBase, sidebarLink.base, active && cn(linkActive, sidebarLink.active))}><CircleHelp size={19}/><span>Cómo funciona</span></NavLink>
                <a href="https://chat.whatsapp.com/HRB1OA3qiK3CwHjDMBmTJu?mode=gi_t" target="_blank" rel="noopener noreferrer" className={cn(linkBase, sidebarLink.base)}>
                    <MessageCircle size={19}/><span>PG Skool</span>
                </a>
            </nav>
            <div className="flex flex-col gap-1 border-t border-line-soft px-3.5 pt-4 text-xs text-subtle">
                <a href="https://peruguitar.com" className="mb-2 inline-flex min-h-8 items-center text-xs text-muted transition-colors hover:text-fg">Volver a Peru Guitar →</a>
                <p className="text-3xs text-muted">Un producto de <a href="https://peruguitar.com" className="text-accent hover:underline">PeruGuitar</a></p>
                <span className="font-mono text-2xs">Versión {process.env.NEXT_PUBLIC_APP_VERSION}</span>
            </div>
        </aside>

        <div className="min-w-0 md:ml-50 xl:ml-56">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line-soft bg-canvas/95 px-4.5 backdrop-blur-md md:justify-end md:px-6 xl:px-9.5">
                <div className="flex items-center gap-4 md:hidden">
                    <button aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
                    <Link to="/" className="text-lg font-black tracking-tight">Fret <span className="text-brand">Quest</span></Link>
                </div>
                <AccountBar/>
            </header>
            <main id="main-content" key={pathname} className="mx-auto max-w-365 min-w-0 animate-rise px-4.5 pt-6.5 pb-24 md:px-6 md:py-7.5 xl:px-9.5 xl:pt-9 xl:pb-11">
                {children}
            </main>
        </div>

        <nav aria-label="Accesos móviles" className="fixed inset-x-0 bottom-0 z-30 grid grid-flow-col auto-cols-fr border-t border-line-soft bg-canvas/95 p-1.5 pb-[calc(5px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
            {navigation(links, bottomLink)}
        </nav>
    </div>;
}
