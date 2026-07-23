import { buildAllRecipes, buildWeeklyRecipes, findRecipeInCatalog, BEGINNER_RECIPES, HIDDEN_RECIPES, LEGENDARY_RECIPES } from './recipeCatalog';
import { getIngredientById } from './ingredients';
import type { IngredientCatalogType } from '../notion/types';
import {
    BREW_SLOT_MAX,
    BEGINNER_SLOT_COUNT,
    getIsoWeekKey,
    HIDDEN_SLOT_COUNT,
    LEGENDARY_SLOT_COUNT,
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
    LEGENDARY_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
};

/** @deprecated BREW_SLOT_MAX 사용 */
export const BREW_SLOT_COUNT = BREW_SLOT_MAX;

export function getAllRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return buildAllRecipes(weekKey);
}

/** idMap 등 초기화용 스냅샷 */
export const ALL_RECIPES: Recipe[] = buildAllRecipes();

export function recipeIngredientCount(recipe: Recipe): number {
    return recipe.slotCount;
}

/** 히든·전설 칸(index 3~) — 히든 등급 재료만 */
export function isSpecialBrewSlot(index: number): boolean {
    return index >= WEEKLY_SLOT_COUNT && index < BREW_SLOT_MAX;
}

/** 슬롯 등급 규칙: 일반 칸=COMMON, 히든·전설 칸=HIDDEN (#28/#29) */
export function slotAcceptsIngredientType(
    index: number,
    type: IngredientCatalogType,
): boolean {
    if (index < 0 || index >= BREW_SLOT_MAX) {
        return false;
    }
    if (isSpecialBrewSlot(index)) {
        return type === 'HIDDEN';
    }
    return type === 'COMMON';
}

/** 재료 등급에 맞는 첫 빈 슬롯. 없으면 -1 */
export function findEmptySlotForIngredient(
    slots: (string | null)[],
    ingredientId: string,
): number {
    const ingredient = getIngredientById(ingredientId);
    if (ingredient == null) {
        return -1;
    }
    return slots.findIndex(
        (slot, index) => slot == null && slotAcceptsIngredientType(index, ingredient.type),
    );
}

export function getFilledIngredientIds(slots: (string | null)[]): string[] {
    return slots.filter((s): s is string => s != null);
}

export function getWeeklyRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return buildWeeklyRecipes(weekKey);
}

export function getBeginnerRecipes(): Recipe[] {
    return BEGINNER_RECIPES;
}

export function getHiddenRecipes(): Recipe[] {
    return HIDDEN_RECIPES;
}

export function getLegendaryRecipes(): Recipe[] {
    return LEGENDARY_RECIPES;
}

export function getRecipeById(id: string): Recipe | undefined {
    if (!id) {
        return undefined;
    }
    return findRecipeInCatalog(id);
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

const VALID_SLOT_COUNTS = [
    BEGINNER_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
    HIDDEN_SLOT_COUNT,
    LEGENDARY_SLOT_COUNT,
] as const;

export function findRecipeBySlots(slots: (string | null)[]): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (!VALID_SLOT_COUNTS.includes(filled.length as (typeof VALID_SLOT_COUNTS)[number])) {
        return undefined;
    }
    return getAllRecipes().find((r) => slotsMatchRecipe(slots, r));
}

/** 같은 레시피 반복 brew 허용 — completedIds는 호환용으로 무시 */
export function findMatchingRecipe(
    slots: (string | null)[],
    _completedIds: string[] = [],
): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (!VALID_SLOT_COUNTS.includes(filled.length as (typeof VALID_SLOT_COUNTS)[number])) {
        return undefined;
    }
    const weekKey = getIsoWeekKey();
    const candidates = getAllRecipes(weekKey).filter((r) => {
        if (r.kind === 'weekly' && r.weekKey !== weekKey) {
            return false;
        }
        return slotsMatchRecipe(slots, r);
    });
    return candidates[0];
}

/** 요일로 고른 이번 주(weekly) 레시피 1개 — 힌트·상단 고정 공통 */
export function getTodayRecipe(weekKey = getIsoWeekKey()): Recipe | undefined {
    const weekly = getWeeklyRecipes(weekKey);
    if (weekly.length === 0) {
        return undefined;
    }
    const index = new Date().getDay() % weekly.length;
    return weekly[index];
}

