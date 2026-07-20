import type { GachaReward } from '../features/gacha/gachaTypes';
import { GACHA_PULL_COST_ECO_JAM } from '../features/gacha/gachaConfig';
import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { mockPostGacha, type GachaPullApiResult } from './mock/gachaMock';
import { ingredientSlugFromNumeric, toIngredientDto } from './notion/idMap';
import type { GachaResponse } from './notion/types';
import { API_PATHS } from './notion/types';

export type { GachaReward };
export type { GachaPullApiResult };

type BeExecuteGachaResponse = {
    gachaId: number;
    costEcoJam: number;
    remainingEcoJam: number;
    resultType: string;
    resultPoint: number;
    resultEcoJam: number;
    resultIngredientId: number | null;
    resultIngredientQuantity: number;
};

function mapBeGachaReward(data: BeExecuteGachaResponse): GachaReward {
    switch (data.resultType) {
        case 'POINT':
            return { type: 'ALMANG_POINT', amount: data.resultPoint };
        case 'ECO_JAM':
            return { type: 'ECO_JAM', amount: data.resultEcoJam };
        case 'INGREDIENT': {
            const slug =
                data.resultIngredientId != null
                    ? (ingredientSlugFromNumeric(data.resultIngredientId) ??
                      `be-${data.resultIngredientId}`)
                    : 'cabbage';
            return {
                type: 'INGREDIENT',
                ingredientId: slug,
                amount: Math.max(1, data.resultIngredientQuantity),
                rarity: 'COMMON',
            };
        }
        case 'FAIL':
        default:
            return {
                type: 'FAIL',
                consolationEcoJam: data.resultEcoJam,
            };
    }
}

function toGachaResponse(data: BeExecuteGachaResponse, reward: GachaReward): GachaResponse {
    let resultIngredient: GachaResponse['resultIngredient'];
    if (reward.type === 'INGREDIENT') {
        resultIngredient = toIngredientDto(reward.ingredientId);
    }
    return {
        gachaId: data.gachaId,
        costEcoJam: data.costEcoJam || GACHA_PULL_COST_ECO_JAM,
        resultType: reward.type,
        resultAmount:
            reward.type === 'ECO_JAM' || reward.type === 'ALMANG_POINT'
                ? reward.amount
                : reward.type === 'FAIL'
                  ? reward.consolationEcoJam
                  : undefined,
        resultIngredient,
        remainingEcoJam: data.remainingEcoJam,
    };
}

/** POST /api/v1/gachas/draw — API 없으면 mock */
export async function postGacha(
    currentEcoJam: number,
    random: () => number = Math.random,
): Promise<GachaPullApiResult> {
    if (!isApiEnabled()) {
        return mockPostGacha(currentEcoJam, random);
    }

    try {
        const data = await apiRequest<BeExecuteGachaResponse>(API_PATHS.gachasDraw, {
            method: 'POST',
        });
        const reward = mapBeGachaReward(data);
        const response = toGachaResponse(data, reward);
        return {
            ok: true,
            response,
            reward,
            remainingEcoJam: data.remainingEcoJam,
        };
    } catch (error) {
        if (error instanceof ApiClientError && error.code === 'INSUFFICIENT_ECO_JAM') {
            return { ok: false, code: 'INSUFFICIENT_ECO_JAM' };
        }
        throw error;
    }
}
