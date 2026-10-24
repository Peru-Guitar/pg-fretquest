'use client';

import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { Link, Navigate } from '@/lib/router';
import { Check, Dumbbell, UserRound } from 'lucide-react';
import { Button, Card, Field, PageTitle } from '@/components/ui';
import { DEFAULT_RHYTHM, DEFAULT_SESSION_MINUTES, LEVELS, setSessionMinutes, levelLabel, setLevel, setWeeklyGoal, updateProfile, useAccount, type Account } from '@/lib/account';
import { cn } from '@/lib/cn';
import { RhythmSelect, SessionPicker } from '@/components/quest/RhythmPicker';

/** Mi cuenta: datos propios del usuario, separados de Google (de Google solo viene el correo). */
export default function AccountPage() {
    const account = useAccount();
    if (!account) return <Navigate to={ROUTES.login} replace/>;
    // `key` reinicia el formulario si cambia la cuenta (otra sesión).
    return <AccountForm key={account.uid} account={account}/>;
}

function AccountForm({ account }: { account: Account }) {
    const [form, setForm] = useState({ name: account.name, city: account.city ?? '', country: account.country ?? '', guitar: account.guitar ?? '' });
    const [saved, setSaved] = useState(false);
    const [tab, setTab] = useState<'profile' | 'training'>('profile');
    const change = (changes: Partial<typeof form>) => { setForm({ ...form, ...changes }); setSaved(false); };
    const name = form.name.trim();
    const save = (event: React.FormEvent) => {
        event.preventDefault();
        if (!name) return;
        updateProfile({ name, city: form.city.trim() || undefined, country: form.country.trim() || undefined, guitar: form.guitar.trim() || undefined });
        setSaved(true);
    };

    // Dos pestañas en una sola columna: datos personales y preferencias de entrenamiento.
    const tabs = [{ id: 'profile', label: 'Perfil', icon: UserRound }, { id: 'training', label: 'Entrenamiento', icon: Dumbbell }] as const;

    return <div className="mx-auto max-w-3xl">
        <PageTitle eyebrow="MI CUENTA" title="Tus datos" text="Tu perfil y cómo quieres entrenar. Son tuyos: no dependen de tu cuenta de Google."/>
        <div role="tablist" aria-label="Secciones de Mi cuenta" className="mb-6 flex gap-1 border-b border-line">
            {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={cn('-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition', tab === id ? 'border-brand text-fg' : 'border-transparent text-muted hover:text-fg')}><Icon size={16}/>{label}</button>)}
        </div>

        {tab === 'profile' && <Card><form onSubmit={save}>
            <div className="flex items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-135 from-gold to-brand text-2xl font-black text-white">{(name || '?').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span>
                <div><b className="text-lg">{name || 'Sin nombre'}</b><p className="text-sm text-muted">{[[form.city.trim(), form.country.trim()].filter(Boolean).join(', '), form.guitar.trim()].filter(Boolean).join(' · ') || 'Completa tu perfil'}</p></div>
            </div>
            <Field label="Nombre visible"><input value={form.name} maxLength={40} required onChange={event => change({ name: event.target.value })}/></Field>
            <div className="grid gap-x-4 sm:grid-cols-2">
                <Field label="Ciudad" className="mt-0"><input value={form.city} maxLength={60} placeholder="Lima" onChange={event => change({ city: event.target.value })}/></Field>
                <Field label="País" className="mt-0"><input value={form.country} maxLength={60} placeholder="Perú" onChange={event => change({ country: event.target.value })}/></Field>
            </div>
            <Field label="Tu guitarra" className="mt-0"><input value={form.guitar} maxLength={60} placeholder="Squier Stratocaster" onChange={event => change({ guitar: event.target.value })}/></Field>
            <div className="mt-6 flex items-center gap-4">
                <Button type="submit" disabled={!name}>Guardar cambios</Button>
                {saved && <span className="flex items-center gap-1.5 text-sm text-success"><Check size={16}/>Guardado</span>}
            </div>
        </form></Card>}

        {/* Entrenamiento: los cambios se guardan al momento. */}
        {tab === 'training' && <Card className="flex flex-col divide-y divide-line">
            <section className="pb-7">
                <h2 className="text-lg">Mi nivel</h2>
                <p className="mt-1 text-sm text-muted">Ordena tu plan. Cámbialo cuando quieras o <Link to={ROUTES.retakeQuiz} className="text-accent hover:underline">repite el cuestionario</Link>.</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{LEVELS.map(level => <button key={level} type="button" aria-pressed={account.level === level} onClick={() => setLevel(level)}
                    className={cn('min-h-11 rounded-lg border text-sm font-bold transition', account.level === level ? 'border-brand bg-brand/15 text-fg' : 'border-line text-fg-soft hover:border-line-strong')}>{levelLabel(level)}</button>)}</div>
            </section>
            <section className="py-7">
                <h2 className="text-lg">Mi ritmo</h2>
                <p className="mt-1 mb-4 text-sm text-muted">Días por semana que quieres practicar. Puedes practicar cualquier día: es tu meta.</p>
                <RhythmSelect value={account.weeklyGoal ?? DEFAULT_RHYTHM} onChange={setWeeklyGoal}/>
            </section>
            <section className="pt-7">
                <h2 className="text-lg">Duración de cada sesión</h2>
                <p className="mt-1 mb-4 text-sm text-muted">Repites los ejercicios de tu plan hasta completarla. Si la completas, el día cuenta para tu ritmo.</p>
                <SessionPicker value={account.sessionMinutes ?? DEFAULT_SESSION_MINUTES} onChange={setSessionMinutes}/>
            </section>
        </Card>}
    </div>;
}
