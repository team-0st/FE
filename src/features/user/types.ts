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

export type GachaHistoryEntry = {
    id: string;
    at: string;
    label: string;
    positive: boolean;
};

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

/** 미션 인증 촬영용 카메라 이용 동의 (OS 권한 요청 전) */
export type CameraConsent = 'granted' | 'declined';

export type AppUserState = {
    userId: number | null;
    /** 로컬 설치 식별용 레거시 값이며 BE 인증에는 사용하지 않음 */
    deviceId: string | null;
    onboardingCompleted: boolean;
    nickname: string;
    avatarId: string;
    phoneMasked: string | null;
    /** BE 계정 로그인용 `010-1234-5678`. 온보딩 완료 전에는 null */
    phoneNumber: string | null;
    almangPayoutConsent: AlmangPayoutConsent;
    almangConsentAt: string | null;
    /** 서비스 개인정보 처리방침·필수 수집 동의 시각 */
    privacyConsentAt: string | null;
    locationConsent: LocationConsent | null;
    locationConsentAt: string | null;
    /** 미션 카메라 촬영 앱 내 동의. null이면 촬영 전 고지 모달 */
    cameraConsent: CameraConsent | null;
    cameraConsentAt: string | null;
    shopId: string | null;
    lastCheckInDate: string | null;
    /** 출석한 날짜 키(YYYY-MM-DD). 주간 칸·연속 출석 계산용 */
    checkInDates: string[];
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    ecoJam: number;
    /** 미션으로 절감한 누적 탄소배출량(g) — FE 자체 환산치 */
    totalCo2ReductionGrams: number;
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
    gachaHistory: GachaHistoryEntry[];
    pendingRealRewards: PendingRealReward[];
    /** SNS 공유 리워드 수령일 — 있으면 계정당 1회 보상 완료 (YYYY-MM-DD) */
    lastShareRewardDate: string | null;
    /** 상단 「오늘의 레시피」 고정 카드에서 숨긴 레시피 id */
    hiddenTodayRecipePinId: string | null;
};
