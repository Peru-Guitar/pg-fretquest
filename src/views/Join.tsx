'use client';

import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { Navigate, useHydrated } from '@/lib/router';
import { Gauge, ListChecks, LogIn, TrendingUp, Users } from 'lucide-react';
import { Button, Card, Eyebrow } from '@/components/ui';
import { signIn, useAccount } from '@/lib/account';
import { courses } from '@/data/questMock';

const MODULES = courses.filter(course => course.available && course.id !== 'recommendations');

const STEPS = [
    { icon: ListChecks, title: 'Un plan según tu nivel', text: 'Siete preguntas rápidas y te sugerimos qué practicar, de básico a experto.' },
    { icon: Gauge, title: 'Practica con metrónomo y tablatura', text: 'Cada ejercicio trae su patrón, digitación y tempos para subir la velocidad con control.' },
    { icon: TrendingUp, title: 'Mide tu progreso', text: 'Tu ritmo semanal, tus récords de BPM y tus sesiones quedan guardados.' },
    { icon: Users, title: 'Entrena en comunidad', text: 'Mira cómo avanzan los demás y únete al grupo de WhatsApp.' },
];

/** Landing de invitación (`/unirse`): el enlace que se comparte. Con sesión iniciada, directo al plan. */
export default function JoinPage() {
    const account = useAccount();
    const hydrated = useHydrated();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState('');

    if (hydrated && account) return <Navigate to={ROUTES.login} replace/>;

    const join = () => {
        setError(''); setSigningIn(true);
        signIn().catch((reason: { code?: string }) => { if (reason.code !== 'auth/popup-closed-by-user' && reason.code !== 'auth/cancelled-popup-request') setError('No se pudo entrar. Inténtalo de nuevo.'); }).finally(() => setSigningIn(false));
    };
    const cta = <>
        <Button className="min-h-14 w-full max-w-sm text-base" disabled={signingIn} onClick={join}><LogIn size={20}/>{signingIn ? 'Entrando…' : 'Unirme gratis con Google'}</Button>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
    </>;

    return <div className="mx-auto max-w-5xl">
        <Card className="relative overflow-hidden px-6 py-14 text-center md:px-16 md:py-20">
            <img src="/icons/quest-mark.svg" alt="" className="mx-auto h-16 w-16 drop-shadow-[0_0_20px_#3198dc55]"/>
            <Eyebrow className="mt-6 justify-center">TE INVITARON A FRET QUEST</Eyebrow>
            <h1 className="mx-auto mt-3 max-w-2xl text-4xl md:text-6xl">Tu gimnasio de guitarra eléctrica</h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">Entrena coordinación, limpieza y control con ejercicios guiados. Gratis, a tu ritmo y desde el navegador.</p>
            <div className="mt-10 flex flex-col items-center">{cta}</div>
        </Card>

        <section className="mt-12">
            <h2 className="text-2xl md:text-3xl">Qué vas a aprender</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{MODULES.map(module => <div key={module.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
                <img src={module.image} alt="" className="absolute inset-0 size-full object-cover"/>
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent"/>
                <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg text-white">{module.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-sm text-white/75">{module.description}</p>
                </div>
            </div>)}</div>
        </section>

        <section className="mt-12">
            <h2 className="text-2xl md:text-3xl">Cómo funciona</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{STEPS.map(({ icon: Icon, title, text }) => <Card key={title} className="flex gap-4 p-5">
                <Icon size={22} className="mt-0.5 shrink-0 text-accent"/>
                <div><h3 className="text-lg">{title}</h3><p className="mt-1 text-sm text-muted">{text}</p></div>
            </Card>)}</div>
        </section>

        <Card className="mt-12 flex flex-col items-center px-6 py-12 text-center">
            <h2 className="text-2xl md:text-3xl">¿Empezamos?</h2>
            <p className="mt-2 mb-8 text-muted">Crea tu cuenta en un clic y arma tu plan.</p>
            {cta}
        </Card>
    </div>;
}
