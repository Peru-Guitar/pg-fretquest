'use client';

import { useRef, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Botón "Apoyar" + ventana con los QR de Yape y Plin (los mismos de peruguitar.com). */
export function SupportButton({ className }: { className?: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [method, setMethod] = useState<'Yape' | 'Plin'>('Yape');
    return <>
        <button type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog" className={className}>
            <Heart size={19} className="text-accent"/><span>Apoyar</span>
        </button>
        <dialog ref={dialog} aria-labelledby="support-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-line-strong bg-card p-0 text-fg shadow-2xl backdrop:bg-black/75">
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <Heart size={25} className="text-accent"/>
                    <button type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar" className="-mt-2 -mr-2 grid size-11 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-fg"><X size={20}/></button>
                </div>
                <h2 id="support-title" className="mt-3 text-2xl font-extrabold tracking-tight">Gracias por apoyar Fret Quest.</h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-soft">Tu aporte nos ayuda a mantener Fret Quest gratis y seguir sumando lecciones. Elige Yape o Plin y escanea el QR desde tu aplicación.</p>
                <div role="group" aria-label="Método de apoyo" className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-line bg-white/5 p-1">
                    {(['Yape', 'Plin'] as const).map(option => <button key={option} type="button" aria-pressed={method === option} onClick={() => setMethod(option)} className={cn('min-h-11 rounded-lg px-4 py-2 text-sm font-bold transition-colors', method === option ? 'bg-brand text-white' : 'text-fg-soft hover:bg-white/10')}>{option}</button>)}
                </div>
                <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4">
                    <img src={`/qrs/${method.toLowerCase()}.jpg`} alt={`Código QR para apoyar con ${method}`} width={200} height={200} className="size-50"/>
                </div>
                <p className="mt-4 text-center text-sm text-accent">Escanea con {method}</p>
            </div>
        </dialog>
    </>;
}
