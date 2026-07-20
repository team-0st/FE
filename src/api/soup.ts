import { ApiClientError, apiRequest, isApiEnabled } from './client';
import type { Recipe } from './mock/recipeTypes';
import { mockRollSoupCraft } from './mock/soupCraftMock';
import {
    ingredientIdsToNumeric,
    ingredientSlugFromNumeric,
} from './notion/idMap';
import type { SoupCraftResponse, SoupRewardGradeWire } from './notion/types';
import { API_PATHS } from './notion/types';

export type { SoupCraftResponse };
export {
    encodeSoupCraftForRoute,
    decodeSoupCraftFromRoute,
} from './mock/soupCraftMock';

type BeBrewSoupResponse = {
    soupId: number;
    recipeId: number;
    recipeName: string;
    recipeType: string;
    rewardGrade: string;
    rewardEcoJam: number;
    rewardPoint: number;
    rewardedIngredients: Array<{
        ingredientId: number;
        ingredientName: string;
        quantity: number;
    }>;
};

function mapBeGrade(grade: string): SoupRewardGradeWire {
    switch (grade) {
        case 'JACKPOT':
            return 'JACKPOT';
        case 'MIDDLE':
            return 'MEDIUM';
        case 'SMALL':
            return 'SMALL';
        case 'INGREDIENT':
            return 'INGREDIENT';
        case 'CONSOLATION':
            return 'FAIL';
        default:
            return 'FAIL';
    }
}

function mapBrewResponse(data: BeBrewSoupResponse): SoupCraftResponse {
    const rewardGrade = mapBeGrade(data.rewardGrade);
    const firstIng = data.rewardedIngredients[0];
    const rewardIngredientId =
        firstIng != null
            ? (ingredientSlugFromNumeric(firstIng.ingredientId) ?? `be-${firstIng.ingredientId}`)
            : undefined;

    const hasReward =
        data.rewardEcoJam > 0 || data.rewardPoint > 0 || data.rewardedIngredients.length > 0;

    return {
        soupId: data.soupId,
        result: hasReward || rewardGrade !== 'FAIL' ? 'SUCCESS' : 'FAIL',
        recipeName: data.recipeName,
        rewardGrade,
        rewardEcoJam: data.rewardEcoJam > 0 ? data.rewardEcoJam : undefined,
        rewardPoint: data.rewardPoint > 0 ? data.rewardPoint : undefined,
        rewardIngredientId,
        rewardType:
            data.rewardPoint > 0
                ? 'ALMANG_POINT'
                : data.rewardEcoJam > 0
                  ? 'ECO_JAM'
                  : rewardIngredientId != null
                    ? 'ECO_JAM'
                    : 'TRASH_ITEM',
        rewardAmount:
            data.rewardPoint > 0
                ? data.rewardPoint
                : data.rewardEcoJam > 0
                  ? data.rewardEcoJam
                  : undefined,
        rewardDescription: data.recipeName,
    };
}

/** POST /api/v1/soups/brew — 조합 검증 + 보상 (API 없으면 mock) */
export async function postSoupCraft(
    recipe: Recipe,
    ingredientSlugs: string[],
    random: () => number = Math.random,
): Promise<SoupCraftResponse> {
    const numericIds = ingredientIdsToNumeric(ingredientSlugs);
    if (numericIds.length !== ingredientSlugs.length) {
        return {
            soupId: 0,
            result: 'FAIL',
            rewardType: 'TRASH_ITEM',
            rewardDescription: '재료를 다시 확인해 주세요',
        };
    }

    if (isApiEnabled()) {
        try {
            const data = await apiRequest<BeBrewSoupResponse>(API_PATHS.soupsBrew, {
                method: 'POST',
                body: { ingredientIds: numericIds },
            });
            return mapBrewResponse(data);
        } catch (error) {
            if (error instanceof ApiClientError) {
                if (error.code === 'INSUFFICIENT_INGREDIENT_QUANTITY') {
                    return {
                        soupId: 0,
                        result: 'FAIL',
                        rewardType: 'TRASH_ITEM',
                        rewardDescription: '재료가 부족해요',
                        rewardGrade: 'FAIL',
                    };
                }
                // BE 레시피 미연동·입문 2칸 거부 등 — FE가 이미 맞춘 조합은 mock으로 진행
                if (
                    error.code === 'SOUP_RECIPE_NOT_FOUND' ||
                    error.code === 'RECIPE_NOT_FOUND' ||
                    error.code === 'INVALID_INPUT_VALUE'
                ) {
                    await new Promise((r) => setTimeout(r, 40));
                    return mockRollSoupCraft(recipe, random);
                }
            }
            throw error;
        }
    }

    await new Promise((r) => setTimeout(r, 40));
    return mockRollSoupCraft(recipe, random);
}

/** @deprecated use postSoupCraft */
export async function postSoupBrewReward(
    recipe: Recipe,
    random: () => number = Math.random,
): Promise<SoupCraftResponse> {
    return postSoupCraft(recipe, recipe.ingredientIds, random);
}
