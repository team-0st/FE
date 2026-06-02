import {
    findMatchingRecipe,
    getFilledIngredientIds,
    isValidBrewFillCount,
    WEEKLY_SLOT_COUNT,
    HIDDEN_SLOT_COUNT,
    BEGINNER_SLOT_COUNT,
} from './recipes';

describe('recipes', () => {
    it('validates brew fill counts 2, 3, 4', () => {
        expect(isValidBrewFillCount(BEGINNER_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(WEEKLY_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(HIDDEN_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(5)).toBe(false);
    });

    it('matches weekly recipe slots', () => {
        const slots: (string | null)[] = ['herb', 'drop', 'leaf', null];
        expect(getFilledIngredientIds(slots)).toHaveLength(WEEKLY_SLOT_COUNT);
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('weekly-01');
    });

    it('matches beginner recipe with 2 slots', () => {
        const slots: (string | null)[] = ['herb', 'drop', null, null];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('beginner-warm');
    });

    it('matches hidden recipe with 4 slots', () => {
        const slots: (string | null)[] = ['star', 'herb', 'mushroom', 'drop'];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.kind).toBe('hidden');
    });
});
