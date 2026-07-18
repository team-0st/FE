import {
    getAffordableRecipes,
    getRecommendedRecipes,
    getBeginnerRecipes,
    hasAffordableSecretRecipes,
    recipeToSlots,
    RECOMMEND_SECRET_RECIPE_NOTICE,
} from '@api/mock/recipes';
import { DEFAULT_USER_STATE } from '../user/defaultState';

describe('recipe recommendations', () => {
    it('lists public affordable recipes from default inventory', () => {
        const inventory = DEFAULT_USER_STATE.ingredientInventory;
        const recommended = getRecommendedRecipes(inventory, []);
        expect(recommended.length).toBeGreaterThan(0);
        expect(recommended.every((r) => r.kind === 'beginner' || r.kind === 'weekly')).toBe(true);
    });

    it('excludes hidden and legendary from recommendations', () => {
        const inventory = {
            tomato: 1,
            onion: 1,
            mushroom: 1,
            refill_crystal: 1,
        };
        const affordable = getAffordableRecipes(inventory, []);
        const recommended = getRecommendedRecipes(inventory, []);
        expect(affordable.some((r) => r.kind === 'hidden' || r.kind === 'legendary')).toBe(true);
        expect(recommended.some((r) => r.kind === 'hidden' || r.kind === 'legendary')).toBe(false);
    });

    it('detects affordable secret recipes for user notice', () => {
        const inventory = {
            tomato: 1,
            onion: 1,
            mushroom: 1,
            refill_crystal: 1,
        };
        expect(hasAffordableSecretRecipes(inventory, [])).toBe(true);
    });

    it('excludes completed recipes from recommendations', () => {
        const inventory = DEFAULT_USER_STATE.ingredientInventory;
        const recommended = getRecommendedRecipes(inventory, ['beginner-warm']);
        expect(recommended.some((r) => r.id === 'beginner-warm')).toBe(false);
    });

    it('fills slots from recipe ingredient ids', () => {
        const beginner = getBeginnerRecipes()[0]!;
        const slots = recipeToSlots(beginner);
        expect(slots.filter(Boolean)).toEqual(beginner.ingredientIds);
    });

    it('includes secret recipe notice copy', () => {
        expect(RECOMMEND_SECRET_RECIPE_NOTICE).toContain('히든');
        expect(RECOMMEND_SECRET_RECIPE_NOTICE).toContain('전설');
    });
});
