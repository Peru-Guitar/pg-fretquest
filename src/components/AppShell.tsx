import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { BookOpen, ChartNoAxesCombined, House, Info, Menu, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HeaderDailyGoal } from '@/components/DailyGoal';
import { UserMenu } from '@/components/UserMenu';

const primaryLinks = [{ to: '/', label: 'Hoy', icon: House }, { to: '/train', label: 'Entrenar', icon: BookOpen }, { to: '/progress', label: 'Progreso', icon: ChartNoAxesCombined }, { to: '/tools', label: 'Herramientas', icon: Wrench }];

const linkBase = 'relative flex items-center rounded-md border border-transparent font-bold text-[#b0bed6] transition-colors hover:bg-[#17243a] hover:text-white';
const linkActive = 'bg-brand-soft text-[#f5f3ff] [&>svg]:text-[#78b2ff] [&>svg]:drop-shadow-[0_0_7px_#377bff55] before:absolute before:rounded before:bg-linear-to-b before:from-[#4ba7ff] before:to-[#9570ff]';
const sidebarLink = { base: 'mb-1 min-h-11.5 gap-3 px-3.5 text-md', active: 'before:inset-y-2.5 before:-left-px before:w-[3px]' };
const bottomLink = { base: 'min-h-13 flex-col justify-center gap-1 text-3xs', active: 'before:inset-x-1/4 before:bottom-0 before:h-0.5' };

export function AppShell() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
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
            'fixed inset-y-0 left-0 z-40 flex w-61 flex-col border-r border-line-soft bg-linear-to-b from-[#0b1421] to-[#080e18] px-4 pt-6 pb-4 transition-transform',
            'md:w-50 md:translate-x-0 md:px-3 md:pt-8 xl:w-56 xl:px-4',
            menuOpen ? 'overflow-y-auto shadow-[20px_0_80px_#0005]' : 'invisible -translate-x-full md:visible',
        )}>
            <Link to="/" className="relative flex items-center gap-2 px-px pb-7 font-black whitespace-nowrap md:gap-0.5 xl:gap-2">
                <img className="h-12 w-11 object-contain drop-shadow-[0_0_10px_#7753ff30] md:w-9 xl:w-11" src="/icons/quest-mark.svg" alt=""/>
                <span className="text-2xl tracking-tight md:text-[1.3125rem] xl:text-[1.4375rem]">Fret <span className="text-brand">Quest</span></span>
            </Link>
            <p className="mx-3.5 mt-7 mb-3 text-3xs tracking-[0.2em] text-subtle">TU ENTRENAMIENTO</p>
            <nav aria-label="Principal">{navigation(primaryLinks, sidebarLink)}</nav>
            <div className="mt-auto flex flex-col gap-1 border-t border-line-soft px-3.5 pt-4 text-xs text-subtle">
                <Link to="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-fg"><Info size={14}/>Acerca de nosotros</Link>
                <span className="py-1 font-mono text-2xs">Versión {__APP_VERSION__}</span>
            </div>
        </aside>

        <div className="min-w-0 md:ml-50 xl:ml-56">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-5 border-b border-line-soft bg-canvas/95 px-4.5 backdrop-blur-md md:static md:bg-[#0a1320aa] md:px-6 md:backdrop-blur-none lg:h-19 xl:px-9.5">
                <button className="flex md:hidden" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
                <HeaderDailyGoal/>
                <UserMenu/>
            </header>
            <main id="main-content" key={pathname} className="mx-auto max-w-365 min-w-0 animate-rise px-4.5 pt-6.5 pb-7.5 md:px-6 md:py-7.5 xl:px-9.5 xl:pt-9 xl:pb-11">
                <Outlet/>
            </main>
            <footer className="mx-4.5 mb-19 flex flex-col gap-2 border-t border-line-soft py-5 text-2xs text-[#8d979f] md:mx-6 md:mb-0 md:flex-row md:justify-between xl:mx-9.5">
                <span className="font-extrabold tracking-wider text-[#b5b6d4]">FRET QUEST <span className="px-2">·</span> Entrena. Mejora. Repite.</span>
                <span>Vista de demostración · Datos de ejemplo</span>
            </footer>
        </div>

        <nav aria-label="Accesos móviles" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line-soft bg-[#0c1523f5] p-1.5 pb-[calc(5px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
            {navigation(primaryLinks, bottomLink)}
        </nav>
    </div>;
}
