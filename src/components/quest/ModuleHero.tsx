import type { ReactNode } from 'react';
import { BackLink } from '@/components/ui';

/** Cabecera a todo el ancho con la imagen del módulo de fondo: la usan el módulo y sus lecciones. */
export function ModuleHero({ image, back, eyebrow, title, text, stats, children }: {
    image: string;
    back: { to: string; label: string };
    eyebrow?: string;
    title: string;
    text?: string;
    /** Datos cortos bajo el texto (etiqueta → valor). */
    stats: [string, ReactNode][];
    children?: ReactNode;
}) {
    return <section className="full-bleed relative -mt-6.5 mb-7 flex min-h-80 items-center overflow-hidden border-b border-line bg-surface md:-mt-7.5 md:min-h-97 xl:-mt-9">
        <img src={image} alt="" width={960} height={640} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[65%_center] xs:left-[25%] xs:w-3/4"/>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#080b14f5_0%,#080b14e6_38%,#080b1480_65%,#080b1420_100%)] max-xs:bg-[#080b14cc]"/>
        <div className="relative z-10 mx-auto w-full max-w-365 px-4.5 py-8 md:px-6 xl:px-9.5"><div className="max-w-180">
            <BackLink to={back.to}>{back.label}</BackLink>
            {eyebrow && <p className="mb-2 text-3xs tracking-[0.2em] text-accent">{eyebrow.toUpperCase()}</p>}
            <h1 className="text-4xl leading-[1.08] font-black tracking-tighter xs:text-[2.375rem] lg:text-[2.75rem]">{title}</h1>
            {text && <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-fg-soft md:text-base">{text}</p>}
            {stats.length > 0 && <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">{stats.map(([label, value]) => <div key={label}>
                <dt className="text-3xs tracking-[0.15em] text-muted">{label.toUpperCase()}</dt>
                <dd className="mt-1 text-lg font-bold">{value}</dd>
            </div>)}</dl>}
            {children}
        </div></div>
    </section>;
}
