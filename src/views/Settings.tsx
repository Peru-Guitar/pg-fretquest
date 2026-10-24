'use client';

import { useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { Button, Caption, Card, Eyebrow, Field, PageTitle, Toggle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { DAILY_GOAL_OPTIONS, useDailyPractice } from '@/lib/practiceTime';

const sections = ['General', 'Práctica', 'Accesibilidad'];
const themes = [{ label: 'Oscuro', Icon: Moon }, { label: 'Claro', Icon: Sun }, { label: 'Sistema', Icon: Monitor }];

export default function SettingsPage() {
    const [tab, setTab] = useState('General');
    const [saved, setSaved] = useState(false);
    const [theme, setTheme] = useState('Oscuro');
    const daily = useDailyPractice();
    return <>
        <PageTitle eyebrow="HAZLO TUYO" title="Tu espacio. A tu manera." text="Los pequeños detalles también hacen parte de tu aventura."/>
        <div className="md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-5 lg:grid-cols-[180px_minmax(0,780px)] lg:gap-7.5">
            <nav className="mb-5 flex gap-2 md:mb-0 md:flex-col" aria-label="Secciones de ajustes">{sections.map(label =>
                <button key={label} aria-current={tab === label ? 'page' : undefined} onClick={() => { setTab(label); setSaved(false); }} className={cn('min-h-11 flex-1 rounded-md border px-2 text-center text-xs xs:px-4 xs:text-sm md:flex-none md:text-left', tab === label ? 'border-violet/25 bg-violet/10 text-[#bca7ff]' : 'border-transparent text-muted')}>{label}</button>)}
            </nav>
            <form className="min-w-0" onSubmit={event => { event.preventDefault(); setSaved(true); }}><Card as="div">
                <Eyebrow className="mb-3">{tab.toUpperCase()}</Eyebrow>
                {tab === 'General' ? <>
                    <h2>Los detalles de tu perfil</h2>
                    <div className="grid xs:grid-cols-2 xs:gap-5 md:max-lg:gap-0 md:max-lg:grid-cols-1">
                        <Field label="Nombre visible"><input defaultValue="Eduardo" maxLength={40}/></Field>
                        <Field label="Nombre de usuario"><input defaultValue="edu.strings" maxLength={30}/></Field>
                    </div>
                    <Field label="Tu historia"><textarea defaultValue="Buscando mi sonido, un riff a la vez." rows={3}/></Field>
                    <Field label="Idioma"><select><option>Español</option></select></Field>
                    <hr className="my-7.5 border-line"/>
                    <h2 className="mb-3">Tu ambiente</h2>
                    <p className="text-sm text-muted">Explora los estados visuales del selector de apariencia.</p>
                    <div className="mt-5.5 flex flex-wrap gap-3 xl:flex-nowrap">{themes.map(({ label, Icon }) =>
                        <button type="button" key={label} onClick={() => setTheme(label)} aria-pressed={theme === label} className={cn('flex min-w-20 flex-1 items-center gap-2 rounded-lg border bg-[#121c2e] px-2 py-3 text-xs xs:min-w-25 xs:px-3 xl:gap-3 xl:p-4', theme === label ? 'border-violet text-[#c1abff]' : 'border-line')}>
                            <Icon/>{label}{theme === label && <Check size={15}/>}
                        </button>)}
                    </div>
                    <Caption className="mt-3">La demostración mantiene la identidad oscura en todas las vistas.</Caption>
                </> : tab === 'Práctica' ? <>
                    <h2>Prepara tus próximas sesiones</h2>
                    <Field label="Instrumento"><select><option>Guitarra eléctrica</option><option>Guitarra acústica</option><option>Guitarra clásica</option></select></Field>
                    <Field label="Mano dominante"><select><option>Derecha</option><option>Izquierda</option></select></Field>
                    <Field label="Plan diario de práctica"><select value={daily.goal} onChange={event => daily.setGoal(Number(event.target.value))}>{DAILY_GOAL_OPTIONS.map(minutes => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></Field>
                    <Toggle title="Cuenta de entrada" text="Muestra un compás de preparación antes de la práctica."/>
                    <Toggle title="Recordatorio de práctica" text="Estado de ejemplo; no envía notificaciones."/>
                </> : <>
                    <h2>Una experiencia más cómoda</h2>
                    <Toggle title="Reducir movimiento" text="Preferencia visual de ejemplo. También respetamos la configuración de tu sistema."/>
                    <Toggle title="Contraste reforzado" text="Selector demostrativo para la futura integración."/>
                    <Field label="Tamaño de tablatura"><select><option>Estándar</option><option>Grande</option><option>Muy grande</option></select></Field>
                </>}
                <div className="mt-7.5 flex flex-col items-start gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
                    <Caption className="text-2xs">Los cambios son temporales y no se guardan.</Caption>
                    <Button type="submit">{saved ? <><Check size={17}/>Vista actualizada</> : 'Aplicar a la vista'}</Button>
                </div>
                <p className="mt-3 min-h-4 text-xs text-success" role="status">{saved ? 'Preferencias de demostración aplicadas a esta vista. Sin persistencia.' : ''}</p>
            </Card></form>
        </div>
    </>;
}
