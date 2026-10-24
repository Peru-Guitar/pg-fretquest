import { moduleUrl } from '@/lib/routes';
import { Link } from '@/lib/router';
import { ArrowRight, Guitar, Star } from 'lucide-react';
import { courses } from '@/data/questMock';
import { cn } from '@/lib/cn';

const artTones: Record<string, { bg: string; fg: string }> = {
    riff: { bg: 'from-[#1d4a7a] via-[#111a30] via-62% to-[#0b0f1c]', fg: 'text-[#5ab8ec]' },
    chord: { bg: 'from-[#2a5f8f] via-[#14203a] via-65% to-[#0b0f1c]', fg: 'text-[#a8c9f4]' },
    rhythm: { bg: 'from-[#285890] via-[#1c2a4c] via-65% to-[#111e31]', fg: 'text-[#a8c9f4]' },
    solo: { bg: 'from-[#173c66] via-[#101829] via-65% to-[#0b0f1c]', fg: 'text-[#5ab8ec]' },
};

/** Ilustración decorativa. `card` = cabecera de tarjeta, `hero` = fondo del bloque principal, `cover` = portada de módulo. */
export function GuitarArt({ variant = 'riff', layout = 'card' }: { variant?: string; layout?: 'card' | 'hero' | 'cover' }) {
    const tone = layout === 'hero' ? { bg: '', fg: 'text-accent' } : artTones[variant] ?? artTones.riff;
    const hero = layout === 'hero';
    const center = 'absolute top-1/2 -translate-1/2';
    return <div aria-hidden="true" className={cn(
        'isolate overflow-hidden',
        layout === 'card' && 'relative h-44 bg-radial-[at_60%_35%]',
        layout === 'cover' && 'absolute inset-y-0 right-0 left-1/5 bg-radial-[at_65%_35%]',
        hero && 'absolute inset-y-0 right-0 left-1/5 opacity-30 mask-[linear-gradient(90deg,transparent,#000_23%)] xs:left-[36%] xs:opacity-100',
        !hero && tone.bg,
    )}>
        <div className={cn(center, 'rounded-full border border-[#5ab8ec25]', hero ? 'left-4/5 size-82 md:left-2/3' : 'left-1/2 size-70')}/>
        <div className={cn(center, 'rounded-full border border-[#5ab8ec25]', hero ? 'left-4/5 size-115 md:left-2/3' : 'left-1/2 size-90')}/>
        <div className="absolute -top-[35%] -left-[10%] h-[140%] w-[180%] -rotate-35 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_47px,#5ab8ec0b_48px,#5ab8ec0b_49px)]"/>
        <Guitar strokeWidth={0.9} className={cn(
            center, 'drop-', tone.fg,
            hero ? 'left-9/10 size-72 rotate-[-26deg] xs:left-3/4 md:left-[76%] lg:left-2/3 xl:left-[76%] lg:size-80 xl:size-72 2xl:left-2/3 2xl:size-82' : 'left-1/2 size-57 -rotate-24',
        )}/>
        <span className={cn('absolute top-1/5 left-1/5 text-2xl', tone.fg)}>✦</span>
        <span className={cn('absolute right-1/6 bottom-1/5 text-base', tone.fg)}>+</span>
        <span className={cn('absolute bottom-3 text-4xs tracking-[0.25em] text-muted', hero ? 'right-6 hidden md:block' : 'left-4.5')}>FQ / PLAY YOUR WAY</span>
    </div>;
}

export function CourseCard({ course }: { course: typeof courses[number] }) {
    const content = <>
        <div className="relative">
            <img src={course.image} alt="" width={960} height={640} loading="lazy" decoding="async" className="h-44 w-full bg-sunken object-cover"/>
            {!course.available && <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-bold text-white">Próximamente</span>}
        </div>
        <div className="p-4 xl:p-5">
            <p className="text-4xs leading-relaxed font-black tracking-[0.15em] text-accent">{course.category}</p>
            <h3 className="mt-2 mb-2 text-base md:text-[1.0625rem] xl:text-lg">{course.title}</h3>
            <p className="text-xs leading-relaxed text-muted xs:min-h-9.5">{course.description}</p>
            <div className="mt-4.5 mb-3.5 text-3xs text-muted">{course.lessonCount} lecciones</div>
            {course.available && <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-accent"><span>Ver lecciones</span><ArrowRight size={16}/></div>}
        </div>
    </>;
    return course.available
        ? <Link to={moduleUrl(course.id)} className="overflow-hidden rounded-lg border border-line bg-card transition hover:-translate-y-1 hover:border-accent/60">{content}</Link>
        : <article aria-label={`${course.title}: próximamente`} className="overflow-hidden rounded-lg border border-line bg-card opacity-60">{content}</article>;
}

export function CourseGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:gap-5', className)}>{children}</div>;
}

const achievements = [
    { symbol: '✦', title: 'Primera sesión', text: 'Primer entrenamiento', medal: 'from-[#5ab8ec] to-[#1d4a7a] text-white' },
    { symbol: '♜', title: 'Constancia de acero', text: '7 días seguidos', medal: 'from-[#ffc156] to-[#8a6420] text-[#fff6e0]' },
    { symbol: 'ϟ', title: 'Sin perder el ritmo', text: '95% de precisión', medal: 'from-[#35dca9] to-[#16664f] text-[#ccffed]' },
    { symbol: '◇', title: 'Constancia de leyenda', text: 'Alcanza el nivel 25', medal: 'from-[#5ab8ec] to-[#1d4a7a] text-white', locked: true },
];

export function Achievements() {
    return <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 xl:gap-4">
        {achievements.map(({ symbol, title, text, medal, locked }) => <div key={title} className={cn('relative rounded-lg border border-line bg-card px-2 py-5.5 text-center xl:px-3 xl:py-6', locked && 'opacity-50')}>
            <span className={cn('mx-auto mb-4 grid h-16 w-14.5 place-items-center bg-linear-150 text-4xl [clip-path:polygon(50%_0,95%_25%,95%_75%,50%_100%,5%_75%,5%_25%)]', medal)}>{symbol}</span>
            <h3 className="text-xs xs:text-sm">{title}</h3>
            <p className="mt-2 text-3xs text-muted xs:text-2xs">{text}</p>
            {!locked && <Star size={12} className="mx-auto mt-3.5 text-accent"/>}
        </div>)}
    </div>;
}

