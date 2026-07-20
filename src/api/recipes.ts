import { ApiClientError, apiRequest, isApiEnabled } from './client';
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
