import type { SoupCraftResponse } from '../../api/notion/types';

export type MissionProgressStatus = 'available' | 'pending_review' | 'completed' | 'rejected';

export type MissionProgress = {
    status: MissionProgressStatus;
    completionId?: number;
    submittedAt?: string;
    completedAt?: string;
    /** 승인 후 지급된 재료 (slug) */
    rewardIngredientId?: string;
};

export type PointsLedgerEntry = {
    id: string;
    at: string;
    label: string;
    delta: number;
};

export type EcoJamLedgerEntry = PointsLedgerEntry;

export type PendingRealReward = {
    id: string;
    recipeId: string;
    label: string;
    createdAt: string;
    status: 'pending_contact';
};

/** 알맹상점 매장 포인트 연동용 개인정보 동의 (앱 내 현금 지급 아님) */
export type AlmangPayoutConsent = 'granted' | 'declined';

/** 주변 제휴 상점 안내용 위치정보 동의 */
export type LocationConsent = 'granted' | 'declined';

export type AppUserState = {
    userId: number | null;
    deviceId: string | null;
    onboardingCompleted: boolean;
    nickname: string;
    phoneMasked: string | null;
    /** BE 온보딩용 `010-1234-5678`. 동의 시에만 저장 */
    phoneNumber: string | null;
    almangPayoutConsent: AlmangPayoutConsent;
    almangConsentAt: string | null;
    /** 서비스 개인정보 처리방침·필수 수집 동의 시각 */
    privacyConsentAt: string | null;
    locationConsent: LocationConsent | null;
    locationConsentAt: string | null;
    shopId: string | null;
    lastCheckInDate: string | null;
    /** 출석한 날짜 키(YYYY-MM-DD). 주간 칸·연속 출석 계산용 */
    checkInDates: string[];
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    ecoJam: number;
    ingredientInventory: Record<string, number>;
    completedRecipeIds: string[];
    /** 에코잼으로 해금한 히든 레시피 (완성 전 열람용) */
    unlockedRecipeIds: string[];
    /** 직전 스프 제작 — 리롤 1회용 */
    lastSoupSession: {
        recipeId: string;
        craft: SoupCraftResponse;
        rerollUsed: boolean;
    } | null;
    missionProgress: Record<string, MissionProgress>;
    ecoJamLedger: PointsLedgerEntry[];
    almangPointsLedger: PointsLedgerEntry[];
    pendingRealRewards: PendingRealReward[];
    /** SNS 공유 리워드 수령일 — 있으면 계정당 1회 보상 완료 (YYYY-MM-DD) */
    lastShareRewardDate: string | null;
    /** 상단 「오늘의 레시피」 고정 카드에서 숨긴 레시피 id */
    hiddenTodayRecipePinId: string | null;
};
