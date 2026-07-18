/**
 * 출석 API — BE `POST/GET /api/v1/check-in`
 */

import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { mockGetCheckInStatus, mockPostCheckIn } from './mock/checkInMock';
import { ingredientSlugFromNumeric } from './notion/idMap';
import type {
    BeCheckInResponse,
    BeCheckInStatusResponse,
    CheckInResponse,
    IngredientDto,
} from './notion/types';
import { API_PATHS } from './notion/types';

export type CheckInRequestContext = {
    lastCheckInDate: string | null;
    ingredientInventory: Record<string, number>;
    /** YYYY-MM-DD */
    today: string;
};

export type CheckInSuccessDto = {
    ingredientInventory: Record<string, number>;
    response: CheckInResponse;
    /** FE state key (slug) */
    ingredientId: string;
};

export type CheckInResult =
    | { ok: true; data: CheckInSuccessDto }
    | { ok: false; code: 'ALREADY_CHECKED_IN' | 'NETWORK_ERROR' };

function toIngredientDto(raw: IngredientDto): IngredientDto {
    return {
        id: Number(raw.id),
        name: raw.name,
        type: raw.type === 'HIDDEN' ? 'HIDDEN' : 'COMMON',
        imageUrl: raw.imageUrl,
    };
}

/** POST /api/v1/check-in */
export async function postCheckIn(ctx: CheckInRequestContext): Promise<CheckInResult> {
    if (!isApiEnabled()) {
        return mockPostCheckIn(ctx);
    }

    try {
        const data = await apiRequest<BeCheckInResponse>(API_PATHS.checkIn, { method: 'POST' });
        const dto = toIngredientDto(data.rewardedIngredient);
        const slug = ingredientSlugFromNumeric(dto.id) ?? `be-${dto.id}`;
        const prev = ctx.ingredientInventory[slug] ?? 0;
        return {
            ok: true,
            data: {
                ingredientInventory: {
                    ...ctx.ingredientInventory,
                    [slug]: prev + 1,
                },
                response: {
                    alreadyChecked: false,
                    rewardedIngredient: dto,
                },
                ingredientId: slug,
            },
        };
    } catch (error) {
        if (error instanceof ApiClientError && error.code === 'ALREADY_CHECKED_IN') {
            return { ok: false, code: 'ALREADY_CHECKED_IN' };
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}

/** GET /api/v1/check-in/status */
export async function getCheckInStatus(
    lastCheckInDate: string | null,
    today: string,
): Promise<CheckInResponse> {
    if (!isApiEnabled()) {
        return mockGetCheckInStatus(lastCheckInDate, today);
    }

    const data = await apiRequest<BeCheckInStatusResponse>(API_PATHS.checkInStatus);
    return { alreadyChecked: data.checkedIn };
}
