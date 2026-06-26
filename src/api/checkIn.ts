/**
 * 출석 API — 노션 `POST /api/check-in`, `GET /api/check-in/status`
 */

import type { CheckInResponse } from './notion/types';

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

import { mockGetCheckInStatus, mockPostCheckIn } from './mock/checkInMock';

/** POST /api/check-in */
export async function postCheckIn(ctx: CheckInRequestContext): Promise<CheckInResult> {
    return mockPostCheckIn(ctx);
}

/** GET /api/check-in/status */
export async function getCheckInStatus(
    lastCheckInDate: string | null,
    today: string,
): Promise<CheckInResponse> {
    return mockGetCheckInStatus(lastCheckInDate, today);
}
