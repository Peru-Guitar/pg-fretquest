import { Guitar, MapPin, Settings } from 'lucide-react';
import { Caption, Card, DetailLayout, Eyebrow, IconTile, LinkButton, SectionTitle, Tags, TipCard } from '@/components/ui';
import { player } from '@/data/questMock';

export default function ProfilePage() {
    return <>
        <section className="relative h-37.5 overflow-hidden rounded-xl border border-[#68509e] bg-radial-[at_80%_70%] from-[#663a9e] via-[#24264b] via-55% to-surface p-7.5 md:h-47.5">
            <Guitar strokeWidth={0.7} className="absolute -top-15 right-22 size-75 -rotate-24 text-[#b183ff60]" aria-hidden="true"/>
            <Eyebrow className="absolute right-5 bottom-6 left-6 text-4xs text-[#d3c4ed] md:left-auto md:right-7.5">NO SE TRATA DE LLEGAR. SE TRATA DE SEGUIR TOCANDO.</Eyebrow>
        </section>
        <div className="relative -mt-5 mb-7.5 flex flex-wrap items-center gap-2.5 px-2 xs:gap-4 md:-mt-6 md:px-3 xl:flex-nowrap xl:gap-6 xl:px-6">
            <span className="relative grid size-18 shrink-0 place-items-center rounded-[22px] border-6 border-canvas bg-linear-135 from-[#68432d] to-[#30231c] text-4xl font-black text-accent xs:size-21.5 md:size-27.5 md:text-5xl">
                {player.name[0]}<small className="absolute -bottom-3 left-4 rounded-[5px] bg-linear-100 from-[#4799ff] to-[#8a48fa] px-2 py-0.5 text-sm text-white xs:left-5.5 md:left-7.5">{player.level}</small>
            </span>
            <div className="flex-1 pt-7.5 xs:pt-9 md:pt-10">
                <h1 className="text-3xl md:text-[clamp(1.6875rem,2.5vw,2.375rem)]">{player.name}<span className="text-accent">.</span></h1>
                <p className="my-2 text-2xs text-muted xs:text-sm">@{player.handle} · Explorador de cuerdas</p>
                <Caption className="text-4xs xs:text-3xs md:text-2xs"><MapPin size={14}/> Lima, Perú · En la aventura desde octubre de 2026</Caption>
            </div>
            <LinkButton to="/settings" variant="secondary" className="mt-2.5 w-full xs:mt-0 xs:ml-25 xs:w-auto md:ml-31 xl:mt-7.5 xl:ml-0"><Settings size={16}/>Editar perfil</LinkButton>
        </div>
        <DetailLayout aside={<>
            <Card>
                <Eyebrow className="mb-3">NIVEL {player.level}</Eyebrow>
                <h2 className="mb-3">{player.rank}</h2>
                <p className="mb-5 text-sm text-muted">Tu nivel, logros e historial están en Progreso.</p>
                <LinkButton to="/progress" variant="secondary" className="w-full">Ver mi progreso</LinkButton>
            </Card>
            <TipCard symbol="“" title="La música empieza donde las palabras terminan.">Tu próxima práctica puede ser tu momento favorito del día.</TipCard>
        </>}>
            <Card>
                <Eyebrow className="mb-3">MI HISTORIA</Eyebrow>
                <h2 className="mb-3">Buscando mi sonido, un riff a la vez.</h2>
                <p className="text-sm leading-relaxed text-muted">Guitarrista en entrenamiento. Fan de los riffs que se quedan en la cabeza y de practicar un poquito cada día.</p>
                <Tags className="mt-5" items={['Rock alternativo', 'Blues', 'Guitarra eléctrica']}/>
            </Card>
            <Card>
                <SectionTitle title="Mi equipo" className="mb-4"/>
                <div className="flex items-center gap-4">
                    <IconTile><Guitar/></IconTile>
                    <div><h3>Squier Stratocaster</h3><p className="mt-1.5 text-xs text-muted">Guitarra eléctrica · Afinación estándar</p></div>
                </div>
            </Card>
        </DetailLayout>
    </>;
}
