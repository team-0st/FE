import type { AppUserState } from './types';
import { ECO_JAM_STARTING_BALANCE } from '../../shared/constants/ecoJamPolicy';

export const DEFAULT_USER_STATE: AppUserState = {
    userId: null,
    deviceId: null,
    onboardingCompleted: false,
    nickname: '사용자',
    phoneMasked: null,
    phoneNumber: null,
    almangPayoutConsent: 'declined',
    almangConsentAt: null,
    locationConsent: null,
    locationConsentAt: null,
    shopId: null,
    lastCheckInDate: null,
    weeklyMissionDone: 0,
    weeklyMissionTotal: 5,
    totalPoints: 0,
    ecoJam: ECO_JAM_STARTING_BALANCE,
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
    lastShareRewardDate: null,
};
