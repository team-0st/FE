export type Ingredient = {
    id: string;
    name: string;
    emoji: string;
};

/** 일반 7 + 히든·전설용 3 = 10종 */
export const INGREDIENTS: Ingredient[] = [
    { id: 'herb', name: '제로 허브', emoji: '🌿' },
    { id: 'carrot', name: '당근 조각', emoji: '🥕' },
    { id: 'mushroom', name: '버섯', emoji: '🍄' },
    { id: 'star', name: '별가루', emoji: '✨' },
    { id: 'leaf', name: '친환경 잎', emoji: '🍃' },
    { id: 'drop', name: '이슬', emoji: '💧' },
    { id: 'seed', name: '씨앗', emoji: '🌱' },
    { id: 'crystal', name: '수정', emoji: '💎' },
    { id: 'wind', name: '바람잎', emoji: '🌬️' },
    { id: 'ember', name: '잔불', emoji: '🔥' },
];

export const MISSION_REWARD_POOLS: Record<string, string[]> = {
    tumbler: ['herb', 'leaf', 'drop', 'seed'],
    bag: ['leaf', 'carrot', 'herb', 'wind'],
    transit: ['drop', 'leaf', 'mushroom', 'ember'],
    'visit-not-delivery': ['carrot', 'herb', 'drop', 'seed'],
    recycle: ['mushroom', 'leaf', 'star', 'crystal'],
};

export const MISSION_RANDOM_REWARD_LABEL = '랜덤 재료 1종';

export function getIngredientById(id: string): Ingredient | undefined {
    return INGREDIENTS.find((item) => item.id === id);
}

export function getMissionRewardPool(missionId: string): string[] {
    return MISSION_REWARD_POOLS[missionId] ?? INGREDIENTS.map((i) => i.id);
}

export function pickMissionRewardIngredient(
    missionId: string,
    random: () => number = Math.random,
): string | undefined {
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

export function formatMissionIngredientReward(_missionId: string): string {
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
    const pool = getMissionRewardPool(missionId);
    const labels = pool
        .map((id) => getIngredientById(id)?.emoji)
        .filter((e): e is string => e != null);
    return labels.length > 0 ? labels.join(' ') : '재료 풀';
}
