import { useState } from 'react';
import { Check } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { AVATAR_GROUPS, AVATARS } from '@/data/avatars';
import { setAvatar, useAccount } from '@/lib/account';
import { cn } from '@/lib/cn';
import { invalidateProfile } from '@/lib/profile';

/**
 * Elegir avatar como en una selección de personaje: el retrato grande muestra al que señalas o, si no, al elegido.
 * Se guarda al momento, y tu perfil lo muestra sin esperar a que caduque su caché.
 */
export function AvatarPicker() {
    const account = useAccount();
    const [pointed, setPointed] = useState<string | null>(null);
    if (!account) return null;
    const choose = (id?: string) => { setAvatar(id); invalidateProfile(account.uid); };
    const shown = AVATARS.find(avatar => avatar.id === (pointed ?? account.avatar));
    const isChosen = shown?.id === account.avatar;

    return <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
        <div className="md:sticky md:top-6 md:self-start">
            <div className="relative mx-auto aspect-square max-w-60 overflow-hidden rounded-xl border border-accent/40 bg-[radial-gradient(circle_at_50%_30%,#3198dc40,transparent_70%)] shadow-[0_0_28px_#3198dc26]">
                {shown
                    ? <img key={shown.id} src={shown.src} alt="" width={500} height={500} decoding="async" className="size-full animate-rise object-cover"/>
                    : <UserAvatar uid={account.uid} name={account.name} tone="bg-raised" className="size-full !rounded-none pb-8 text-7xl !text-fg"/>}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent px-3.5 pt-10 pb-3">
                    <p className="text-3xs font-black tracking-[0.18em] text-accent">{!shown || isChosen ? 'TU AVATAR' : 'VISTA PREVIA'}</p>
                    <p className="truncate text-lg font-black text-white">{shown?.name ?? 'Sin avatar'}</p>
                </div>
            </div>
            {account.avatar && <button type="button" onClick={() => choose()} className="mx-auto mt-3 block text-xs text-muted hover:text-fg">Quitar avatar</button>}
        </div>

        <div className="flex min-w-0 flex-col gap-5" onMouseLeave={() => setPointed(null)} onBlur={() => setPointed(null)}>
            {AVATAR_GROUPS.map(group => <section key={group.id}>
                <h3 className="mb-2.5 text-2xs font-black tracking-[0.18em] text-subtle uppercase">{group.label}</h3>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">{AVATARS.filter(avatar => avatar.group === group.id).map(avatar => {
                    const selected = account.avatar === avatar.id;
                    return <button key={avatar.id} type="button" aria-label={avatar.name} aria-pressed={selected} onClick={() => choose(avatar.id)} onMouseEnter={() => setPointed(avatar.id)} onFocus={() => setPointed(avatar.id)}
                        className={cn('group relative aspect-square overflow-hidden rounded-lg border-2 bg-sunken transition hover:-translate-y-0.5', selected ? 'border-accent shadow-[0_0_16px_#5ab8ec66]' : 'border-line-strong hover:border-accent/70')}>
                        <img src={avatar.src} alt="" width={500} height={500} loading="lazy" decoding="async" className={cn('size-full object-cover transition', !selected && 'brightness-75 group-hover:brightness-100 group-focus-visible:brightness-100')}/>
                        {selected && <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-accent text-black"><Check size={13} strokeWidth={3}/></span>}
                    </button>;
                })}</div>
            </section>)}
        </div>
    </div>;
}
