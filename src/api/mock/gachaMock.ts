import { rollGachaReward } from '../../features/gacha/gachaLogic';
import { GACHA_PULL_COST_ECO_JAM } from '../../features/gacha/gachaConfig';
import type { GachaReward } from '../../features/gacha/gachaTypes';
import { toIngredientDto } from '../notion/idMap';
import type { GachaResponse } from '../notion/types';

export type GachaPullApiResult =
    | { ok: true; response: GachaResponse; reward: GachaReward; remainingEcoJam: number }
    | { ok: false; code: 'INSUFFICIENT_ECO_JAM' };

export async function mockPostGacha(
    currentEcoJam: number,
    random: () => number = Math.random,
): Promise<GachaPullApiResult> {
    await new Promise((r) => setTimeout(r, 60));
    if (currentEcoJam < GACHA_PULL_COST_ECO_JAM) {
        return { ok: false, code: 'INSUFFICIENT_ECO_JAM' };
    }
    const reward = rollGachaReward(random);
    let remainingEcoJam = currentEcoJam - GACHA_PULL_COST_ECO_JAM;
    if (reward.type === 'ECO_JAM') {
        remainingEcoJam += reward.amount;
    }
    if (reward.type === 'FAIL') {
        remainingEcoJam += reward.consolationEcoJam;
    }
    let resultIngredient: GachaResponse['resultIngredient'] = undefined;
    if (reward.type === 'INGREDIENT') {
        resultIngredient = toIngredientDto(reward.ingredientId);
    }
    const response: GachaResponse = {
        gachaId: Math.floor(random() * 100000),
        costEcoJam: GACHA_PULL_COST_ECO_JAM,
        resultType: reward.type,
        resultAmount:
            reward.type === 'ECO_JAM' || reward.type === 'ALMANG_POINT'
                ? reward.amount
                : reward.type === 'FAIL'
                  ? reward.consolationEcoJam
                  : undefined,
        resultIngredient,
        remainingEcoJam,
    };
    return { ok: true, response, reward, remainingEcoJam };
}
