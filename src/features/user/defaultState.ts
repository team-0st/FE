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
    ecoJam: 10,
    ingredientInventory: {
        herb: 1,
        carrot: 1,
        mushroom: 1,
        leaf: 1,
    },
    completedRecipeIds: [],
    missionProgress: {},
};
