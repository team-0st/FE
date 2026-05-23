import type { OnboardingResult } from '../../api/mock/onboardingTypes';

export type MissionProgressStatus = 'available' | 'pending_review' | 'completed';

export type MissionProgress = {
    status: MissionProgressStatus;
    submittedAt?: string;
    completedAt?: string;
};

export type AppUserState = {
    onboardingCompleted: boolean;
    onboarding: OnboardingResult | null;
    nickname: string;
    shopId: string | null;
    streakDays: number;
    lastCheckInDate: string | null;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    preSurveyDone: boolean;
    postSurveyDone: boolean;
    missionProgress: Record<string, MissionProgress>;
};
