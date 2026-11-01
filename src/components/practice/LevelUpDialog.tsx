import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '@/lib/scrollLock';
import { cn } from '@/lib/cn';
import { levelFromSeconds } from '@/lib/ranks';
import { RankGlyph } from '@/components/RankIcon';
import { TIER_BAR, TIER_COLOR } from '@/components/quest/rankStyle';

/** Ilustración del guitarrista celebrando la subida de nivel. Formato vertical, 800×1000. */
const LEVEL_UP_IMAGE = '/images/level-up-character.webp';
/** Chispas que suben alrededor del guitarrista: posición, tamaño, demora y duración fijas (sin azar, igual en cada render). */
const SPARKS = Array.from({ length: 28 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 3 + (i * 7) % 6,
    delay: (i * 0.53) % 4,
    duration: 3 + (i * 0.7) % 3,
    gold: i % 4 === 0,
}));

/**
 * Subida de nivel, como en los juegos: sin tarjeta, encima de todo con el fondo tapado, después de cerrar
 * el resumen de la práctica. La ilustración con rayos, el nivel nuevo, el rango y la barra hacia el siguiente.
 * Se cierra tocando en cualquier parte, con Escape, Enter o Espacio.
 */
export function LevelUpDialog({ seconds, onClose }: { seconds: number; onClose: () => void }) {
    const { rank, level, progress, next } = levelFromSeconds(seconds);
    const left = next && Math.ceil(next.minutes - seconds / 60);
    // La barra arranca vacía y se llena después de que entra todo lo demás.
    const [fill, setFill] = useState(0);
    useEffect(() => {
        const id = setTimeout(() => setFill(progress), 700);
        return () => clearTimeout(id);
    }, [progress]);
    useScrollLock();
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => { if (['Escape', 'Enter', ' '].includes(event.key)) { event.preventDefault(); onClose(); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Todo vive en una columna de ancho fijo y se mide con la altura de la pantalla: en un celular apaisado o una
    // laptop baja cabe sin scroll y las proporciones no cambian. La imagen manda (~40% del alto); el texto la acompaña.
    return createPortal(<div role="dialog" aria-modal="true" aria-label={`Subiste al nivel ${level}`} onClick={onClose}
        className="fixed inset-0 z-50 grid animate-rise cursor-pointer place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#0f2a52f0,#05070ef7_70%)] px-6 backdrop-blur-xl">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
            {/* El nivel es el titular: la frase lo presenta y el número manda. */}
            <p className="animate-rise text-xs font-bold tracking-[0.3em] text-gold uppercase">¡Subiste de nivel!</p>
            <h2 className="mt-1 animate-pop bg-linear-to-b from-white to-gold bg-clip-text font-black tracking-tight text-transparent [animation-delay:150ms]">
                <span className="text-3xl md:text-4xl">Nivel </span><span className="font-mono text-6xl md:text-7xl">{level}</span>
            </h2>
            {/* Ilustración con su brillo y las chispas subiendo. */}
            <div className="relative mt-6 grid place-items-center">
                <div aria-hidden className="absolute size-[150%] rounded-full bg-[radial-gradient(circle,#3198dc4d,transparent_62%)]"/>
                <div aria-hidden className="pointer-events-none absolute -inset-x-1/2 inset-y-0 motion-reduce:hidden">
                    {SPARKS.map((spark, i) => <span key={i} className={cn('absolute bottom-[10%] animate-spark rounded-full', spark.gold ? 'bg-gold shadow-[0_0_8px_#ffc156]' : 'bg-accent-strong shadow-[0_0_8px_#5ab8ec]')}
                        style={{ left: `${spark.left}%`, width: spark.size, height: spark.size, animationDelay: `${spark.delay}s`, animationDuration: `${spark.duration}s` }}/>)}
                </div>
                <img src={LEVEL_UP_IMAGE} alt="" width={800} height={1000} decoding="async"
                    className="relative h-[clamp(13rem,40vh,22rem)] w-auto animate-pop object-contain [animation-delay:300ms] drop-shadow-[0_20px_40px_#000a]"/>
            </div>


            {/* Rango y avance: una sola unidad, del mismo ancho que el título. */}
            <div className="mt-8 w-full animate-rise rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 text-left [animation-delay:550ms]">
                <div className="flex items-center gap-3">
                    <RankGlyph rank={rank} size={36}/>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <b className={cn('truncate text-sm', TIER_COLOR[rank.tier])}>{rank.name}</b>
                            <span className="shrink-0 text-xs text-fg-soft">{left ? <><b className="font-mono text-fg">{left} min</b> al nivel {next.level}</> : 'Nivel máximo'}</span>
                        </div>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10"><span className={cn('block h-full rounded-full transition-[width] duration-1000 ease-out', TIER_BAR[rank.tier])} style={{ width: `${fill * 100}%` }}/></span>
                    </div>
                </div>
            </div>

            {/* La pista aparece cuando ya terminó la entrada, para no apurar la celebración. */}
            <p className="mt-8 animate-rise text-xs text-muted [animation-delay:1600ms]">Toca en cualquier parte para continuar</p>
        </div>
    </div>, document.body);
}
