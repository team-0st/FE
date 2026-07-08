export type MissionProgressStatus = 'available' | 'pending_review' | 'completed' | 'rejected';

export type MissionProgress = {
    status: MissionProgressStatus;
    completionId?: number;
    submittedAt?: string;
    completedAt?: string;
    /** 승인 후 지급된 재료 (slug) */
    rewardIngredientId?: string;
};

export type EcoJamLedgerEntry = {
    id: string;
    at: string;
    label: string;
    delta: number;
};

export type PendingRealReward = {
    id: string;
    recipeId: string;
    label: string;
    createdAt: string;
    status: 'pending_contact';
};

/** 알맹 포인트 매장 지급용 개인정보 동의 */
export type AlmangPayoutConsent = 'granted' | 'declined';

export type AppUserState = {
    userId: number | null;
    deviceId: string | null;
    onboardingCompleted: boolean;
    nickname: string;
    phoneMasked: string | null;
    almangPayoutConsent: AlmangPayoutConsent;
    almangConsentAt: string | null;
    shopId: string | null;
    lastCheckInDate: string | null;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    ecoJam: number;
    ingredientInventory: Record<string, number>;
    completedRecipeIds: string[];
    missionProgress: Record<string, MissionProgress>;
    ecoJamLedger: EcoJamLedgerEntry[];
    pendingRealRewards: PendingRealReward[];
};
