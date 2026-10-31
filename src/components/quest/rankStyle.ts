import type { RankTier } from '@/data/ranks';

/** Color del rango (texto y barra): bronce, plata, oro y el último, violeta. */
export const TIER_COLOR: Record<RankTier, string> = { bronze: 'text-[#d79a6b]', silver: 'text-[#c9d1d9]', gold: 'text-gold', legend: 'text-[#a78bfa]' };
export const TIER_BAR: Record<RankTier, string> = { bronze: 'bg-[#d79a6b]', silver: 'bg-[#c9d1d9]', gold: 'bg-gold', legend: 'bg-[#a78bfa]' };
