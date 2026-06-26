import type { CheckInRequestContext, CheckInResult } from '../checkIn';
import { ingredientSlugFromNumeric, toIngredientDto } from '../notion/idMap';
import type { CheckInResponse } from '../notion/types';

const MOCK_WEIGHTS: { id: string; weight: number }[] = [
    { id: 'herb', weight: 4 },
    { id: 'leaf', weight: 4 },
    { id: 'drop', weight: 3 },
    { id: 'carrot', weight: 3 },
    { id: 'mushroom', weight: 2 },
    { id: 'seed', weight: 2 },
    { id: 'star', weight: 1 },
    { id: 'crystal', weight: 1 },
    { id: 'wind', weight: 1 },
    { id: 'ember', weight: 1 },
];

function pickMockRewardSlug(): string {
    const total = MOCK_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of MOCK_WEIGHTS) {
        roll -= item.weight;
        if (roll <= 0) {
            return item.id;
        }
    }
    return 'herb';
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
