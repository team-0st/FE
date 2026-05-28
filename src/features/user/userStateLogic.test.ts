import { DEFAULT_USER_STATE } from './defaultState';
import { approveMission, finishOnboarding, resetOnboarding } from './userStateLogic';
import type { AppUserState } from './types';

function stateWithProgress(): AppUserState {
    return {
        ...DEFAULT_USER_STATE,
        onboardingCompleted: true,
        shopId: 'shop-a',
        streakDays: 3,
        lastCheckInDate: '2026-05-19',
        weeklyMissionDone: 2,
        totalPoints: 100,
        ecoJam: 5,
        ingredientInventory: { herb: 9, carrot: 0, mushroom: 0, leaf: 0 },
        completedRecipeIds: ['weekly-soup'],
        missionProgress: { 'mission-1': { status: 'completed', submittedAt: '2026-05-18T00:00:00.000Z' } },
    };
}

describe('resetOnboarding', () => {
    it('returns default state and clears progress', () => {
        const next = resetOnboarding(stateWithProgress());
        expect(next).toEqual(DEFAULT_USER_STATE);
        expect(next.onboardingCompleted).toBe(false);
        expect(next.shopId).toBeNull();
        expect(next.completedRecipeIds).toEqual([]);
        expect(next.missionProgress).toEqual({});
    });
});

describe('approveMission', () => {
    it('grants a random ingredient from the mission pool', () => {
        const base = { ...DEFAULT_USER_STATE, ingredientInventory: {} };
        const next = approveMission(base, 'tumbler', () => 0);
        expect(next.missionProgress.tumbler?.status).toBe('completed');
        expect(next.missionProgress.tumbler?.rewardIngredientId).toBe('herb');
        expect(next.ingredientInventory.herb).toBe(1);
    });
});

describe('finishOnboarding', () => {
    it('marks onboarding complete and sets shop', () => {
        const next = finishOnboarding(DEFAULT_USER_STATE, 'shop-b');
        expect(next.onboardingCompleted).toBe(true);
        expect(next.shopId).toBe('shop-b');
    });
});
