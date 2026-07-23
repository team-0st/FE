import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { INGREDIENTS } from './mock/ingredients';
import {
    getAllRecipes,
    getFilledIngredientIds,
    slotsMatchRecipe,
} from './mock/recipes';
import {
    BEGINNER_SLOT_COUNT,
    HIDDEN_SLOT_COUNT,
    LEGENDARY_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
    type Recipe,
    type RecipeKind,
} from './mock/recipeTypes';
import {
    ingredientSlugFromNumeric,
    recipeNumericId,
    recipeSlugFromNumeric,
} from './notion/idMap';
import { API_PATHS } from './notion/types';

export type UnlockHiddenRecipeResult =
    | {
          ok: true;
          recipeId: number;
          recipeName: string;
          remainingEcoJam: number;
      }
    | {
          ok: false;
          code: 'INSUFFICIENT_ECO_JAM' | 'NO_HIDDEN_RECIPE' | 'NETWORK_ERROR';
      };

type BeRecipeSummary = {
    recipeId: number;
    name: string;
    type: string;
    slotCount: number;
    recipeVisible: boolean;
};

type BeRecipeSections = {
    introRecipes: BeRecipeSummary[];
    generalRecipes: BeRecipeSummary[];
    /** @deprecated BE #104 이전 호환 */
    weeklyRecipe?: BeRecipeSummary | null;
    hiddenRecipes: BeRecipeSummary[];
    legendaryRecipes: BeRecipeSummary[];
};

type BeRecipeDetail = BeRecipeSummary & {
    ingredients: Array<{
        ingredientId: number;
        name: string;
        type: string;
        imageUrl: string | null;
        slotOrder: number;
    }>;
};

export type RecipeSectionsView = {
    beginner: Recipe[];
    weekly: Recipe[];
    hidden: Recipe[];
    legendary: Recipe[];
};

let cachedSections: RecipeSectionsView | null = null;
const detailCache = new Map<string, Recipe>();

function kindFromBeType(type: string): RecipeKind {
    const t = type.toUpperCase();
    if (t === 'HIDDEN') {
        return 'hidden';
    }
    if (t === 'LEGENDARY') {
        return 'legendary';
    }
    if (t === 'TRASH' || t === 'BEGINNER' || t === 'INTRO') {
        return 'beginner';
    }
    return 'weekly';
}

function summaryToRecipe(raw: BeRecipeSummary, kindOverride?: RecipeKind): Recipe {
    const slug =
        recipeSlugFromNumeric(raw.recipeId) ?? `be-${raw.recipeId}`;
    return {
        id: slug,
        name: raw.name,
        kind: kindOverride ?? kindFromBeType(raw.type),
        slotCount: raw.slotCount,
        ingredientIds: [],
        hint: '',
        recipeVisible: raw.recipeVisible,
    };
}

function resolveIngredientSlugFromBe(ing: {
    ingredientId: number;
    name: string;
}): string {
    const byId = ingredientSlugFromNumeric(ing.ingredientId);
    if (byId != null) {
        return byId;
    }
    const byName = INGREDIENTS.find(
        (item) => item.name.trim() === ing.name.trim(),
    );
    if (byName != null) {
        return byName.id;
    }
    return `be-${ing.ingredientId}`;
}

function resolveBeRecipeId(recipe: Recipe): number | undefined {
    const beKey = /^be-(\d+)$/.exec(recipe.id);
    if (beKey != null) {
        return Number(beKey[1]);
    }
    return recipeNumericId(recipe.id);
}

async function hydrateRecipeIngredients(summary: Recipe): Promise<Recipe> {
    if (summary.ingredientIds.length > 0) {
        return summary;
    }
    if (summary.recipeVisible === false) {
        return summary;
    }
    const beId = resolveBeRecipeId(summary);
    if (beId == null) {
        return summary;
    }
    try {
        return (await getRecipeDetail(beId)) ?? summary;
    } catch {
        return summary;
    }
}

async function hydrateSections(
    view: RecipeSectionsView,
): Promise<RecipeSectionsView> {
    const [beginner, weekly, hidden, legendary] = await Promise.all([
        Promise.all(view.beginner.map(hydrateRecipeIngredients)),
        Promise.all(view.weekly.map(hydrateRecipeIngredients)),
        Promise.all(view.hidden.map(hydrateRecipeIngredients)),
        Promise.all(view.legendary.map(hydrateRecipeIngredients)),
    ]);
    return { beginner, weekly, hidden, legendary };
}

function parseGeneralRecipes(raw: BeRecipeSections): BeRecipeSummary[] {
    if (Array.isArray(raw.generalRecipes) && raw.generalRecipes.length > 0) {
        return raw.generalRecipes;
    }
    if (raw.weeklyRecipe != null) {
        return [raw.weeklyRecipe];
    }
    return raw.generalRecipes ?? [];
}

