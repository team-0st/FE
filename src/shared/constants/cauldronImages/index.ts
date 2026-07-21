import { CAULDRON_BASE_IMAGE } from './cauldronBase';
import { GLOW_LEGENDARY_IMAGE } from './glowLegendary';
import { GLOW_NORMAL_IMAGE } from './glowNormal';
import { GLOW_RARE_IMAGE } from './glowRare';
import { SOUP_LEGENDARY_IMAGE } from './soupLegendary';
import { SOUP_NORMAL_IMAGE } from './soupNormal';
import { SOUP_RARE_IMAGE } from './soupRare';
import { SPARKLE_LEGENDARY_IMAGE } from './sparkleLegendary';
import { SPARKLE_NORMAL_IMAGE } from './sparkleNormal';
import { SPARKLE_RARE_IMAGE } from './sparkleRare';
import { STIR_STICK_IMAGE } from './stirStick';

export {
    CAULDRON_BASE_IMAGE,
    STIR_STICK_IMAGE,
    SOUP_NORMAL_IMAGE,
    SOUP_RARE_IMAGE,
    SOUP_LEGENDARY_IMAGE,
    GLOW_NORMAL_IMAGE,
    GLOW_RARE_IMAGE,
    GLOW_LEGENDARY_IMAGE,
    SPARKLE_NORMAL_IMAGE,
    SPARKLE_RARE_IMAGE,
    SPARKLE_LEGENDARY_IMAGE,
};

/** 제작(브루) 애니메이션 보상 등급 — 실제 보상에 따라 이 중 하나만 재생한다 */
export type CraftAnimationTier = 'normal' | 'rare' | 'legendary';

export type CauldronTierLayers = {
    glow: { uri: string };
    soup: { uri: string };
    sparkle: { uri: string };
};

/** 900x864, alpha 포함, 동일 좌표계. 레이어 순서: glow → cauldron_base → soup → stir_stick → sparkle */
export const CAULDRON_LAYER_ASPECT_RATIO = 900 / 864;

export const CAULDRON_TIER_LAYERS: Record<CraftAnimationTier, CauldronTierLayers> = {
    normal: { glow: GLOW_NORMAL_IMAGE, soup: SOUP_NORMAL_IMAGE, sparkle: SPARKLE_NORMAL_IMAGE },
    rare: { glow: GLOW_RARE_IMAGE, soup: SOUP_RARE_IMAGE, sparkle: SPARKLE_RARE_IMAGE },
    legendary: { glow: GLOW_LEGENDARY_IMAGE, soup: SOUP_LEGENDARY_IMAGE, sparkle: SPARKLE_LEGENDARY_IMAGE },
};
