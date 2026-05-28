import {
    findMatchingRecipe,
    getFilledIngredientIds,
    isValidBrewFillCount,
    slotsMatchRecipe,
    WEEKLY_INGREDIENT_COUNT,
} from './recipes';

describe('recipes brew slots', () => {
    it('accepts 3 or 4 filled ingredients only', () => {
        expect(isValidBrewFillCount(2)).toBe(false);
        expect(isValidBrewFillCount(3)).toBe(true);
        expect(isValidBrewFillCount(4)).toBe(true);
        expect(isValidBrewFillCount(5)).toBe(false);
    });

    it('matches weekly recipe with 3 slots', () => {
        const slots: (string | null)[] = ['herb', 'drop', 'leaf', null];
        expect(getFilledIngredientIds(slots)).toHaveLength(WEEKLY_INGREDIENT_COUNT);
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('weekly-calm');
        expect(recipe?.kind).toBe('weekly');
    });

    it('does not match weekly when 4 slots filled with weekly combo', () => {
        const slots: (string | null)[] = ['herb', 'drop', 'leaf', 'carrot'];
        const weeklyOnly = slotsMatchRecipe(
            slots,
            {
                id: 'weekly-calm',
                kind: 'weekly',
                name: 'test',
                hint: 'test',
                ingredientIds: ['herb', 'drop', 'leaf'],
            },
        );
        expect(weeklyOnly).toBe(false);
    });

    it('matches hidden recipe with 4 slots', () => {
        const slots: (string | null)[] = ['star', 'herb', 'mushroom', 'drop'];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('hidden-golden');
        expect(recipe?.kind).toBe('hidden');
    });
});