/** GET /api/v1/recipes — 목록 + detail로 재료 슬롯 채움 */
export async function getRecipeSections(): Promise<RecipeSectionsView | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const raw = await apiRequest<BeRecipeSections>(API_PATHS.recipes);
    const base: RecipeSectionsView = {
        beginner: (raw.introRecipes ?? []).map((r) =>
            summaryToRecipe(r, 'beginner'),
        ),
        weekly: parseGeneralRecipes(raw).map((r) => summaryToRecipe(r, 'weekly')),
        hidden: (raw.hiddenRecipes ?? []).map((r) =>
            summaryToRecipe(r, 'hidden'),
        ),
        legendary: (raw.legendaryRecipes ?? []).map((r) =>
            summaryToRecipe(r, 'legendary'),
        ),
    };
    const view = await hydrateSections(base);
    cachedSections = view;
    return view;
}

export function getCachedRecipeSections(): RecipeSectionsView | null {
    return cachedSections;
}

/** GET /api/v1/recipes/{id} — brew 매칭용 재료 슬롯 */
export async function getRecipeDetail(
    beRecipeId: number,
): Promise<Recipe | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const cacheKey = String(beRecipeId);
    const hit = detailCache.get(cacheKey);
    if (hit != null && hit.ingredientIds.length > 0) {
        return hit;
    }
    const raw = await apiRequest<BeRecipeDetail>(
        API_PATHS.recipeDetail(beRecipeId),
    );
    const base = summaryToRecipe(raw);
    const sorted = [...(raw.ingredients ?? [])].sort(
        (a, b) => a.slotOrder - b.slotOrder,
    );
    const recipe: Recipe = {
        ...base,
        ingredientIds: sorted.map(resolveIngredientSlugFromBe),
    };
    detailCache.set(cacheKey, recipe);
    detailCache.set(recipe.id, recipe);
    return recipe;
}

let brewCatalog: Recipe[] | null = null;

/**
 * brew 매칭용 — 섹션 목록 + 각 레시피 detail(재료 슬롯)을 채운 카탈로그.
 */
export async function ensureBrewRecipeCatalog(): Promise<Recipe[]> {
    if (!isApiEnabled()) {
        return getAllRecipes();
    }
    if (
        brewCatalog != null &&
        brewCatalog.length > 0 &&
        brewCatalog.every((r) => r.ingredientIds.length > 0)
    ) {
        return brewCatalog;
    }
    const sections = cachedSections ?? (await getRecipeSections());
    if (sections == null) {
        return getAllRecipes();
    }
    const summaries = [
        ...sections.beginner,
        ...sections.weekly,
        ...sections.hidden,
        ...sections.legendary,
    ];
    const detailed = await Promise.all(summaries.map(hydrateRecipeIngredients));
    brewCatalog = detailed.filter((r) => r.ingredientIds.length > 0);
    return brewCatalog.length > 0 ? brewCatalog : getAllRecipes();
}

const VALID_SLOT_COUNTS = [
    BEGINNER_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
    HIDDEN_SLOT_COUNT,
    LEGENDARY_SLOT_COUNT,
] as const;

/** BE/로컬 카탈로그에서 슬롯 조합 매칭 (같은 레시피 반복 brew 허용) */
export function findMatchingBrewRecipe(
    slots: (string | null)[],
    catalog: Recipe[],
): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (
        !VALID_SLOT_COUNTS.includes(
            filled.length as (typeof VALID_SLOT_COUNTS)[number],
        )
    ) {
        return undefined;
    }
    return catalog.find((recipe) => slotsMatchRecipe(slots, recipe));
}

export function findBrewRecipeBySlots(
    slots: (string | null)[],
    catalog: Recipe[],
): Recipe | undefined {
    const filled = getFilledIngredientIds(slots);
    if (
        !VALID_SLOT_COUNTS.includes(
            filled.length as (typeof VALID_SLOT_COUNTS)[number],
        )
    ) {
        return undefined;
    }
    return catalog.find((r) => slotsMatchRecipe(slots, r));
}

/** POST /api/v1/recipes/unlock/hidden */
export async function postUnlockHiddenRecipe(): Promise<UnlockHiddenRecipeResult | null> {
    if (!isApiEnabled()) {
        return null;
    }
    try {
        const data = await apiRequest<{
            recipeId: number;
            recipeName: string;
            remainingEcoJam: number;
        }>(API_PATHS.recipesUnlockHidden, { method: 'POST' });
        return {
            ok: true,
            recipeId: data.recipeId,
            recipeName: data.recipeName,
            remainingEcoJam: data.remainingEcoJam,
        };
    } catch (error) {
        if (error instanceof ApiClientError) {
            if (error.code === 'INSUFFICIENT_ECO_JAM') {
                return { ok: false, code: 'INSUFFICIENT_ECO_JAM' };
            }
            if (
                error.code === 'NO_HIDDEN_RECIPE' ||
                error.code === 'HIDDEN_RECIPE_NOT_FOUND' ||
                error.code === 'ALL_UNLOCKED' ||
                error.code === 'ALL_HIDDEN_RECIPES_ALREADY_UNLOCKED'
            ) {
                return { ok: false, code: 'NO_HIDDEN_RECIPE' };
            }
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}
