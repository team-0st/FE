export type MissionProgressStatus = 'available' | 'pending_review' | 'completed';

export type MissionProgress = {
    status: MissionProgressStatus;
    submittedAt?: string;
    completedAt?: string;
    /** 승인 시 지급된 재료 (랜덤 풀에서 선택) */
    rewardIngredientId?: string;
};

export type AppUserState = {
    onboardingCompleted: boolean;
    nickname: string;
    shopId: string | null;
    streakDays: number;
    lastCheckInDate: string | null;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    ecoJam: number;
    ingredientInventory: Record<string, number>;
    completedRecipeIds: string[];
    missionProgress: Record<string, MissionProgress>;
};
