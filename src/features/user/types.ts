export type MissionProgressStatus = 'available' | 'completed';

export type MissionProgress = {
    status: MissionProgressStatus;
    completedAt?: string;
    /** verify 즉시 지급된 재료 (slug) */
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

export type AppUserState = {
    onboardingCompleted: boolean;
    nickname: string;
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
