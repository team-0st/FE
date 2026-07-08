import type { IngredientCatalogType } from '../notion/types';

export type Ingredient = {
    id: string;
    name: string;
    emoji: string;
    type: IngredientCatalogType;
    imageUrl: string | null;
};

/** 일반 7 + 히든 3 = 10종 (Notion Ingredients) */
export const INGREDIENTS: Ingredient[] = [
    { id: 'cabbage', name: '양배추', emoji: '🥬', type: 'COMMON', imageUrl: null },
    { id: 'tomato', name: '토마토', emoji: '🍅', type: 'COMMON', imageUrl: null },
    { id: 'onion', name: '양파', emoji: '🧅', type: 'COMMON', imageUrl: null },
    { id: 'carrot', name: '당근', emoji: '🥕', type: 'COMMON', imageUrl: null },
    { id: 'mushroom', name: '버섯', emoji: '🍄', type: 'COMMON', imageUrl: null },
    { id: 'broccoli', name: '브로콜리', emoji: '🥦', type: 'COMMON', imageUrl: null },
    { id: 'paprika', name: '파프리카', emoji: '🫑', type: 'COMMON', imageUrl: null },
    { id: 'refill_crystal', name: '리필 크리스탈', emoji: '💎', type: 'HIDDEN', imageUrl: null },
    { id: 'nature_sprout', name: '자연의 새싹', emoji: '🌱', type: 'HIDDEN', imageUrl: null },
    { id: 'eco_star', name: '에코 스타', emoji: '⭐', type: 'HIDDEN', imageUrl: null },
];

export const COMMON_INGREDIENT_IDS = INGREDIENTS.filter((i) => i.type === 'COMMON').map((i) => i.id);

export const MISSION_REWARD_POOLS: Record<string, string[]> = {
    tumbler: COMMON_INGREDIENT_IDS,
    bag: COMMON_INGREDIENT_IDS,
    reusable: COMMON_INGREDIENT_IDS,
    recycle: COMMON_INGREDIENT_IDS,
    transit: COMMON_INGREDIENT_IDS,
    'pickup-not-delivery': COMMON_INGREDIENT_IDS,
};

/** 특별 미션 — 고정 히든 재료 (Notion) */
export const MISSION_FIXED_REWARDS: Record<string, string> = {
    'almang-visit': 'refill_crystal',
    'refill-station': 'nature_sprout',
    plogging: 'eco_star',
};

export const MISSION_RANDOM_REWARD_LABEL = '랜덤 일반 재료 1종';

export function getIngredientById(id: string): Ingredient | undefined {
    return INGREDIENTS.find((item) => item.id === id);
}

export function getMissionRewardPool(missionId: string): string[] {
    const fixed = MISSION_FIXED_REWARDS[missionId];
    if (fixed != null) {
        return [fixed];
    }
    return MISSION_REWARD_POOLS[missionId] ?? COMMON_INGREDIENT_IDS;
}

export function pickMissionRewardIngredient(
    missionId: string,
    random: () => number = Math.random,
): string | undefined {
    const fixed = MISSION_FIXED_REWARDS[missionId];
    if (fixed != null) {
        return fixed;
    }
    const pool = getMissionRewardPool(missionId);
    if (pool.length === 0) {
        return undefined;
    }
    const index = Math.floor(random() * pool.length);
    return pool[index];
}

export function getMissionRewardIngredient(
    _missionId: string,
    rewardIngredientId?: string | null,
): Ingredient | undefined {
    if (rewardIngredientId != null) {
        return getIngredientById(rewardIngredientId);
    }
    return undefined;
}

export function formatMissionIngredientReward(missionId: string): string {
    const fixed = MISSION_FIXED_REWARDS[missionId];
    if (fixed != null) {
        return formatIngredientReward(fixed);
    }
    return MISSION_RANDOM_REWARD_LABEL;
}

export function formatIngredientReward(ingredientId: string): string {
    const ingredient = getIngredientById(ingredientId);
    if (ingredient == null) {
        return '재료';
    }
    return `${ingredient.emoji} ${ingredient.name}`;
}

export function formatMissionPoolHint(missionId: string): string {
    const fixed = MISSION_FIXED_REWARDS[missionId];
    if (fixed != null) {
        return getIngredientById(fixed)?.emoji ?? '재료';
    }
    const pool = getMissionRewardPool(missionId);
    const labels = pool
        .slice(0, 4)
        .map((id) => getIngredientById(id)?.emoji)
        .filter((e): e is string => e != null);
    return labels.length > 0 ? `${labels.join(' ')} …` : '일반 재료 풀';
}
