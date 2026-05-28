import { rollSoupReward } from './soupRewardLogic';
import type { Recipe } from '@api/mock/recipes';

const weeklyRecipe: Recipe = {
    id: 'weekly-test',
    kind: 'weekly',
    name: '테스트 스프',
    hint: 'hint',
    ingredientIds: ['herb', 'drop', 'leaf'],
    ecoJamReward: 30,
};

const hiddenRecipe: Recipe = {
    id: 'hidden-test',
    kind: 'hidden',
    name: '히든 스프',
    hint: 'hint',
    ingredientIds: ['star', 'herb', 'mushroom', 'drop'],
    realRewardLabel: '쿠폰',
};

describe('rollSoupReward', () => {
    it('returns miss when random is below weekly miss rate', () => {
        const outcome = rollSoupReward(weeklyRecipe, () => 0.1);
        expect(outcome.kind).toBe('miss');
        expect(outcome.missMessage).toBeTruthy();
    });

    it('returns ecoJam when random is above weekly miss rate', () => {
        const outcome = rollSoupReward(weeklyRecipe, () => 0.85);
        expect(outcome.kind).toBe('ecoJam');
        expect(outcome.ecoJamAmount).toBeGreaterThan(0);
    });

    it('returns real reward for hidden when not miss', () => {
        const outcome = rollSoupReward(hiddenRecipe, () => 0.5);
        expect(outcome.kind).toBe('real');
        expect(outcome.realRewardLabel).toBe('쿠폰');
    });
});
