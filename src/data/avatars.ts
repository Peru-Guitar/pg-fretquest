/** Avatares de libre elección. Se guarda solo el UUID estable en users/{uid}.avatar. */
export type AvatarGroup = 'female' | 'male';
/** `group` solo ordena el selector: cada quien elige libremente. */
export type Avatar = { id: string; name: string; src: string; group: AvatarGroup };

export const AVATARS: Avatar[] = [
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000001', name: 'El Rockero', src: '/images/avatars/rockero.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000002', name: 'La Punk', src: '/images/avatars/punk.webp', group: 'female' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000003', name: 'El Bluesman', src: '/images/avatars/bluesman.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000004', name: 'La Metalera', src: '/images/avatars/metalera.webp', group: 'female' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000005', name: 'El Acústico', src: '/images/avatars/acustico.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000006', name: 'La Indie', src: '/images/avatars/indie.webp', group: 'female' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000007', name: 'El Funkero', src: '/images/avatars/funkero.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000008', name: 'La Shredder', src: '/images/avatars/shredder.webp', group: 'female' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000009', name: 'El Mago de las Cuerdas', src: '/images/avatars/mago.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000010', name: 'El Robot del Ritmo', src: '/images/avatars/robot.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000011', name: 'El Punk', src: '/images/avatars/punk-hombre.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000012', name: 'El Metalero', src: '/images/avatars/metalero.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000013', name: 'El Indie', src: '/images/avatars/indie-hombre.webp', group: 'male' },
    { id: 'f8e7a100-2b6d-4c90-8e31-000000000014', name: 'El Shredder', src: '/images/avatars/shredder-hombre.webp', group: 'male' },
];

export const AVATAR_GROUPS: { id: AvatarGroup; label: string }[] = [{ id: 'male', label: 'Hombres' }, { id: 'female', label: 'Mujeres' }];

export const avatarSrc = (id?: string) => AVATARS.find(avatar => avatar.id === id)?.src;
