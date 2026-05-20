import type { AppUserState } from './types';

export const DEFAULT_USER_STATE: AppUserState = {
    onboardingCompleted: false,
    onboarding: null,
    nickname: '사용자',
    teamId: 'rabbit',
    streakDays: 0,
    lastCheckInDate: null,
    weeklyMissionDone: 0,
    weeklyMissionTotal: 5,
    totalPoints: 0,
    missionProgress: {},
};
