import type { RankTier } from '@/data/ranks';

/** Color del rango (texto y barra): bronce, plata, oro y el último, violeta. */
export const TIER_COLOR: Record<RankTier, string> = { bronze: 'text-[#d79a6b]', silver: 'text-[#c9d1d9]', gold: 'text-gold', legend: 'text-[#a78bfa]' };
/** Marco de las tarjetas según el rango: `!` para ganar al borde de <Card>. */
export const TIER_FRAME: Record<RankTier, string> = { bronze: '!border-[#d79a6b]/45 shadow-[0_0_28px_#d79a6b1f]', silver: '!border-[#c9d1d9]/45 shadow-[0_0_28px_#c9d1d91f]', gold: '!border-gold/50 shadow-[0_0_28px_#ffc15626]', legend: '!border-[#a78bfa]/50 shadow-[0_0_28px_#a78bfa2e]' };
export const TIER_BAR: Record<RankTier, string> = { bronze: 'bg-[#d79a6b]', silver: 'bg-[#c9d1d9]', gold: 'bg-gold', legend: 'bg-[#a78bfa]' };
