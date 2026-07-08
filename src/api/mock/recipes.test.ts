import {
    findMatchingRecipe,
    formatRecipeIngredients,
    getBeginnerRecipes,
    getFilledIngredientIds,
    isValidBrewFillCount,
    LEGENDARY_SLOT_COUNT,
    WEEKLY_SLOT_COUNT,
    HIDDEN_SLOT_COUNT,
    BEGINNER_SLOT_COUNT,
} from './recipes';

describe('recipes', () => {
    it('validates brew fill counts 2, 3, 4, 5', () => {
        expect(isValidBrewFillCount(BEGINNER_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(WEEKLY_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(HIDDEN_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(LEGENDARY_SLOT_COUNT)).toBe(true);
        expect(isValidBrewFillCount(6)).toBe(false);
    });

    it('matches weekly recipe slots', () => {
        const slots: (string | null)[] = ['cabbage', 'tomato', 'onion', null, null];
        expect(getFilledIngredientIds(slots)).toHaveLength(WEEKLY_SLOT_COUNT);
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('weekly-01');
    });

    it('matches beginner recipe with 2 slots', () => {
        const slots: (string | null)[] = ['tomato', 'onion', null, null, null];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.id).toBe('beginner-warm');
    });

    it('matches hidden recipe with 4 slots', () => {
        const slots: (string | null)[] = ['tomato', 'onion', 'mushroom', 'refill_crystal', null];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.kind).toBe('hidden');
    });

    it('matches legendary recipe with 5 slots', () => {
        const slots: (string | null)[] = [
            'cabbage',
            'tomato',
            'onion',
            'refill_crystal',
            'nature_sprout',
        ];
        const recipe = findMatchingRecipe(slots, []);
        expect(recipe?.kind).toBe('legendary');
    });

    it('formats public recipe ingredients for display', () => {
        const beginner = getBeginnerRecipes()[0];
        expect(formatRecipeIngredients(beginner!)).toContain('토마토');
        expect(formatRecipeIngredients(beginner!)).toContain('양파');
    });
});
