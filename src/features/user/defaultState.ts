import type { AppUserState } from './types';

export const DEFAULT_USER_STATE: AppUserState = {
    userId: null,
    deviceId: null,
    onboardingCompleted: false,
    nickname: '사용자',
    phoneMasked: null,
    almangPayoutConsent: 'declined',
    almangConsentAt: null,
    shopId: null,
    lastCheckInDate: null,
    weeklyMissionDone: 0,
    weeklyMissionTotal: 5,
    totalPoints: 0,
    ecoJam: 10,
    ingredientInventory: {
        tomato: 1,
        onion: 1,
        carrot: 1,
        mushroom: 1,
        cabbage: 1,
    },
    completedRecipeIds: [],
    missionProgress: {},
    ecoJamLedger: [],
    pendingRealRewards: [],
};
