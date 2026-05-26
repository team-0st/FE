export type RecipeKind = 'weekly' | 'hidden';

export type Recipe = {
    id: string;
    kind: RecipeKind;
    name: string;
    hint: string;
    ingredientIds: [string, string, string, string];
    ecoJamReward?: number;
    realRewardLabel?: string;
    weekKey?: string;
};

export const BREW_SLOT_COUNT = 4;

export function getIsoWeekKey(date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const ALL_RECIPES: Recipe[] = [
    {
        id: 'weekly-calm',
        kind: 'weekly',
        name: '차분한 허브 스프',
        hint: '허브와 이슬이 어울려요.',
        ingredientIds: ['herb', 'drop', 'leaf', 'carrot'],
        ecoJamReward: 30,
        weekKey: getIsoWeekKey(),
    },
    {
        id: 'weekly-forest',
        kind: 'weekly',
        name: '숲속 버섯 스프',
        hint: '버섯과 잎이 포인트예요.',
        ingredientIds: ['mushroom', 'leaf', 'herb', 'star'],
        ecoJamReward: 40,
        weekKey: getIsoWeekKey(),
    },
    {
        id: 'hidden-golden',
        kind: 'hidden',
        name: '황금 마녀스프',
        hint: '별가루가 들어간 비밀 레시피예요.',
        ingredientIds: ['star', 'herb', 'mushroom', 'drop'],
        realRewardLabel: '제로웨이스트 샵 쿠폰 (실물)',
    },
    {
        id: 'hidden-moon',
        kind: 'hidden',
        name: '달빛 스프',
        hint: '네 가지 재료가 모두 필요해요.',
        ingredientIds: ['star', 'carrot', 'leaf', 'drop'],
        realRewardLabel: '친환경 굿즈 추첨 (실물)',
    },
];

export function getWeeklyRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'weekly' && r.weekKey === weekKey);
}

export function getHiddenRecipes(): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'hidden');
}

export function getRecipeById(id: string): Recipe | undefined {
    return ALL_RECIPES.find((r) => r.id === id);
}

export function slotsMatchRecipe(
    slots: (string | null)[],
    recipe: Recipe,
): boolean {
    if (slots.length !== BREW_SLOT_COUNT || slots.some((s) => s == null)) {
        return false;
    }
    const a = [...slots].sort().join(',');
    const b = [...recipe.ingredientIds].sort().join(',');
    return a === b;
}

export function findRecipeBySlots(slots: (string | null)[]): Recipe | undefined {
    if (slots.some((s) => s == null)) {
        return undefined;
    }
    return ALL_RECIPES.find((r) => slotsMatchRecipe(slots, r));
}

export function findMatchingRecipe(
    slots: (string | null)[],
    completedIds: string[],
): Recipe | undefined {
    const filled = slots.every((s) => s != null);
    if (!filled) {
        return undefined;
    }
    const weekKey = getIsoWeekKey();
    const candidates = ALL_RECIPES.filter((r) => {
        if (completedIds.includes(r.id)) {
            return false;
        }
        if (r.kind === 'weekly' && r.weekKey !== weekKey) {
            return false;
        }
        return slotsMatchRecipe(slots, r);
    });
    return candidates[0];
}

export function getTodayRecipeHint(weekKey = getIsoWeekKey()): string {
    const weekly = getWeeklyRecipes(weekKey);
    return weekly[0]?.hint ?? '미션으로 재료를 모아 스프를 끓여 보세요.';
}
