import type { Recipe } from './mock/recipeTypes';
import {
    decodeSoupOutcome,
    encodeSoupOutcome,
    mockRollSoupReward,
    type SoupBrewOutcome,
    type SoupRewardKind,
} from './mock/soupRewardMock';

export type { SoupBrewOutcome, SoupRewardKind };
export { decodeSoupOutcome, encodeSoupOutcome };

export async function postSoupBrewReward(
    recipe: Recipe,
    random: () => number = Math.random,
): Promise<SoupBrewOutcome> {
    await new Promise((r) => setTimeout(r, 40));
    return mockRollSoupReward(recipe, random);
}
