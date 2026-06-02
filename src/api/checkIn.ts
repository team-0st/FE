/**
 * 출석 API — 비즈니스 로직(하루 1회 검증, 랜덤 재료)은 백엔드 책임.
 * FE: 요청 · 응답 반영 · UI만 담당.
 */

export type CheckInRequestContext = {
    lastCheckInDate: string | null;
    streakDays: number;
    ingredientInventory: Record<string, number>;
    /** YYYY-MM-DD (클라이언트 오늘 날짜, BE에서 최종 검증) */
    today: string;
};

export type CheckInRewardDto = {
    ingredientId: string;
    quantity: number;
};

export type CheckInSuccessDto = {
    streakDays: number;
    reward: CheckInRewardDto;
    /** BE가 갱신한 보유 재료 스냅샷 (권장) */
    ingredientInventory: Record<string, number>;
    /** 출석 보너스 무료 가챠 횟수 (mock: 1) */
    gachaTicketsGranted?: number;
};

export type CheckInResult =
    | { ok: true; data: CheckInSuccessDto }
    | { ok: false; code: 'ALREADY_CHECKED_IN' | 'NETWORK_ERROR' };

import { mockPostCheckIn } from './mock/checkInMock';

/**
 * POST /check-in (경로는 BE 확정)
 * 지금은 mock만 연결. 실서비스에서는 fetch 구현으로 교체.
 */
export async function postCheckIn(ctx: CheckInRequestContext): Promise<CheckInResult> {
    return mockPostCheckIn(ctx);
}
