import type { AppUserState } from './types';

export const DEFAULT_USER_STATE: AppUserState = {
    onboardingCompleted: false,
    nickname: '사용자',
    shopId: null,
    streakDays: 0,
    lastCheckInDate: null,
    weeklyMissionDone: 0,
    weeklyMissionTotal: 5,
    totalPoints: 0,
    missionProgress: {},
};
