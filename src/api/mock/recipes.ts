import { buildAllRecipes } from './recipeCatalog';
import {
    BREW_SLOT_MAX,
    BEGINNER_SLOT_COUNT,
    getIsoWeekKey,
    HIDDEN_SLOT_COUNT,
    type Recipe,
    type RecipeKind,
    WEEKLY_SLOT_COUNT,
} from './recipeTypes';

export type { Recipe, RecipeKind };
export {
    BREW_SLOT_MAX,
    BEGINNER_SLOT_COUNT,
    getIsoWeekKey,
    HIDDEN_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
};

/** @deprecated BREW_SLOT_MAX 사용 */
export const BREW_SLOT_COUNT = BREW_SLOT_MAX;

export const ALL_RECIPES: Recipe[] = buildAllRecipes();

export function recipeIngredientCount(recipe: Recipe): number {
    return recipe.slotCount;
}

export function getFilledIngredientIds(slots: (string | null)[]): string[] {
    return slots.filter((s): s is string => s != null);
}

export function getWeeklyRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'weekly' && r.weekKey === weekKey);
}

export function getBeginnerRecipes(): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'beginner');
}

export function getHiddenRecipes(): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'hidden');
}

export function getLegendaryRecipes(): Recipe[] {
    return ALL_RECIPES.filter((r) => r.kind === 'legendary');
}

export function getRecipeById(id: string): Recipe | undefined {
    return ALL_RECIPES.find((r) => r.id === id);
}

export function slotsMatchRecipe(slots: (string | null)[], recipe: Recipe): boolean {
    const filled = getFilledIngredientIds(slots);
    if (filled.length !== recipe.slotCount) {
        return false;
    }
    const a = [...filled].sort().join(',');
    const b = [...recipe.ingredientIds].sort().join(',');
    return a === b;
}

const VALID_SLOT_COUNTS = [BEGINNER_SLOT_COUNT, WEEKLY_SLOT_COUNT, HIDDEN_SLOT_COUNT] as const;

export function findRecipeBySlots(slots: (string | null)[]): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (!VALID_SLOT_COUNTS.includes(filled.length as (typeof VALID_SLOT_COUNTS)[number])) {
        return undefined;
    }
    return ALL_RECIPES.find((r) => slotsMatchRecipe(slots, r));
}

export function findMatchingRecipe(
    slots: (string | null)[],
    completedIds: string[],
): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (!VALID_SLOT_COUNTS.includes(filled.length as (typeof VALID_SLOT_COUNTS)[number])) {
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
    if (weekly.length === 0) {
        return '미션으로 재료를 모아 스프를 끓여 보세요.';
    }
    const index = new Date().getDay() % weekly.length;
    const recipe = weekly[index];
    return recipe?.hintDrip ?? recipe?.hint ?? '이번 주 힌트를 확인해 보세요.';
}

export function isValidBrewFillCount(count: number): boolean {
    return (VALID_SLOT_COUNTS as readonly number[]).includes(count);
}

export function getRecipeRewardSummary(recipe: Recipe, done: boolean): string {
    if (done) {
        return '완료';
    }
    if (recipe.kind === 'beginner') {
        return `재료 ${recipe.slotCount}개 · 입문 (확률 보상)`;
    }
    if (recipe.kind === 'weekly') {
        return `재료 ${recipe.slotCount}개 · 확률 보상`;
    }
    if (recipe.kind === 'legendary') {
        return '재료 4개 · 전설 (비공개)';
    }
    return '재료 4개 · 히든 (비공개)';
}
