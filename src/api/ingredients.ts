import { apiRequest, isApiEnabled } from './client';
import { ingredientSlugFromNumeric } from './notion/idMap';
import { API_PATHS, type UserIngredientResponse } from './notion/types';

/** GET /api/v1/ingredients — 보유 재료. URL 없으면 null (로컬 상태 유지) */
export async function getUserIngredients(): Promise<UserIngredientResponse[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    return apiRequest<UserIngredientResponse[]>(API_PATHS.ingredients);
}

/** BE 보유 재료 → FE inventory slug map */
export function inventoryFromUserIngredients(
    items: UserIngredientResponse[],
): Record<string, number> {
    const next: Record<string, number> = {};
    for (const item of items) {
        const slug = ingredientSlugFromNumeric(item.ingredientId) ?? `be-${item.ingredientId}`;
        next[slug] = item.quantity;
    }
    return next;
}
