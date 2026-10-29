'use client';

import { AtSign, Dumbbell, Guitar, Mail, MessageCircle } from 'lucide-react';
import { Card, Caption, PageTitle } from '@/components/ui';
import { VersionInfo } from '@/components/VersionInfo';
import { WHATSAPP_GROUP_URL } from '@/lib/links';

// Datos de contacto de ejemplo: reemplazar por los reales.
const contacts = [
    { icon: Mail, label: 'Correo', value: 'hola@fretquest.app', href: 'mailto:hola@fretquest.app' },
    { icon: AtSign, label: 'Instagram', value: '@fretquest', href: 'https://instagram.com/fretquest' },
    { icon: MessageCircle, label: 'Soporte', value: 'soporte@fretquest.app', href: 'mailto:soporte@fretquest.app' },
];

export default function AboutPage() {
    return <>
        <PageTitle eyebrow="FRET QUEST" title="Acerca de nosotros" text="Un gimnasio de técnica para guitarristas que ya tocan."/>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
                <span className="mb-4 grid size-11 place-items-center rounded-lg bg-violet/15 text-accent-strong"><Guitar size={22}/></span>
                <h2 className="mb-3">Entrena. Mejora. Repite.</h2>
                <p className="text-base leading-relaxed text-fg-soft">Fret Quest nace para ayudar a guitarristas con experiencia a mantener y mejorar su técnica con constancia: un catálogo de ejercicios por técnica, práctica con metrónomo y un registro honesto del tiempo que dedicas cada día.</p>
                <p className="mt-4 text-base leading-relaxed text-fg-soft">Creemos que el progreso en la guitarra no viene de sesiones largas y esporádicas, sino de practicar un poco cada día, con atención y sin prisa por la velocidad.</p>
                <VersionInfo className="mt-6 text-subtle"/>
            </Card>
            <Card className="lg:col-start-1">
                <span className="mb-4 grid size-11 place-items-center rounded-lg bg-violet/15 text-accent-strong"><Dumbbell size={22}/></span>
                <h2 className="mb-3">Un gimnasio, no una academia</h2>
                <p className="text-base leading-relaxed text-fg-soft">Fret Quest no da clases. Es un gimnasio: aquí vienes a entrenar lo que ya sabes o estás aprendiendo, con ejercicios, metrónomo y constancia.</p>
                <p className="mt-4 text-base leading-relaxed text-fg-soft">Si quieres que alguien te dé una mano o te corrija, únete al grupo de WhatsApp: ahí la comunidad te ayuda.</p>
                <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-canvas transition hover:brightness-110"><MessageCircle size={18}/>Unirse al grupo de WhatsApp</a>
            </Card>
            <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
                <h2 className="mb-4 text-lg">Contacto</h2>
                <ul className="flex flex-col gap-3">
                    {contacts.map(({ icon: Icon, label, value, href }) => <li key={label}>
                        <a href={href} className="flex items-center gap-3 rounded-lg border border-line p-3 transition hover:border-violet/50">
                            <Icon size={18} className="shrink-0 text-accent-strong"/>
                            <span><small className="block text-2xs text-muted">{label}</small><span className="text-sm">{value}</span></span>
                        </a>
                    </li>)}
                </ul>
                <Caption className="mt-4">Datos de contacto de ejemplo.</Caption>
            </Card>
        </div>
    </>;
}
