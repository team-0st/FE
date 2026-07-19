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
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    ecoJam: number;
    ingredientInventory: Record<string, number>;
    completedRecipeIds: string[];
    missionProgress: Record<string, MissionProgress>;
    ecoJamLedger: PointsLedgerEntry[];
    almangPointsLedger: PointsLedgerEntry[];
    pendingRealRewards: PendingRealReward[];
    /** SNS 공유 리워드 — 하루 1회 (YYYY-MM-DD) */
    lastShareRewardDate: string | null;
};
