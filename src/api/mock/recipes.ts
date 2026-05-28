export type RecipeKind = 'weekly' | 'hidden';

export type Recipe = {
    id: string;
    kind: RecipeKind;
    name: string;
    hint: string;
    /** 일반(weekly) 3개, 히든 4개 — BE 검증 시에도 동일 규칙 */
    ingredientIds: string[];
    ecoJamReward?: number;
    realRewardLabel?: string;
    weekKey?: string;
};

/** 제작 화면 슬롯 UI 최대 칸 수 (히든 기준) */
export const BREW_SLOT_MAX = 4;
export const WEEKLY_INGREDIENT_COUNT = 3;
export const HIDDEN_INGREDIENT_COUNT = 4;

/** @deprecated BREW_SLOT_MAX 사용 */
export const BREW_SLOT_COUNT = BREW_SLOT_MAX;

export function recipeIngredientCount(recipe: Recipe): number {
    return recipe.kind === 'weekly' ? WEEKLY_INGREDIENT_COUNT : HIDDEN_INGREDIENT_COUNT;
}

export function getFilledIngredientIds(slots: (string | null)[]): string[] {
    return slots.filter((s): s is string => s != null);
}

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
        ingredientIds: ['herb', 'drop', 'leaf'],
        ecoJamReward: 30,
        weekKey: getIsoWeekKey(),
    },
    {
        id: 'weekly-forest',
        kind: 'weekly',
        name: '숲속 버섯 스프',
        hint: '버섯과 잎이 포인트예요.',
        ingredientIds: ['mushroom', 'leaf', 'herb'],
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

export function slotsMatchRecipe(slots: (string | null)[], recipe: Recipe): boolean {
    const filled = getFilledIngredientIds(slots);
    if (filled.length !== recipe.ingredientIds.length) {
        return false;
    }
    const a = [...filled].sort().join(',');
    const b = [...recipe.ingredientIds].sort().join(',');
    return a === b;
}

export function findRecipeBySlots(slots: (string | null)[]): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (filled.length !== WEEKLY_INGREDIENT_COUNT && filled.length !== HIDDEN_INGREDIENT_COUNT) {
        return undefined;
    }
    return ALL_RECIPES.find((r) => slotsMatchRecipe(slots, r));
}

export function findMatchingRecipe(
    slots: (string | null)[],
    completedIds: string[],
): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (filled.length !== WEEKLY_INGREDIENT_COUNT && filled.length !== HIDDEN_INGREDIENT_COUNT) {
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

export function isValidBrewFillCount(count: number): boolean {
    return count === WEEKLY_INGREDIENT_COUNT || count === HIDDEN_INGREDIENT_COUNT;
}
