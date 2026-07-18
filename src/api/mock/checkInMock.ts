import type { CheckInRequestContext, CheckInResult } from '../checkIn';
import { COMMON_INGREDIENT_IDS } from './ingredients';
import { ingredientSlugFromNumeric, toIngredientDto } from '../notion/idMap';
import type { CheckInResponse } from '../notion/types';

const MOCK_WEIGHTS: { id: string; weight: number }[] = COMMON_INGREDIENT_IDS.map((id) => ({
    id,
    weight: id === 'cabbage' || id === 'tomato' ? 4 : 3,
}));

function pickMockRewardSlug(): string {
    const total = MOCK_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of MOCK_WEIGHTS) {
        roll -= item.weight;
        if (roll <= 0) {
            return item.id;
        }
    }
    return COMMON_INGREDIENT_IDS[0] ?? 'cabbage';
}

export async function mockPostCheckIn(ctx: CheckInRequestContext): Promise<CheckInResult> {
    await new Promise((r) => setTimeout(r, 80));
    if (ctx.lastCheckInDate === ctx.today) {
        return { ok: false, code: 'ALREADY_CHECKED_IN' };
    }
    const slug = pickMockRewardSlug();
    const dto = toIngredientDto(slug);
    if (dto == null) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    const prev = ctx.ingredientInventory[slug] ?? 0;
    const ingredientInventory = {
        ...ctx.ingredientInventory,
        [slug]: prev + 1,
    };
    const response: CheckInResponse = {
        alreadyChecked: false,
        rewardedIngredient: dto,
    };
    return {
        ok: true,
        data: {
            ingredientInventory,
            response,
            ingredientId: slug,
        },
    };
}

export async function mockGetCheckInStatus(lastCheckInDate: string | null, today: string): Promise<CheckInResponse> {
    await new Promise((r) => setTimeout(r, 20));
    return { alreadyChecked: lastCheckInDate === today };
}

export function ingredientIdFromCheckInResponse(response: CheckInResponse): string | undefined {
    const numericId = response.rewardedIngredient?.id;
    if (numericId == null) {
        return undefined;
    }
    return ingredientSlugFromNumeric(numericId);
}
