import type { Recipe } from './mock/recipeTypes';
import { ingredientIdsToNumeric } from './notion/idMap';
import type { SoupCraftResponse } from './notion/types';
import { mockRollSoupCraft } from './mock/soupCraftMock';

export type { SoupCraftResponse };
export {
    encodeSoupCraftForRoute,
    decodeSoupCraftFromRoute,
} from './mock/soupCraftMock';

/** POST /api/soup/craft — 조합 검증 + 보상 (노션 명세) */
export async function postSoupCraft(
    recipe: Recipe,
    ingredientSlugs: string[],
    random: () => number = Math.random,
): Promise<SoupCraftResponse> {
    await new Promise((r) => setTimeout(r, 40));
    const numericIds = ingredientIdsToNumeric(ingredientSlugs);
    if (numericIds.length !== ingredientSlugs.length) {
        return {
            soupId: 0,
            result: 'FAIL',
            rewardType: 'TRASH_ITEM',
            rewardDescription: '재료를 다시 확인해 주세요',
        };
    }
    return mockRollSoupCraft(recipe, random);
}

/** @deprecated use postSoupCraft */
export async function postSoupBrewReward(
    recipe: Recipe,
    random: () => number = Math.random,
): Promise<SoupCraftResponse> {
    return postSoupCraft(recipe, recipe.ingredientIds, random);
}
