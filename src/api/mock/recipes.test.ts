import {
    findMatchingRecipe,
    getFilledIngredientIds,
    isValidBrewFillCount,
    WEEKLY_SLOT_COUNT,
} from './recipes';

describe('recipes', () => {
    it('validates brew fill counts 2, 3, 4', () => {
        expect(isValidBrewFillCount(2)).toBe(true);
        expect(isValidBrewFillCount(3)).toBe(true);
        expect(isValidBrewFillCount(4)).toBe(true);
        expect(isValidBrewFillCount(5)).toBe(false);
    });

    it('matches weekly recipe slots', () => {
        const slots: (string | null)[] = ['herb', 'drop', 'leaf', null];
        expect(getFilledIngredientIds(slots)).toHaveLength(WEEKLY_SLOT_COUNT);
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('weekly-01');
    });
});
