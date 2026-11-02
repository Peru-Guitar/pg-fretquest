import { avatarSrc } from '@/data/avatars';
import { initials, toneOf } from '@/lib/avatar';
import { cn } from '@/lib/cn';

/** Cara de un usuario: su avatar si eligió uno de la lista; si no, sus iniciales. El tamaño va en `className`. */
export function UserAvatar({ uid, name, avatar, tone, className }: { uid: string; name: string; avatar?: string; tone?: string; className?: string }) {
    const src = avatarSrc(avatar);
    return <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-[22%] font-black text-white', !src && (tone ?? toneOf(uid)), className)}>
        {src ? <img src={src} alt="" width={500} height={500} loading="lazy" decoding="async" className="size-full object-cover"/> : initials(name)}
    </span>;
}
