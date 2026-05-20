import type { OnboardingResult } from '../../api/mock/onboardingTypes';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';

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
    teamId: AnimalTeamId | null;
    streakDays: number;
    lastCheckInDate: string | null;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    missionProgress: Record<string, MissionProgress>;
};
