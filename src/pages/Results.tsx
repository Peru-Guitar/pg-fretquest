import { Check, Clock3, Target, Trophy, Zap } from 'lucide-react';
import { Achievements } from '@/components/quest/QuestUI';
import { Avatar, Badge, Caption, Card, Eyebrow, LinkButton, Meter, Stat } from '@/components/ui';

export default function ResultsPage() {
    return <div className="mx-auto max-w-237 py-2 text-center">
        <Badge>RESULTADO DE DEMOSTRACIÓN</Badge>
        <div className="relative mx-auto mt-7 mb-5 grid size-32.5 -rotate-5 place-items-center rounded-[28px] border border-[#9b6dff77] bg-radial from-[#9563ff33] to-transparent to-70% text-[#c6a5ff]">
            <Trophy size={58}/><span className="absolute top-1 right-2 text-2xl">✦</span>
        </div>
        <Eyebrow className="justify-center">OTRO PASO HACIA TU MEJOR VERSIÓN</Eyebrow>
        <h1 className="my-3 text-4xl md:text-[2.75rem]">¡Entrenamiento completado!</h1>
        <p className="mb-4.5 leading-relaxed text-muted">Sesión de púa alternada · Resumen visual de ejemplo.</p>
        <div className="text-[1.625rem] tracking-[0.35em] text-[#ffc767] [text-shadow:0_0_15px_#f9b94733]">★ ★ ★</div>
        <div className="mt-7.5 mb-6 grid grid-cols-3 gap-2.5 xl:gap-4">
            <Stat stacked tone="green" icon={<Target/>} value="96%" label="Precisión"/>
            <Stat stacked tone="blue" icon={<Clock3/>} value="8 min" label="Tiempo de práctica"/>
            <Stat stacked tone="gold" icon={<Zap/>} value="+150" label="XP de ejemplo"/>
        </div>
        <Card className="text-left">
            <div className="mb-5 flex items-center gap-4">
                <Avatar>12</Avatar>
                <div><h3>Explorador de cuerdas</h3><p className="text-xs leading-relaxed text-muted">2.600 / 3.000 XP para el siguiente nivel</p></div>
            </div>
            <Meter value={87} label="Progreso de nivel de ejemplo"/>
            <p className="mt-4 flex gap-2 text-xs leading-relaxed text-accent"><Check size={16}/>¡Un nuevo récord de precisión! +4% frente a tu última sesión.</p>
        </Card>
        <h2 className="mt-7.5 mb-5">Las pequeñas victorias cuentan.</h2>
        <Achievements/>
        <div className="mt-7.5 mb-4.5 flex flex-col justify-center gap-4 md:flex-row">
            <LinkButton to="/train">Elegir otro ejercicio</LinkButton>
            <LinkButton to="/practice" variant="secondary">Volver a practicar</LinkButton>
        </div>
        <Caption className="justify-center text-2xs md:text-sm">Esta vista usa datos de ejemplo. No se ha evaluado ni guardado ninguna sesión.</Caption>
    </div>;
}
