import { DEFAULT_USER_STATE } from './defaultState';
import { completeMissionVerify, finishOnboarding, resetOnboarding } from './userStateLogic';
import type { AppUserState } from './types';

function stateWithProgress(): AppUserState {
    return {
        ...DEFAULT_USER_STATE,
        onboardingCompleted: true,
        shopId: 'demo',
        lastCheckInDate: '2026-05-19',
        weeklyMissionDone: 2,
        totalPoints: 100,
        ecoJam: 5,
        ingredientInventory: { cabbage: 9, carrot: 0, mushroom: 0, tomato: 0 },
        completedRecipeIds: ['weekly-01'],
        missionProgress: { tumbler: { status: 'completed', completedAt: '2026-05-18T00:00:00.000Z' } },
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

describe('completeMissionVerify', () => {
    it('grants ingredient on verify', () => {
        const base = { ...DEFAULT_USER_STATE, ingredientInventory: {} };
        const next = completeMissionVerify(base, 'tumbler', 'cabbage');
        expect(next.missionProgress.tumbler?.status).toBe('completed');
        expect(next.missionProgress.tumbler?.rewardIngredientId).toBe('cabbage');
        expect(next.ingredientInventory.cabbage).toBe(1);
    });
});

describe('finishOnboarding', () => {
    it('marks onboarding complete and sets shop', () => {
        const next = finishOnboarding(DEFAULT_USER_STATE, 'almae');
        expect(next.onboardingCompleted).toBe(true);
        expect(next.shopId).toBe('almae');
    });
});
