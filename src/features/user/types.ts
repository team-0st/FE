export type MissionProgressStatus = 'available' | 'pending_review' | 'completed';

export type MissionProgress = {
    status: MissionProgressStatus;
    submittedAt?: string;
    completedAt?: string;
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
