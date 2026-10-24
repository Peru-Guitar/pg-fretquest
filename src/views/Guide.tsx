'use client';

import { ROUTES } from '@/lib/routes';
import { Link } from '@/lib/router';
import { CalendarCheck, Compass, Gauge, Heart, ListChecks, Music, Play, Sparkles, Users } from 'lucide-react';
import { Card, PageTitle } from '@/components/ui';

/** Guía «Cómo funciona»: cómo usar Fret Quest y cómo entrenar. Textos cortos, una tarjeta por tema. */
const SECTIONS = [
    {
        icon: ListChecks, title: 'Tu plan', to: ROUTES.plan, link: 'Ir a mi plan',
        points: [
            'Es una guía según tu nivel, no una malla curricular: nada se bloquea ni se aprueba.',
            'Empieza por Recomendaciones: son lecturas cortas sobre cómo practicar. Márcalas como leídas.',
            'Te recomendamos seguir los ejercicios en orden, pero puedes repetir los anteriores cuando necesites refuerzo.',
            'Cualquier ejercicio que practiques suma a tu progreso.',
        ],
    },
    {
        icon: CalendarCheck, title: 'Tu ritmo y tu tiempo', to: ROUTES.account, link: 'Cambiar mi ritmo',
        points: [
            'Eliges cuántos días por semana quieres practicar (de 2 a 6) y cuánto tiempo cada día (15, 30 o 45 min).',
            'Un día cuenta para tu ritmo cuando completas tu tiempo diario, sumando todos los ejercicios.',
            'Puedes practicar cualquier día. Si un día no llegas, no pasa nada: la semana sigue.',
            'Recomendado: al menos media hora cada día que practiques.',
        ],
    },
    {
        icon: Play, title: 'Cómo practicar un ejercicio', to: ROUTES.exercises, link: 'Ver ejercicios',
        points: [
            'Lee el objetivo y los pasos antes de tocar. La primera vez, pulsa «Escuchar ejercicio» para oírlo antes de tocar.',
            'Elige la velocidad (BPM) y las rondas. Pulsa Practicar: hay una cuenta de entrada antes de cada ronda.',
            'Puedes cambiar el BPM mientras tocas. Esc detiene la práctica.',
            'Al completar todas las rondas sale el resumen y, con tu cuenta, se registra tu práctica.',
        ],
    },
    {
        icon: Music, title: 'Leer la tablatura',
        points: [
            'Cada línea es una cuerda: arriba la primera (e, la más aguda) y abajo la sexta (E, la más grave). El número es el traste.',
            '⊓ es púa hacia abajo y V, púa hacia arriba. En la mayoría de ejercicios la púa alterna. En los arpegios la púa solo ataca al cambiar de cuerda, y en la misma cuerda se liga: h es hammer-on y p, pull-off.',
            'Los ejercicios largos se dividen en partes numeradas, por ejemplo una por posición del mástil.',
            'La figura rítmica (negras, corcheas, sextillos…) dice cuántas notas caben en cada clic. El metrónomo siempre marca el pulso.',
        ],
    },
    {
        icon: Users, title: 'Comunidad', to: ROUTES.community, link: 'Ver la comunidad',
        points: [
            'Ves cuántos guitarristas entrenan esta semana y el ranking de los que más practican.',
            'El ranking es semanal: se reinicia cada lunes, así que siempre puedes llegar arriba.',
            'Solo cuentan las prácticas completadas con tu cuenta.',
        ],
    },
    {
        icon: Sparkles, title: 'Cómo se arman los ejercicios',
        points: [
            'Cada ejercicio se analiza con guitarristas que lo tocan, tomando como referencia sílabos y métodos internacionales de enseñanza.',
            'Los textos se redactan o se complementan con ayuda de IA, siempre a partir de ese análisis.',
            'Algunos patrones los crean guitarristas que colaboran con la comunidad.',
            'Cuando un patrón es de un guitarrista destacado, lleva su nombre y su foto: reconocemos su autoría y su propiedad intelectual.',
        ],
    },
    {
        icon: Heart, title: 'Consejos para entrenar',
        points: [
            'Empieza despacio: la velocidad llega sola cuando todo suena limpio.',
            'Relaja hombros y muñeca. Menos fuerza, más control.',
            'Si sientes dolor, detente. Descansar también es entrenar.',
            'Grábate de vez en cuando: es la forma más honesta de oír tu progreso.',
        ],
    },
];

export default function GuidePage() {
    return <>
        <PageTitle eyebrow="CÓMO FUNCIONA" title="Tu guía de entrenamiento" text="Todo lo que necesitas para sacarle partido a Fret Quest, en pocas palabras."/>

        {/* Resumen en tres pasos. */}
        <ol className="mb-6 grid gap-3 md:grid-cols-3">{[
            { icon: Compass, title: 'Elige tu nivel', text: 'Un cuestionario corto te sugiere tu nivel y tu plan.' },
            { icon: Gauge, title: 'Fija tu ritmo', text: 'Días por semana y minutos por día: tu meta semanal.' },
            { icon: Play, title: 'Practica', text: 'Ejercicio a ejercicio, con metrónomo y tablatura.' },
        ].map(({ icon: Icon, title, text }, index) => <li key={title} className="relative overflow-hidden rounded-2xl border border-brand/30 bg-linear-135 from-brand/12 to-card p-5">
            <span className="absolute top-3 right-4 font-mono text-4xl font-black text-white/6">{index + 1}</span>
            <span className="grid size-10 place-items-center rounded-xl bg-brand/20 text-accent-strong"><Icon size={20}/></span>
            <h2 className="mt-3 text-lg">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
        </li>)}</ol>

        <div className="grid gap-5 lg:grid-cols-2">{SECTIONS.map(({ icon: Icon, title, points, to, link }) => <Card key={title} className="flex flex-col">
            <h2 className="flex items-center gap-3 text-xl"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/12 text-accent-strong"><Icon size={20}/></span>{title}</h2>
            <ul className="mt-4 flex flex-1 flex-col gap-2.5">{points.map(point => <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-fg-soft"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"/>{point}</li>)}</ul>
            {to && <Link to={to} className="mt-5 self-start text-sm font-bold text-accent hover:underline">{link} →</Link>}
        </Card>)}</div>
    </>;
}