export function getTodayRecipeHint(weekKey = getIsoWeekKey()): string {
    const recipe = getTodayRecipe(weekKey);
    if (recipe == null) {
        return '미션으로 재료를 모아\n스프를 끓여 보세요.';
    }
    const raw = recipe.hintDrip ?? recipe.hint ?? '오늘의 힌트를 확인해 보세요.';
    return formatRecipeHintLines(raw);
}

/** 힌트 문장을 읽기 쉽게 줄바꿈 (느낌표·물음표·마침표 뒤) */
export function formatRecipeHintLines(hint: string): string {
    return hint
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/([!?。.])\s+/g, '$1\n');
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
        return `재료 ${recipe.slotCount}개 · 전설 (비공개)`;
    }
    return '재료 4개 · 히든 (비공개)';
}

/** 입문·이번주 등 공개 레시피 UI용 재료 조합 문자열 */
export function formatRecipeIngredients(recipe: Recipe): string {
    return recipe.ingredientIds
        .map((id) => {
            const item = getIngredientById(id);
            return item != null ? item.name : id;
        })
        .join(' + ');
}

export function isPublicRecipe(recipe: Recipe): boolean {
    return recipe.kind === 'beginner' || recipe.kind === 'weekly';
}

function countIngredientNeeds(ingredientIds: string[]): Record<string, number> {
    return ingredientIds.reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
    }, {});
}

export function canAffordRecipe(inventory: Record<string, number>, recipe: Recipe): boolean {
    const need = countIngredientNeeds(recipe.ingredientIds);
    return Object.entries(need).every(([id, count]) => (inventory[id] ?? 0) >= count);
}

export function recipeToSlots(recipe: Recipe): (string | null)[] {
    const slots: (string | null)[] = Array.from({ length: BREW_SLOT_MAX }, () => null);
    const commons: string[] = [];
    const hiddens: string[] = [];
    for (const id of recipe.ingredientIds) {
        const type = getIngredientById(id)?.type;
        if (type === 'HIDDEN') {
            hiddens.push(id);
        } else {
            commons.push(id);
        }
    }
    commons.forEach((id, index) => {
        if (index < WEEKLY_SLOT_COUNT) {
            slots[index] = id;
        }
    });
    hiddens.forEach((id, index) => {
        const slotIndex = WEEKLY_SLOT_COUNT + index;
        if (slotIndex < BREW_SLOT_MAX) {
            slots[slotIndex] = id;
        }
    });
    return slots;
}

const RECOMMEND_KIND_ORDER: Record<RecipeKind, number> = {
    beginner: 0,
    weekly: 1,
    hidden: 2,
    legendary: 3,
};

export function getAffordableRecipes(
    inventory: Record<string, number>,
    completedIds: string[],
    weekKey = getIsoWeekKey(),
): Recipe[] {
    return getAllRecipes(weekKey)
        .filter((recipe) => {
            if (completedIds.includes(recipe.id)) {
                return false;
            }
            if (recipe.kind === 'weekly' && recipe.weekKey !== weekKey) {
                return false;
            }
            return canAffordRecipe(inventory, recipe);
        })
        .sort((a, b) => {
            const kindDiff = RECOMMEND_KIND_ORDER[a.kind] - RECOMMEND_KIND_ORDER[b.kind];
            if (kindDiff !== 0) {
                return kindDiff;
            }
            return a.slotCount - b.slotCount;
        });
}

/** 제작 화면 추천용 — 입문·이번주만 (히idden·전설 제외) */
export function getRecommendedRecipes(
    inventory: Record<string, number>,
    completedIds: string[],
    weekKey = getIsoWeekKey(),
): Recipe[] {
    return getAffordableRecipes(inventory, completedIds, weekKey).filter(
        (recipe) => recipe.kind === 'beginner' || recipe.kind === 'weekly',
    );
}

export function hasAffordableSecretRecipes(
    inventory: Record<string, number>,
    completedIds: string[],
    weekKey = getIsoWeekKey(),
): boolean {
    return getAllRecipes(weekKey).some((recipe) => {
        if (recipe.kind !== 'hidden' && recipe.kind !== 'legendary') {
            return false;
        }
        if (completedIds.includes(recipe.id)) {
            return false;
        }
        return canAffordRecipe(inventory, recipe);
    });
}

export function recommendationTitle(recipe: Recipe): string {
    return recipe.name;
}
