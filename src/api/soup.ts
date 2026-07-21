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

type BeSoupRerollResponse = {
    soupId: number;
    rerollCostEcoJam: number;
    remainingEcoJam: number;
    rewardGrade: string;
    rewardEcoJam: number;
    rewardPoint: number;
    rewardedIngredients: Array<{
        ingredientId: number;
        ingredientName: string;
        quantity: number;
    }>;
};

/** BE 스프 리롤(`POST /soups/{soupId}/reroll`)이 실제로 반환하는 오류 코드만 별도 처리한다 */
export type SoupRerollErrorCode =
    | 'SOUP_NOT_FOUND'
    | 'SOUP_REROLL_ALREADY_COMPLETED'
    | 'SOUP_REROLL_NOT_AVAILABLE'
    | 'SOUP_REROLL_REWARD_RECOVERY_NOT_AVAILABLE'
    | 'INSUFFICIENT_ECO_JAM'
    | 'NETWORK_ERROR';

export type SoupRerollApiResult =
    | { ok: true; craft: SoupCraftResponse; remainingEcoJam: number; rerollCostEcoJam: number }
    | { ok: false; code: SoupRerollErrorCode };

const SOUP_REROLL_ERROR_CODES: ReadonlySet<string> = new Set<SoupRerollErrorCode>([
    'SOUP_NOT_FOUND',
    'SOUP_REROLL_ALREADY_COMPLETED',
    'SOUP_REROLL_NOT_AVAILABLE',
    'SOUP_REROLL_REWARD_RECOVERY_NOT_AVAILABLE',
    'INSUFFICIENT_ECO_JAM',
    'NETWORK_ERROR',
]);

function isSoupRerollErrorCode(code: string): code is SoupRerollErrorCode {
    return SOUP_REROLL_ERROR_CODES.has(code);
}

/**
 * 스프 리롤 응답 매핑 (순수 함수).
 * BE reroll 응답에는 recipeName이 없으므로 직전 craft에서 보존한다.
 */
export function mapSoupRerollResponse(
    data: BeSoupRerollResponse,
    prevCraft: SoupCraftResponse,
): SoupCraftResponse {
    const rewardGrade = mapBeGrade(data.rewardGrade);
    // 기존 SoupCraftResponse는 표시용 재료 ID 하나만 지원한다.
    // 실제 인벤토리는 후속 GET /ingredients의 전체 quantity 스냅샷으로 별도 동기화한다.
    const firstIngredient = data.rewardedIngredients[0];
    const rewardIngredientId =
        firstIngredient != null
            ? (ingredientSlugFromNumeric(firstIngredient.ingredientId) ??
              `be-${firstIngredient.ingredientId}`)
            : undefined;

    const hasReward =
        data.rewardEcoJam > 0 || data.rewardPoint > 0 || data.rewardedIngredients.length > 0;

    return {
        soupId: data.soupId,
        result: hasReward || rewardGrade !== 'FAIL' ? 'SUCCESS' : 'FAIL',
        recipeName: prevCraft.recipeName,
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
        rewardDescription: prevCraft.rewardDescription ?? prevCraft.recipeName,
    };
}

/**
 * POST /api/v1/soups/{soupId}/reroll — body 없음, Bearer 토큰은 공통 client가 처리.
 * USER_NOT_FOUND 등 여기서 다루지 않는 오류 코드는 그대로 다시 던져
 * 호출측(UserProvider)의 등록 복구·재시도 로직이 처리하도록 한다.
 */
export async function postSoupReroll(
    soupId: number,
    prevCraft: SoupCraftResponse,
): Promise<SoupRerollApiResult> {
    try {
        const data = await apiRequest<BeSoupRerollResponse>(API_PATHS.soupReroll(soupId), {
            method: 'POST',
        });
        return {
            ok: true,
            craft: mapSoupRerollResponse(data, prevCraft),
            remainingEcoJam: data.remainingEcoJam,
            rerollCostEcoJam: data.rerollCostEcoJam,
        };
    } catch (error) {
        if (error instanceof ApiClientError && isSoupRerollErrorCode(error.code)) {
            return { ok: false, code: error.code };
        }
        throw error;
    }
}
