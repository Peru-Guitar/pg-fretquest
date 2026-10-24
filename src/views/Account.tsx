'use client';

import { useState } from 'react';
import { Link, Navigate } from '@/lib/router';
import { Check } from 'lucide-react';
import { Button, Card, Field, PageTitle } from '@/components/ui';
import { DEFAULT_RHYTHM, DEFAULT_SESSION_MINUTES, LEVELS, setSessionMinutes, levelLabel, setLevel, setWeeklyGoal, updateProfile, useAccount, type Account } from '@/lib/account';
import { cn } from '@/lib/cn';
import { RhythmSelect, SessionPicker } from '@/components/quest/RhythmPicker';

/** Mi cuenta: datos propios del usuario, separados de Google (de Google solo viene el correo). */
export default function AccountPage() {
    const account = useAccount();
    if (!account) return <Navigate to="/login" replace/>;
    // `key` reinicia el formulario si cambia la cuenta (otra sesión).
    return <AccountForm key={account.uid} account={account}/>;
}

function AccountForm({ account }: { account: Account }) {
    const [form, setForm] = useState({ name: account.name, city: account.city ?? '', country: account.country ?? '', guitar: account.guitar ?? '' });
    const [saved, setSaved] = useState(false);
    const change = (changes: Partial<typeof form>) => { setForm({ ...form, ...changes }); setSaved(false); };
    const name = form.name.trim();
    const save = (event: React.FormEvent) => {
        event.preventDefault();
        if (!name) return;
        updateProfile({ name, city: form.city.trim() || undefined, country: form.country.trim() || undefined, guitar: form.guitar.trim() || undefined });
        setSaved(true);
    };

    return <>
        <PageTitle eyebrow="MI CUENTA" title="Tus datos" text="Así te ve la comunidad. Son tuyos: no dependen de tu cuenta de Google."/>
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <Card className="max-w-2xl"><form onSubmit={save}>
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
            </form></Card>

            <div className="flex flex-col gap-6">
                <Card>
                    <h2 className="text-lg">Mi nivel</h2>
                    <p className="mt-1 text-sm text-muted">Ordena tu plan. Cámbialo cuando quieras o <Link to="/login?repetir" className="text-accent hover:underline">repite el cuestionario</Link>.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">{LEVELS.map(level => <button key={level} type="button" aria-pressed={account.level === level} onClick={() => setLevel(level)}
                        className={cn('min-h-11 rounded-lg border text-sm font-bold transition', account.level === level ? 'border-brand bg-brand/15 text-fg' : 'border-line text-fg-soft hover:border-line-strong')}>{levelLabel(level)}</button>)}</div>
                </Card>
                <Card>
                    <h2 className="text-lg">Mi ritmo</h2>
                    <p className="mt-1 mb-4 text-sm text-muted">Días por semana que quieres practicar. Puedes practicar cualquier día: es tu meta.</p>
                    <RhythmSelect value={account.weeklyGoal ?? DEFAULT_RHYTHM} onChange={setWeeklyGoal}/>
                    <h3 className="mt-6 mb-1 text-sm font-bold">Duración de cada sesión</h3>
                    <p className="mb-3 text-xs text-muted">Repites los ejercicios de tu plan hasta completarla. Si la completas, el día cuenta para tu ritmo.</p>
                    <SessionPicker value={account.sessionMinutes ?? DEFAULT_SESSION_MINUTES} onChange={setSessionMinutes}/>
                </Card>
            </div>
        </div>
    </>;
}
