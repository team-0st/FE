import { mockRollSoupCraft } from '@api/mock/soupCraftMock';
import type { Recipe } from '@api/mock/recipeTypes';

const weeklyRecipe: Recipe = {
    id: 'weekly-test',
    kind: 'weekly',
    name: '테스트 스프',
    hint: 'hint',
    ingredientIds: ['herb', 'drop', 'leaf'],
    slotCount: 3,
    ecoJamReward: 30,
};

const hiddenRecipe: Recipe = {
    id: 'hidden-test',
    kind: 'hidden',
    name: '히든 스프',
    hint: 'hint',
    ingredientIds: ['star', 'herb', 'mushroom', 'drop'],
    slotCount: 4,
    realRewardLabel: '쿠폰',
};

describe('mockRollSoupCraft', () => {
    it('returns FAIL with TRASH_ITEM when random is below success rate', () => {
        const craft = mockRollSoupCraft(weeklyRecipe, () => 0.95);
        expect(craft.result).toBe('FAIL');
        expect(craft.rewardType).toBe('TRASH_ITEM');
        expect(craft.rewardDescription).toBeTruthy();
    });

    it('returns SUCCESS with ECO_JAM when random is within success rate', () => {
        const craft = mockRollSoupCraft(weeklyRecipe, () => 0.5);
        expect(craft.result).toBe('SUCCESS');
        expect(craft.rewardType).toBe('ECO_JAM');
        expect(craft.rewardAmount).toBeGreaterThan(0);
    });

    it('returns SUCCESS with REAL_ITEM for hidden recipes', () => {
        const craft = mockRollSoupCraft(hiddenRecipe, () => 0.5);
        expect(craft.result).toBe('SUCCESS');
        expect(craft.rewardType).toBe('REAL_ITEM');
        expect(craft.rewardDescription).toBe('쿠폰');
    });
});
