import { INGREDIENTS } from '../mock/ingredients';
import { ALL_MISSIONS } from '../mock/missions';
import { ALL_RECIPES } from '../mock/recipes';
import { MOCK_SHOPS } from '../mock/shops';
import type { IngredientDto } from './types';

function buildNumericMap<T extends { id: string }>(items: T[]): Map<string, number> {
    const map = new Map<string, number>();
    items.forEach((item, index) => {
        map.set(item.id, index + 1);
    });
    return map;
}

const ingredientNumericBySlug = buildNumericMap(INGREDIENTS);
const missionNumericBySlug = buildNumericMap(ALL_MISSIONS);
const shopNumericBySlug = buildNumericMap(MOCK_SHOPS);
const recipeNumericBySlug = buildNumericMap(ALL_RECIPES);

export function ingredientNumericId(slug: string): number | undefined {
    return ingredientNumericBySlug.get(slug);
}

export function ingredientSlugFromNumeric(id: number): string | undefined {
    const entry = INGREDIENTS[id - 1];
    return entry?.id;
}

export function missionNumericId(slug: string): number | undefined {
    return missionNumericBySlug.get(slug);
}

export function missionSlugFromNumeric(id: number): string | undefined {
    return ALL_MISSIONS[id - 1]?.id;
}

export function shopNumericId(slug: string): number | undefined {
    return shopNumericBySlug.get(slug);
}

export function shopSlugFromNumeric(id: number): string | undefined {
    return MOCK_SHOPS[id - 1]?.id;
}

export function recipeNumericId(slug: string): number | undefined {
    return recipeNumericBySlug.get(slug);
}

export function recipeSlugFromNumeric(id: number): string | undefined {
    return ALL_RECIPES[id - 1]?.id;
}

export function ingredientIdsToNumeric(slugs: string[]): number[] {
    return slugs.map((slug) => ingredientNumericId(slug) ?? 0).filter((id) => id > 0);
}

export function toIngredientDto(slug: string): IngredientDto | undefined {
    const ingredient = INGREDIENTS.find((item) => item.id === slug);
    const numericId = ingredientNumericId(slug);
    if (ingredient == null || numericId == null) {
        return undefined;
    }
    return {
        id: numericId,
        name: ingredient.name,
        type: ingredient.type,
        imageUrl: null,
    };
}
